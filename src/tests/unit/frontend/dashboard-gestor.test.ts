import { readFileSync } from 'fs';
import { runInNewContext } from 'vm';

const dashboardScript = readFileSync(
  'src/frontend/js/pages/dashboardGestor.js',
  'utf8'
);

const impacto = {
  totalAlunos: 10,
  conectados: { valor: 5, percentual: 50 },
  capacitados: { valor: 3, percentual: 30 },
  transformados: { valor: 2, percentual: 20 },
  alunosEmpregados: { valor: 4, percentual: 40 },
  conclusaoProgramas: { valor: 3, percentual: 30 },
  acessoEnsinoSuperior: { valor: 2, percentual: 20 },
  porPrograma: [{ programa: 'Programa A', totalAlunos: 10 }]
};

const jornada = {
  totalAlunos: 10,
  evasao: { valor: 2, percentual: 20 },
  riscoAlto: { valor: 3, percentual: 30 },
  riscoMedio: { valor: 2, percentual: 20 },
  riscoBaixo: { valor: 5, percentual: 50 },
  porPrograma: [{ programa: 'Programa A', totalAlunos: 10, evadidos: 2, riscoAlto: 3 }]
};

function createContext(get: jest.Mock) {
  const elements = new Map<string, Record<string, unknown>>();
  const selector = (key: string) => {
    if (!elements.has(key)) elements.set(key, { textContent: '', hidden: false, className: '' });
    return elements.get(key);
  };

  class ChartMock {
    static defaults = { font: {} as Record<string, unknown> };
    static instances: ChartMock[] = [];
    data: Record<string, any>;
    update = jest.fn();

    constructor(_canvas: unknown, config: Record<string, any>) {
      this.data = config.data;
      ChartMock.instances.push(this);
    }
  }

  const context: Record<string, any> = {
    Chart: ChartMock,
    console,
    document: {
      getElementById: (id: string) => ({ id }),
      querySelector: selector
    },
    PulseApi: { get }
  };
  context.window = context;
  return { context, elements, ChartMock };
}

async function flushPromises() {
  await new Promise((resolve) => setImmediate(resolve));
}

describe('Dashboard do gestor com HTTP central', () => {
  it('carrega os resumos e atualiza cards e graficos', async () => {
    const get = jest.fn((path: string) => Promise.resolve({
      data: path === '/impacto/resumo' ? impacto : jornada
    }));
    const { context, elements, ChartMock } = createContext(get);

    runInNewContext(dashboardScript, context);
    await flushPromises();

    expect(get).toHaveBeenCalledWith('/impacto/resumo');
    expect(get).toHaveBeenCalledWith('/jornada/resumo');
    expect(elements.get('[data-dashboard-value="ativos"]')?.textContent).toBe(10);
    expect(elements.get('[data-dashboard-value="empregados"]')?.textContent).toBe(4);
    expect(elements.get('[data-dashboard-status]')?.hidden).toBe(true);
    expect(ChartMock.instances[0].data.datasets[0].data).toEqual([10]);
    expect(ChartMock.instances[1].data.datasets[0].data).toEqual([3]);
    expect(ChartMock.instances[2].data.datasets[0].data).toEqual([5, 3, 2]);
  });

  it('exibe feedback sem quebrar quando a API falha', async () => {
    const get = jest.fn().mockRejectedValue(new Error('API indisponivel.'));
    const { context, elements } = createContext(get);

    runInNewContext(dashboardScript, context);
    await flushPromises();

    expect(elements.get('[data-dashboard-status]')).toMatchObject({
      textContent: 'API indisponivel.',
      hidden: false,
      className: 'dashboard-feedback dashboard-feedback--error'
    });
  });
});
