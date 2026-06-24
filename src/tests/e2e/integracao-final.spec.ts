import { expect, Page, test } from '@playwright/test';

const API_BASE = 'http://localhost:3100/api';

const USERS = {
  gestor: {
    email: 'helena.duarte@pulsemais.org',
    nome: 'Helena Duarte',
    perfil: 'gestor',
    destino: /gestorApp\.html/
  },
  psicologo: {
    email: 'isadora.valenca@pulsemais.org',
    nome: 'Isadora Valença',
    perfil: 'psicologo',
    destino: /psicologoApp\.html/
  },
  aluno: {
    email: 'mariana.costa@local.pulsemais.org',
    nome: 'Mariana Costa',
    perfil: 'aluno',
    destino: /alunoApp\.html/
  }
} as const;

const ROLE_BUTTON_LABEL: Record<string, RegExp> = {
  gestor: /^Gestor$/,
  psicologo: /^Psicólogo$/,
  aluno: /^Aluno$/
};

async function configureApi(page: Page) {
  await page.addInitScript((apiBase) => {
    window.PULSE_API_BASE = apiBase;
  }, API_BASE);
}

async function configureSession(page: Page, user: { id: number; email: string; nome: string; perfil: string }) {
  await configureApi(page);
  await page.addInitScript((pulseUser) => {
    sessionStorage.setItem('pulseUser', JSON.stringify(pulseUser));
  }, user);
}

async function login(page: Page, user: (typeof USERS)[keyof typeof USERS]) {
  await configureApi(page);
  await page.goto('/pages/login.html');
  await page.getByRole('button', { name: ROLE_BUTTON_LABEL[user.perfil] }).click();
  await page.locator('#email').fill(user.email);
  await page.locator('#nome').fill(user.nome);
  await page.locator('#btn-entrar').click();
  await expect(page).toHaveURL(user.destino);
  await expect.poll(async () => page.evaluate(() => sessionStorage.getItem('pulseUser'))).toContain(user.email);
  await page.waitForFunction(() => typeof window.__onMenuNav === 'function');
}

async function goToView(page: Page, view: string) {
  await page.waitForSelector(`.menuLateral__item[data-page="${view}"]`);
  await page.locator(`.menuLateral__item[data-page="${view}"]`).click();
  await expect(page).toHaveURL(new RegExp(`view=${view}`));
  await expect(page.locator(`#view-${view}`)).toBeVisible();
}

test.describe('Fluxo do gestor', () => {
  test('login, dashboard, lista de alunos e erro de API', async ({ page }) => {
    await login(page, USERS.gestor);

    await goToView(page, 'dashboard');
    await expect(page.locator('#view-dashboard')).toBeVisible();
    await expect(page.locator('#view-dashboard .page-header p')).toContainText(/alunos/i);
    await expect(page.locator('#g-funnelChart')).toBeVisible();

    await goToView(page, 'alunos');
    await expect(page.locator('#view-alunos')).toBeVisible();
    await expect(page.locator('.al-card, .aluno-card, [data-aluno-id]').first()).toBeVisible();

    const failingPage = await page.context().newPage();
    await configureSession(failingPage, { id: 1, email: 'helena.duarte@pulsemais.org', nome: 'Helena Duarte', perfil: 'gestor' });
    await failingPage.route('**/api/alunos**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, data: null, message: 'Falha simulada de alunos' })
      });
    });
    await failingPage.goto('/pages/gestorApp.html?view=alunos');
    await failingPage.waitForFunction(() => typeof window.__onMenuNav === 'function');
    await goToView(failingPage, 'alunos');
    await expect(failingPage.getByText(/Falha simulada de alunos|não foi possível|nao foi possivel/i)).toBeVisible();
    await failingPage.close();
  });
});

