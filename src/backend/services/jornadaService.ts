import { AtividadeRecord, ParticipacaoRecord } from '../repositories/jornadaRepository';
import {
  AtualizarEmpregabilidadePayload,
  AtualizarEnsinoSuperiorPayload,
  JornadaAlunoResponseData,
  JornadaParticipacaoView,
  RegistrarAnotacaoQualitativaPayload,
  RegistrarFrequenciaPayload,
  RegistrarParticipacaoPayload
} from '../models/jornadaModel';
import { JornadaRepository } from '../repositories/jornadaRepository';
import { BusinessRuleError, ConflictError, NotFoundError, PayloadValidationError } from '../utils/errors';
import { RiscoEvasaoService } from './riscoEvasaoService';

interface SuccessResponse<T> {
  success: true;
  data: T;
}

function isDateStringValida(valor: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(new Date(valor).getTime());
}

function toDateISO(valor?: string): string {
  return valor ?? new Date().toISOString().slice(0, 10);
}

function toParticipacaoView(item: ParticipacaoRecord): JornadaParticipacaoView {
  return {
    idPart: item.idPart,
    idAtividade: item.idAtividade,
    tituloAtividade: item.atividade?.titulo || 'Atividade sem titulo',
    tipoAtividade: (item.atividade?.tipo || 'curso') as JornadaParticipacaoView['tipoAtividade'],
    dataPart: item.dataPart,
    statusPart: item.statusPart,
    nota: item.nota
  };
}

const TIPOS_ATIVIDADE_VALIDOS = ['aula', 'mentoria', 'workshop', 'evento', 'avaliacao', 'curso', 'outro'];

export class JornadaService {
  constructor(
    private readonly repository: JornadaRepository,
    private readonly riscoEvasaoService?: Pick<RiscoEvasaoService, 'recalcularAluno'>
  ) { }

  async listarAtividades(tipo?: string): Promise<SuccessResponse<{ atividades: AtividadeRecord[] }>> {
    if (tipo && !TIPOS_ATIVIDADE_VALIDOS.includes(tipo)) {
      throw new PayloadValidationError('O campo tipo deve ser um tipo de atividade valido.');
    }

    const atividades = await this.repository.listAtividades(tipo);
    return { success: true, data: { atividades } };
  }

  async obterJornadaAluno(idAluno: number): Promise<SuccessResponse<JornadaAlunoResponseData>> {
    this.validarId(idAluno, 'idAluno');

    const aluno = await this.repository.findAlunoById(idAluno);
    if (!aluno) {
      throw new NotFoundError('Aluno nao encontrado para consolidacao da jornada.');
    }

    const [participacoes, anotacoes] = await Promise.all([
      this.repository.listParticipacoesByAluno(idAluno),
      this.repository.listAnotacoesByAluno(idAluno)
    ]);

    const frequencias = participacoes
      .filter((item) => item.atividade?.tipo === 'aula')
      .map(toParticipacaoView);
    const participacoesEventos = participacoes
      .filter((item) => item.atividade?.tipo !== 'aula')
      .map(toParticipacaoView);

    return {
      success: true,
      data: {
        aluno: {
          idAluno: aluno.idAluno,
          nome: aluno.nome,
          email: aluno.email,
          programa: aluno.programa || 'Sem programa',
          categoria: aluno.categoria || aluno.nivelJornada || aluno.status,
          status: aluno.status,
          riscoEvasao: aluno.riscoEvasao
        },
        empregabilidade: {
          ocupacao: aluno.ocupacao,
          tipoVinculoEmpregaticio: aluno.tipoVinculoEmpregaticio,
          rendaMensal: aluno.rendaMensal
        },
        ensinoSuperior: {
          escolaridade: aluno.escolaridade,
          instituicaoEnsinoSuperior: aluno.instituicaoEnsinoSuperior,
          cursoEnsinoSuperior: aluno.cursoEnsinoSuperior,
          statusEnsinoSuperior: aluno.statusEnsinoSuperior,
          dataIngressoEnsinoSuperior: aluno.dataIngressoEnsinoSuperior
        },
        frequencias,
        participacoesEventos,
        anotacoesQualitativas: anotacoes.map((item) => ({
          idAnotacao: item.idAnotacao,
          titulo: item.titulo,
          descricao: item.descricao,
          autor: item.autor,
          dataRegistro: item.dataRegistro
        }))
      }
    };
  }

