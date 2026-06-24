import { readFileSync } from 'fs';

const spaPsicologo = readFileSync('src/frontend/js/pages/spaPsicologo.js', 'utf8');
const comunicacao = readFileSync('src/frontend/js/pages/comunicacao.js', 'utf8');
const gestorHtml = readFileSync('src/frontend/pages/gestorApp.html', 'utf8');
const psicologoHtml = readFileSync('src/frontend/pages/psicologoApp.html', 'utf8');
const alunoHtml = readFileSync('src/frontend/pages/alunoApp.html', 'utf8');
const configuracoes = readFileSync('src/frontend/js/components/configuracoesFrontend.js', 'utf8');
const spaGestor = readFileSync('src/frontend/js/pages/spaGestor.js', 'utf8');

describe('Integrações concluídas de histórico e comunicação', () => {
  it('usa data.alunos na lista real do psicólogo', () => {
    expect(spaPsicologo).toContain('resposta.data.alunos');
    expect(spaPsicologo).not.toContain('Array.isArray(resposta.data) ? resposta.data : []');
  });

  it('normaliza destinatários pelo contrato data.alunos', () => {
    expect(comunicacao).toContain('Array.isArray(resposta.data.alunos)');
    expect(comunicacao).toContain("window.PulseApi.get('/alunos'");
  });

  it('integra listagem e criação de comunicações e oportunidades', () => {
    expect(comunicacao).toContain("window.PulseApi.get('/comunicacao')");
    expect(comunicacao).toContain("window.PulseApi.post('/comunicacao'");
    expect(comunicacao).toContain("window.PulseApi.get('/comunicacao/oportunidades')");
    expect(comunicacao).toContain("window.PulseApi.post('/comunicacao/oportunidades'");
    expect(comunicacao).toContain('Carregando comunicações...');
    expect(comunicacao).toContain('Comunicação enviada com sucesso.');
  });

  it('carrega a central nos portais de gestor e psicólogo', () => {
    expect(gestorHtml).toContain('../js/pages/comunicacao.js');
    expect(psicologoHtml).toContain('../js/pages/comunicacao.js');
  });

  it('carrega configuracoes compartilhadas nos tres portais', () => {
    [gestorHtml, psicologoHtml, alunoHtml].forEach((html) => {
      expect(html).toContain('../js/components/configuracoesFrontend.js');
      expect(html.indexOf('../js/services/sessionUser.js')).toBeLessThan(
        html.indexOf('../js/components/configuracoesFrontend.js')
      );
    });
    expect(configuracoes).toContain("updates.id = 'view-atualizacoes'");
    expect(configuracoes).toContain("settings.id = 'view-configuracoes'");
  });

  it('limita programas e mantem ocupacao como campo livre', () => {
    expect(spaGestor).toContain("['Mentoria', 'nao_informado', 'Programa Pulse Mais']");
    expect(gestorHtml).toContain('id="pf-ocupacao" data-pf-field="ocupacao"');
    expect(gestorHtml).not.toContain('id="pf-ocupacao" data-pf-field="ocupacao" data-pf-option-field');
  });
});
