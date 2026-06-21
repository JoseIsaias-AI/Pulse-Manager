import { registrarConsultaDashboard } from '../integrations/dashboardAuditoriaIntegration';
import { AlunoRecord } from '../repositories/alunoRepository';
import {
  DashboardFiltroQuery,
  DashboardImpactoData,
  DashboardJornadaData,
  ImpactoProgramaItem,
  IndicadorResumo,
  JornadaProgramaItem
} from '../models/dashboardModel';
import { DashboardRepository } from '../repositories/dashboardRepository';
import { BusinessRuleError, PayloadValidationError } from '../utils/errors';

interface EndpointResponse<T> {
  success: true;
  data: T;
}

function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isDateStringValida(valor: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(new Date(valor).getTime());
}

function percentual(valor: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Number(((valor / total) * 100).toFixed(2));
}

function indicador(valor: number, total: number): IndicadorResumo {
  return { valor, percentual: percentual(valor, total) };
}

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async obterResumoImpacto(
    filtros: DashboardFiltroQuery
  ): Promise<EndpointResponse<DashboardImpactoData>> {
    const { filtrosValidados, resumo } = await this.montarResumoImpacto(filtros);
    await this.auditar('/api/impacto/resumo', filtrosValidados, resumo.totalAlunos);

    return { success: true, data: resumo };
  }

  async obterResumoJornada(
    filtros: DashboardFiltroQuery
  ): Promise<EndpointResponse<DashboardJornadaData>> {
    const { filtrosValidados, resumo } = await this.montarResumoJornada(filtros);
    await this.auditar('/api/jornada/resumo', filtrosValidados, resumo.totalAlunos);

    return { success: true, data: resumo };
  }

  async consultarAlunosEmpregados(
    filtros: DashboardFiltroQuery
  ): Promise<EndpointResponse<IndicadorResumo>> {
    const { filtrosValidados, resumo } = await this.montarResumoImpacto(filtros);
    await this.auditar('/api/impacto/alunos-empregados', filtrosValidados, resumo.totalAlunos);
    return { success: true, data: resumo.alunosEmpregados };
  }

  async consultarConclusaoProgramas(
    filtros: DashboardFiltroQuery
  ): Promise<EndpointResponse<IndicadorResumo>> {
    const { filtrosValidados, resumo } = await this.montarResumoImpacto(filtros);
    await this.auditar('/api/impacto/conclusao-programas', filtrosValidados, resumo.totalAlunos);
    return { success: true, data: resumo.conclusaoProgramas };
  }

  async consultarAcessoEnsinoSuperior(
    filtros: DashboardFiltroQuery
  ): Promise<EndpointResponse<IndicadorResumo>> {
    const { filtrosValidados, resumo } = await this.montarResumoImpacto(filtros);
    await this.auditar(
      '/api/impacto/acesso-ensino-superior',
      filtrosValidados,
      resumo.totalAlunos
    );
    return { success: true, data: resumo.acessoEnsinoSuperior };
  }

  async consultarEvasaoRisco(
    filtros: DashboardFiltroQuery
  ): Promise<EndpointResponse<Omit<DashboardJornadaData, 'porPrograma'>>> {
    const { filtrosValidados, resumo } = await this.montarResumoJornada(filtros);
    await this.auditar('/api/jornada/evasao-risco', filtrosValidados, resumo.totalAlunos);
    const { porPrograma: _porPrograma, ...resumoSemPrograma } = resumo;
    return { success: true, data: resumoSemPrograma };
  }

  private async montarResumoImpacto(
    filtros: DashboardFiltroQuery
  ): Promise<{ filtrosValidados: DashboardFiltroQuery; resumo: DashboardImpactoData }> {
    const filtrosValidados = this.validarFiltros(filtros);
    const alunos = await this.dashboardRepository.listarAlunosParaDashboard(filtrosValidados);
    const resumo = this.calcularImpacto(alunos);
    return { filtrosValidados, resumo };
  }

  private async montarResumoJornada(
    filtros: DashboardFiltroQuery
  ): Promise<{ filtrosValidados: DashboardFiltroQuery; resumo: DashboardJornadaData }> {
    const filtrosValidados = this.validarFiltros(filtros);
    const alunos = await this.dashboardRepository.listarAlunosParaDashboard(filtrosValidados);
    const resumo = this.calcularJornada(alunos);
    return { filtrosValidados, resumo };
  }

  private async auditar(
    endpoint: string,
    filtrosValidados: DashboardFiltroQuery,
    totalAlunos: number
  ): Promise<void> {
    await registrarConsultaDashboard({
      fluxo: 'UC-14',
      endpoint,
      filtros: filtrosValidados,
      total: totalAlunos
    });
  }

  private validarFiltros(filtros: DashboardFiltroQuery): DashboardFiltroQuery {
    if (filtros.programa !== undefined && filtros.programa.trim().length < 3) {
      throw new PayloadValidationError(
        'O parametro programa deve ter pelo menos 3 caracteres quando informado.'
      );
    }

    if (filtros.categoria !== undefined && filtros.categoria.trim().length < 3) {
      throw new PayloadValidationError(
        'O parametro categoria deve ter pelo menos 3 caracteres quando informado.'
      );
    }

    if (filtros.dataInicio && !isDateStringValida(filtros.dataInicio)) {
      throw new PayloadValidationError(
        'O parametro dataInicio deve estar no formato YYYY-MM-DD.'
      );
    }

    if (filtros.dataFim && !isDateStringValida(filtros.dataFim)) {
      throw new PayloadValidationError('O parametro dataFim deve estar no formato YYYY-MM-DD.');
    }

    if (filtros.dataInicio && filtros.dataFim && filtros.dataFim < filtros.dataInicio) {
      throw new BusinessRuleError('A dataFim nao pode ser anterior a dataInicio.');
    }

    return filtros;
  }

  private calcularImpacto(alunos: AlunoRecord[]): DashboardImpactoData {
    const totalAlunos = alunos.length;
    const conectados = alunos.filter((aluno) => this.isCategoriaImpacto(aluno, 'conectado')).length;
    const capacitados = alunos.filter((aluno) => this.isCategoriaImpacto(aluno, 'capacitado')).length;
    const transformados = alunos.filter((aluno) => this.isCategoriaImpacto(aluno, 'transformado')).length;
    const alunosEmpregados = alunos.filter((aluno) => this.isAlunoEmpregado(aluno)).length;
    const conclusaoProgramas = alunos.filter((aluno) => this.isConcluinte(aluno)).length;
    const acessoEnsinoSuperior = alunos.filter((aluno) => this.isEnsinoSuperior(aluno)).length;

    const porProgramaMap = new Map<string, ImpactoProgramaItem>();

    alunos.forEach((aluno) => {
      const programa = aluno.programa || 'Sem programa';
      const atual = porProgramaMap.get(programa) || {
        programa,
        totalAlunos: 0,
        empregados: 0,
        concluintes: 0,
        ensinoSuperior: 0
      };

      atual.totalAlunos += 1;
      if (this.isAlunoEmpregado(aluno)) atual.empregados += 1;
      if (this.isConcluinte(aluno)) atual.concluintes += 1;
      if (this.isEnsinoSuperior(aluno)) atual.ensinoSuperior += 1;

      porProgramaMap.set(programa, atual);
    });

    return {
      totalAlunos,
      conectados: indicador(conectados, totalAlunos),
      capacitados: indicador(capacitados, totalAlunos),
      transformados: indicador(transformados, totalAlunos),
      alunosEmpregados: indicador(alunosEmpregados, totalAlunos),
      conclusaoProgramas: indicador(conclusaoProgramas, totalAlunos),
      acessoEnsinoSuperior: indicador(acessoEnsinoSuperior, totalAlunos),
      porPrograma: Array.from(porProgramaMap.values()).sort((a, b) =>
        a.programa.localeCompare(b.programa)
      )
    };
  }

  private isCategoriaImpacto(
    aluno: AlunoRecord,
    categoria: 'conectado' | 'capacitado' | 'transformado'
  ): boolean {
    return normalizarTexto(aluno.categoria || '').includes(categoria);
  }

  private calcularJornada(alunos: AlunoRecord[]): DashboardJornadaData {
    const totalAlunos = alunos.length;
    const evasao = alunos.filter((aluno) => this.isEvadido(aluno)).length;
    const riscoAlto = alunos.filter((aluno) => aluno.riscoEvasao === 'alto').length;
    const riscoMedio = alunos.filter((aluno) => aluno.riscoEvasao === 'medio').length;
    const riscoBaixo = alunos.filter((aluno) => aluno.riscoEvasao === 'baixo').length;

    const porProgramaMap = new Map<string, JornadaProgramaItem>();

    alunos.forEach((aluno) => {
      const programa = aluno.programa || 'Sem programa';
      const atual = porProgramaMap.get(programa) || {
        programa,
        totalAlunos: 0,
        evadidos: 0,
        riscoAlto: 0
      };

      atual.totalAlunos += 1;
      if (this.isEvadido(aluno)) atual.evadidos += 1;
      if (aluno.riscoEvasao === 'alto') atual.riscoAlto += 1;

      porProgramaMap.set(programa, atual);
    });

    return {
      totalAlunos,
      evasao: indicador(evasao, totalAlunos),
      riscoAlto: indicador(riscoAlto, totalAlunos),
      riscoMedio: indicador(riscoMedio, totalAlunos),
      riscoBaixo: indicador(riscoBaixo, totalAlunos),
      porPrograma: Array.from(porProgramaMap.values()).sort((a, b) =>
        a.programa.localeCompare(b.programa)
      )
    };
  }

  private isAlunoEmpregado(aluno: AlunoRecord): boolean {
    if (!aluno.ocupacao) {
      return false;
    }

    const ocupacao = normalizarTexto(aluno.ocupacao);

    if (
      ocupacao.includes('buscando_emprego') ||
      ocupacao.includes('desempregado') ||
      ocupacao.includes('desempregada') ||
      ocupacao.includes('procurando')
    ) {
      return false;
    }

    const chavesEmprego = ['empregado', 'empregada', 'trabalhando', 'autonomo', 'freelancer'];
    return chavesEmprego.some((chave) => ocupacao.includes(chave));
  }

  private isConcluinte(aluno: AlunoRecord): boolean {
    if (aluno.status === 'egresso') {
      return true;
    }

    if (!aluno.categoria) {
      return false;
    }

    return normalizarTexto(aluno.categoria).includes('egresso');
  }

  private isEnsinoSuperior(aluno: AlunoRecord): boolean {
    if (!aluno.escolaridade) {
      return false;
    }

    const escolaridade = normalizarTexto(aluno.escolaridade);
    return (
      escolaridade.includes('ensino_superior') ||
      escolaridade.includes('superior') ||
      escolaridade.includes('graduacao') ||
      escolaridade.includes('faculdade') ||
      escolaridade.includes('universitario')
    );
  }

  private isEvadido(aluno: AlunoRecord): boolean {
    return aluno.status === 'desligado' || aluno.status === 'inativo';
  }
}