  async registrarFrequencia(
    payload: RegistrarFrequenciaPayload
  ): Promise<SuccessResponse<{ registro: ParticipacaoRecord; operacao: 'criado' | 'atualizado' }>> {
    const aluno = await this.validarAluno(payload.idAluno);
    const atividade = await this.validarAtividade(payload.idAtividade);
    this.validarNota(payload.nota);

    if (atividade.tipo !== 'aula') {
      throw new BusinessRuleError('A atividade informada nao e do tipo aula para registro de frequencia.');
    }

    const dataPart = toDateISO(payload.dataPart);
    if (!isDateStringValida(dataPart)) {
      throw new PayloadValidationError('O campo dataPart deve estar no formato YYYY-MM-DD.');
    }

    const existente = await this.repository.findParticipacaoByAlunoAtividade(aluno.idAluno, atividade.idAtividade);

    if (existente) {
      const atualizado = await this.repository.saveParticipacao({
        ...existente,
        statusPart: payload.statusPart,
        nota: payload.nota ?? existente.nota,
        dataPart
      });
      await this.recalcularRisco(aluno.idAluno);

      return {
        success: true,
        data: { registro: atualizado, operacao: 'atualizado' }
      };
    }

    const criado = await this.repository.saveParticipacao({
      idAluno: aluno.idAluno,
      idAtividade: atividade.idAtividade,
      statusPart: payload.statusPart,
      nota: payload.nota ?? null,
      dataPart
    });
    await this.recalcularRisco(aluno.idAluno);

    return {
      success: true,
      data: { registro: criado, operacao: 'criado' }
    };
  }

  async registrarParticipacaoEvento(
    payload: RegistrarParticipacaoPayload
  ): Promise<SuccessResponse<{ registro: ParticipacaoRecord }>> {
    const aluno = await this.validarAluno(payload.idAluno);
    const atividade = await this.validarAtividade(payload.idAtividade);
    this.validarNota(payload.nota);

    const dataPart = toDateISO(payload.dataPart);
    if (!isDateStringValida(dataPart)) {
      throw new PayloadValidationError('O campo dataPart deve estar no formato YYYY-MM-DD.');
    }

    const existente = await this.repository.findParticipacaoByAlunoAtividade(aluno.idAluno, atividade.idAtividade);
    if (existente) {
      throw new ConflictError('Ja existe participacao registrada para este aluno nesta atividade.');
    }

    const criado = await this.repository.saveParticipacao({
      idAluno: aluno.idAluno,
      idAtividade: atividade.idAtividade,
      statusPart: payload.statusPart,
      nota: payload.nota ?? null,
      dataPart
    });
    await this.recalcularRisco(aluno.idAluno);

    return {
      success: true,
      data: { registro: criado }
    };
  }

  async atualizarEmpregabilidade(
    idAluno: number,
    payload: AtualizarEmpregabilidadePayload
  ): Promise<SuccessResponse<{ alunoId: number; ocupacao: string; tipoVinculoEmpregaticio: string | null; rendaMensal: number | null }>> {
    this.validarId(idAluno, 'idAluno');
    await this.validarAluno(idAluno);

    if (!payload.ocupacao || payload.ocupacao.trim().length < 3) {
      throw new PayloadValidationError('O campo ocupacao deve ter pelo menos 3 caracteres.');
    }

    if (payload.tipoVinculoEmpregaticio !== undefined && payload.tipoVinculoEmpregaticio.trim().length < 3) {
      throw new PayloadValidationError(
        'O campo tipoVinculoEmpregaticio deve ter pelo menos 3 caracteres quando informado.'
      );
    }

    if (payload.rendaMensal !== undefined && (!Number.isFinite(payload.rendaMensal) || payload.rendaMensal < 0)) {
      throw new PayloadValidationError('O campo rendaMensal deve ser um numero maior ou igual a zero.');
    }

    const aluno = await this.repository.updateEmpregabilidade(idAluno, {
      ocupacao: payload.ocupacao.trim(),
      tipoVinculoEmpregaticio: payload.tipoVinculoEmpregaticio?.trim(),
      rendaMensal: payload.rendaMensal
    });

    return {
      success: true,
      data: {
        alunoId: aluno.idAluno,
        ocupacao: aluno.ocupacao || '',
        tipoVinculoEmpregaticio: aluno.tipoVinculoEmpregaticio,
        rendaMensal: aluno.rendaMensal
      }
    };
  }

