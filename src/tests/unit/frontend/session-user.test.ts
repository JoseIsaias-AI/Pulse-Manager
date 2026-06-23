import { readFileSync } from 'fs';
import { runInNewContext } from 'vm';

const script = readFileSync('src/frontend/js/services/sessionUser.js', 'utf8');

function loadDisplayUser(storedValue: string | null) {
  const context: Record<string, any> = {
    sessionStorage: {
      getItem: jest.fn().mockReturnValue(storedValue)
    }
  };
  context.window = context;
  runInNewContext(script, context);
  return context.getPulseDisplayUser;
}

describe('Dados visuais da sessao', () => {
  it('usa nome, perfil e iniciais do pulseUser', () => {
    const getDisplayUser = loadDisplayUser(JSON.stringify({
      nome: 'Maria da Silva',
      perfil: 'psicologo'
    }));

    expect(getDisplayUser({ name: 'Fallback', role: 'Gestor', initials: 'FB' })).toEqual({
      name: 'Maria da Silva',
      role: 'Psicólogo',
      initials: 'MS'
    });
  });

  it('mantem o config como fallback quando nao existe sessao', () => {
    const getDisplayUser = loadDisplayUser(null);

    expect(getDisplayUser({ name: 'Vitória Brandão', role: 'Gestor', initials: 'VB' })).toEqual({
      name: 'Vitória Brandão',
      role: 'Gestor',
      initials: 'VB'
    });
  });
});
