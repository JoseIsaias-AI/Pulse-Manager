import { readFileSync } from 'fs';

const spaPsicologo = readFileSync('src/frontend/js/pages/spaPsicologo.js', 'utf8');
const comunicacao = readFileSync('src/frontend/js/pages/comunicacao.js', 'utf8');
const gestorHtml = readFileSync('src/frontend/pages/gestorApp.html', 'utf8');
const psicologoHtml = readFileSync('src/frontend/pages/psicologoApp.html', 'utf8');

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
});