  async atualizarEnsinoSuperior(
    idAluno: number,
    payload: AtualizarEnsinoSuperiorPayload
  ): Promise<SuccessResponse<{
    alunoId: number;
    escolaridade: string;
    instituicaoEnsinoSuperior: string | null;
    cursoEnsinoSuperior: string | null;
    statusEnsinoSuperior: string | null;
    dataIngressoEnsinoSuperior: string | null;
  }>> {
    this.validarId(idAluno, 'idAluno');
    await this.validarAluno(idAluno);

    if (!payload.escolaridade || payload.escolaridade.trim().length < 3) {
      throw new PayloadValidationError('O campo escolaridade deve ter pelo menos 3 caracteres.');
    }

    if (payload.dataIngressoEnsinoSuperior && !isDateStringValida(payload.dataIngressoEnsinoSuperior)) {
      throw new PayloadValidationError(
        'O campo dataIngressoEnsinoSuperior deve estar no formato YYYY-MM-DD.'
      );
    }

    const aluno = await this.repository.updateEnsinoSuperior(idAluno, {
      escolaridade: payload.escolaridade.trim(),
      instituicaoEnsinoSuperior: payload.instituicaoEnsinoSuperior?.trim(),
      cursoEnsinoSuperior: payload.cursoEnsinoSuperior?.trim(),
      statusEnsinoSuperior: payload.statusEnsinoSuperior?.trim(),
      dataIngressoEnsinoSuperior: payload.dataIngressoEnsinoSuperior
    });

    return {
      success: true,
      data: {
        alunoId: aluno.idAluno,
        escolaridade: aluno.escolaridade || '',
        instituicaoEnsinoSuperior: aluno.instituicaoEnsinoSuperior,
        cursoEnsinoSuperior: aluno.cursoEnsinoSuperior,
        statusEnsinoSuperior: aluno.statusEnsinoSuperior,
        dataIngressoEnsinoSuperior: aluno.dataIngressoEnsinoSuperior
      }
    };
  }

  async registrarAnotacaoQualitativa(
    payload: RegistrarAnotacaoQualitativaPayload
  ): Promise<SuccessResponse<{ anotacaoId: number; alunoId: number; titulo: string }>> {
    const aluno = await this.validarAluno(payload.idAluno);

    if (!payload.titulo || payload.titulo.trim().length < 3) {
      throw new PayloadValidationError('O campo titulo deve ter pelo menos 3 caracteres.');
    }

    if (!payload.descricao || payload.descricao.trim().length < 5) {
      throw new PayloadValidationError('O campo descricao deve ter pelo menos 5 caracteres.');
    }

    if (!payload.autor || payload.autor.trim().length < 3) {
      throw new PayloadValidationError('O campo autor deve ter pelo menos 3 caracteres.');
    }

    const dataRegistro = toDateISO(payload.dataRegistro);
    if (!isDateStringValida(dataRegistro)) {
      throw new PayloadValidationError('O campo dataRegistro deve estar no formato YYYY-MM-DD.');
    }

    const anotacao = await this.repository.saveAnotacao({
      idAluno: aluno.idAluno,
      titulo: payload.titulo.trim(),
      descricao: payload.descricao.trim(),
      autor: payload.autor.trim(),
      dataRegistro
    });

    return {
      success: true,
      data: {
        anotacaoId: anotacao.idAnotacao,
        alunoId: anotacao.idAluno,
        titulo: anotacao.titulo
      }
    };
  }

  private async validarAluno(idAluno: number) {
    this.validarId(idAluno, 'idAluno');
    const aluno = await this.repository.findAlunoById(idAluno);
    if (!aluno) {
      throw new NotFoundError('Aluno nao encontrado.');
    }
    return aluno;
  }

  private async recalcularRisco(idAluno: number): Promise<void> {
    if (this.riscoEvasaoService) {
      await this.riscoEvasaoService.recalcularAluno(idAluno);
    }
  }

  private async validarAtividade(idAtividade: number): Promise<AtividadeRecord> {
    this.validarId(idAtividade, 'idAtividade');
    const atividade = await this.repository.findAtividadeById(idAtividade);
    if (!atividade) {
      throw new NotFoundError('Atividade nao encontrada.');
    }
    return atividade;
  }

  private validarId(valor: number, campo: string): void {
    if (!Number.isInteger(valor) || valor < 1) {
      throw new PayloadValidationError(`O campo ${campo} deve ser um numero inteiro positivo.`);
    }
  }

  private validarNota(nota: number | undefined): void {
    if (nota === undefined) {
      return;
    }

    if (!Number.isFinite(nota) || nota < 0 || nota > 10) {
      throw new PayloadValidationError('O campo nota deve ser um numero entre 0 e 10.');
    }
  }
}