test.describe('Fluxo do psicólogo', () => {
  test('login, dashboard, histórico, solicitações e falha da API', async ({ page }) => {
    await login(page, USERS.psicologo);

    await goToView(page, 'dashboard');
    await expect(page.locator('#view-dashboard')).toBeVisible();
    await expect(page.locator('#view-dashboard .db-kpi-label').filter({ hasText: /Alunos acompanhados/i })).toBeVisible();
    await expect(page.locator('#view-dashboard .db-kpi-label').filter({ hasText: /Atendimentos realizados/i })).toBeVisible();
    await expect(page.locator('#db-bestar-chart')).toBeVisible();

    await goToView(page, 'alunos');
    await expect(page.locator('#view-alunos')).toBeVisible();
    await expect(page.locator('.al-card, .psi-aluno-card, [data-student-id]').first()).toBeVisible();

    const prontuarios = await page.request.get(`${API_BASE}/prontuarios`, {
      headers: { 'x-user-role': 'psicologo', 'x-user-id': '1' }
    });
    expect(prontuarios.ok()).toBeTruthy();
    expect(await prontuarios.json()).toMatchObject({ success: true });

    const solicitacoes = await page.request.get(`${API_BASE}/apoio/solicitacoes`, {
      headers: { 'x-user-role': 'psicologo', 'x-user-id': '1' }
    });
    expect(solicitacoes.ok()).toBeTruthy();
    const solicitacoesBody = await solicitacoes.json();
    expect(solicitacoesBody.success).toBe(true);
    expect(Array.isArray(solicitacoesBody.data)).toBe(true);

    const failingPage = await page.context().newPage();
    await configureSession(failingPage, { id: 1, email: 'isadora.valenca@pulsemais.org', nome: 'Isadora Valença', perfil: 'psicologo' });
    await failingPage.route('**/api/psicologo/dashboard/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, data: null, message: 'Falha simulada do dashboard psicologico' })
      });
    });
    await failingPage.goto('/pages/psicologoApp.html?view=dashboard');
    await failingPage.waitForFunction(() => typeof window.__onMenuNav === 'function');
    await goToView(failingPage, 'dashboard');
    await expect(failingPage.getByText(/Falha simulada do dashboard psicologico|Nao foi possivel|não foi possível/i)).toBeVisible();
    await expect(failingPage.locator('#view-dashboard')).toBeVisible();
    await failingPage.close();
  });
});

test.describe('Fluxo do aluno', () => {
  test('login, perfil, jornada, agenda e solicitação de apoio sem duplo envio', async ({ page }) => {
    await login(page, USERS.aluno);

    await expect(page.locator('.menuLateral__user')).toContainText(/Mariana Costa/i);

    await goToView(page, 'dashboard');
    await expect(page.locator('#view-dashboard')).toBeVisible();
    await expect(page.getByText(/média calculada pelos registros reais/i)).toBeVisible();
    await expect(page.locator('#a-barChart')).toBeVisible();

    await goToView(page, 'agenda');
    await expect(page.locator('#view-agenda')).toBeVisible();
    await expect(page.locator('#ag-cal').getByText(/Mentoria de carreira/i).first()).toBeVisible();
    await expect(page.getByText(/cancelado/i)).toHaveCount(0);

    await goToView(page, 'inicio');
    const apoioRequests: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/apoio/solicitar')) {
        apoioRequests.push(request.postData() || '');
      }
    });
    await page.locator('#apoio-mensagem').fill('Preciso conversar com um psicólogo sobre ansiedade.');
    const button = page.getByRole('button', { name: /solicitar apoio/i });
    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/api/apoio/solicitar') && response.request().method() === 'POST'),
      button.dblclick()
    ]);
    await expect(page.getByText(/Solicitação enviada|Solicitacao enviada/i)).toBeVisible();
    expect(apoioRequests).toHaveLength(1);
    expect(apoioRequests[0]).not.toContain('idAluno');
  });
});

test.describe('Estados gerais', () => {
  test('loading, erro e vazio aparecem em telas integradas', async ({ page }) => {
    await configureSession(page, { id: 1, email: 'isadora.valenca@pulsemais.org', nome: 'Isadora Valença', perfil: 'psicologo' });
    let releaseDashboard: (() => void) | undefined;
    await page.route('**/api/psicologo/dashboard/**', async (route) => {
      await new Promise<void>((resolve) => {
        releaseDashboard = resolve;
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            idPsicologo: 1,
            totalAtendimentos: 0,
            alunosEmRisco: 0,
            evolucaoAtendimentos: [],
            indicadoresSaudeMental: {
              totalAlunosAcompanhados: 0,
              totalLabels: 0,
              labelsPorTipo: {},
              alunosPorStatus: {}
            }
          },
          message: 'Dashboard vazio.'
        })
      });
    });

    await page.goto('/pages/psicologoApp.html?view=dashboard');
    await page.waitForFunction(() => typeof window.__onMenuNav === 'function');
    await goToView(page, 'dashboard');
    await expect(page.getByText(/Carregando dashboard psicologico/i)).toBeVisible();
    releaseDashboard?.();
    await expect(page.getByText(/Ainda nao ha dados de saude mental/i)).toBeVisible();

    const alunoPage = await page.context().newPage();
    await configureSession(alunoPage, { id: 1, email: 'mariana.costa@local.pulsemais.org', nome: 'Mariana Costa', perfil: 'aluno' });
    await alunoPage.route('**/api/jornada/alunos/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, data: null, message: 'Falha simulada de jornada' })
      });
    });
    await alunoPage.goto('/pages/alunoApp.html?view=dashboard');
    await alunoPage.waitForFunction(() => typeof window.__onMenuNav === 'function');
    await goToView(alunoPage, 'dashboard');
    await expect(alunoPage.getByText(/Falha simulada de jornada/i)).toBeVisible();
    await alunoPage.close();
  });
});
