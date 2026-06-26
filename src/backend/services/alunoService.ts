import { CriarAlunoPayload, AlunoRecord, AlunoRepository, AtualizarAlunoPayload } from '../repositories/alunoRepository';
import { NotFoundError, PayloadValidationError, ConflictError } from '../utils/errors';
import { CadastroAlunoOptions } from '../repositories/alunoRepository';
import { assertIsoDate } from '../utils/date';
import { optionalString, requiredString } from '../utils/validators';
import {
  EMPREGABILIDADES_ALUNO,
  EmpregabilidadeAluno,
  GENEROS_ALUNO,
  RISCOS_EVASAO,
  RiscoEvasao,
  SegmentacaoAlunoQuery,
  STATUS_ALUNO,
  StatusAluno
} from '../models/alunoModel';
import { RiscoEvasaoService } from './riscoEvasaoService';

function mergeOptions(...groups: readonly string[][]): string[] {
  return [...new Set(groups.flat().filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function validarNomeAluno(nome: string): string {
  if (/\d/.test(nome)) {
    throw new PayloadValidationError('O campo nome nao pode conter numeros.');
  }
  return nome;
}

function apenasDigitos(value: string): string {
  return value.replace(/\D/g, '');
}

const PROGRAMAS_DISPONIVEIS = ['Mentoria', 'nao_informado', 'Programa Pulse Mais'];

export class AlunoService {
  constructor(
    private readonly repository: AlunoRepository,
    private readonly riscoEvasaoService?: Pick<RiscoEvasaoService, 'recalcularAluno'>
  ) {}

  async listar(filtros: SegmentacaoAlunoQuery) {
    if (
      filtros.empregabilidade &&
      !EMPREGABILIDADES_ALUNO.includes(filtros.empregabilidade as EmpregabilidadeAluno)
    ) {
      throw new PayloadValidationError('Empregabilidade invalida.');
    }

    if (
      filtros.anoIngresso !== undefined &&
      (!Number.isInteger(filtros.anoIngresso) || filtros.anoIngresso < 1900 || filtros.anoIngresso > 2100)
    ) {
      throw new PayloadValidationError('O campo anoIngresso deve ser um ano valido.');
    }

    return {
      success: true,
      data: {
        alunos: await this.repository.list(filtros),
      }
    };
  }

  async cadastrar(payload: CriarAlunoPayload) {
    const data = this.validarCadastro(payload);
    const existente = await this.repository.findOneByEmail(data.email);
    if (existente) {
      throw new ConflictError('Ja existe aluno cadastrado com este e-mail.');
    }

    if (data.cpf) {
      const alunoComCpf = await this.repository.findOneByCpf(data.cpf);
      if (alunoComCpf) {
        throw new ConflictError('Ja existe aluno cadastrado com este CPF.');
      }
    }

    const aluno = await this.repository.create(data);
    return { success: true, data: aluno };
  }

  async listarOpcoesCadastro() {
    const options = await this.repository.getCadastroOptions();
    const data: CadastroAlunoOptions = {
      ...options,
      genero: mergeOptions([...GENEROS_ALUNO], options.genero),
      riscoEvasao: mergeOptions(RISCOS_EVASAO, options.riscoEvasao),
      status: mergeOptions(STATUS_ALUNO, options.status),
      programa: PROGRAMAS_DISPONIVEIS,
      ocupacao: []
    };
    return { success: true, data };
  }

  async obterPerfil(idAluno: number) {
    const aluno = await this.repository.findById(idAluno);
    if (!aluno) {
      throw new NotFoundError('Aluno nao encontrado.');
    }

    return { success: true, data: aluno };
  }

  async atualizar(idAluno: number, payload: AtualizarAlunoPayload) {
    await this.garantirAluno(idAluno);
    const data = this.validarAtualizacao(payload);
    let aluno = await this.repository.update(idAluno, data);
    if (data.engajamento !== undefined && this.riscoEvasaoService) {
      await this.riscoEvasaoService.recalcularAluno(idAluno);
      aluno = await this.repository.findById(idAluno);
    }
    return { success: true, data: aluno };
  }

  async inativar(idAluno: number) {
    await this.garantirAluno(idAluno);
    const aluno = await this.repository.softDeactivate(idAluno);
    return { success: true, data: aluno };
  }

  private async garantirAluno(idAluno: number): Promise<AlunoRecord> {
    const aluno = await this.repository.findById(idAluno);
    if (!aluno) {
      throw new NotFoundError('Aluno nao encontrado.');
    }
    return aluno;
  }

  private validarCadastro(payload: CriarAlunoPayload): CriarAlunoPayload {
    const nome = validarNomeAluno(requiredString(payload.nome, 'nome', 3));
    const email = requiredString(payload.email, 'email', 5).toLowerCase();
    if (!email.includes('@')) {
      throw new PayloadValidationError('O campo email deve conter um endereco valido.');
    }

    const cpf = payload.cpf ? apenasDigitos(payload.cpf) : undefined;
    if (cpf !== undefined && cpf.length !== 11) {
      throw new PayloadValidationError('O campo cpf deve conter 11 digitos.');
    }

    if (
      payload.idade !== undefined &&
      (!Number.isInteger(payload.idade) || payload.idade < 0 || payload.idade > 120)
    ) {
      throw new PayloadValidationError('O campo idade deve estar entre 0 e 120.');
    }

    if (
      payload.rendaMensal !== undefined &&
      (!Number.isFinite(payload.rendaMensal) || payload.rendaMensal < 0)
    ) {
      throw new PayloadValidationError('O campo rendaMensal deve ser um numero maior ou igual a zero.');
    }

    if (
      payload.engajamento !== undefined &&
      (!Number.isInteger(payload.engajamento) || payload.engajamento < 0 || payload.engajamento > 100)
    ) {
      throw new PayloadValidationError('O campo engajamento deve ser um numero inteiro entre 0 e 100.');
    }

    const genero = optionalString(payload.genero)?.toLowerCase();
    if (genero && !GENEROS_ALUNO.includes(genero as (typeof GENEROS_ALUNO)[number])) {
      throw new PayloadValidationError('Genero invalido.');
    }

    const riscoEvasao = optionalString(payload.riscoEvasao)?.toLowerCase();
    if (riscoEvasao && !RISCOS_EVASAO.includes(riscoEvasao as RiscoEvasao)) {
      throw new PayloadValidationError('Risco de evasao invalido.');
    }

    const status = optionalString(payload.status)?.toLowerCase();
    if (status && !STATUS_ALUNO.includes(status as StatusAluno)) {
      throw new PayloadValidationError('Status do aluno invalido.');
    }

    return {
      ...payload,
      nome,
      email,
      cpf,
      dataIngresso: assertIsoDate(payload.dataIngresso, 'dataIngresso'),
      dataIngressoEnsinoSuperior: assertIsoDate(
        payload.dataIngressoEnsinoSuperior,
        'dataIngressoEnsinoSuperior'
      ),
      telefone: optionalString(payload.telefone),
      genero,
      ocupacao: optionalString(payload.ocupacao),
      tipoVinculoEmpregaticio: optionalString(payload.tipoVinculoEmpregaticio),
      escolaridade: optionalString(payload.escolaridade),
      instituicaoEnsinoSuperior: optionalString(payload.instituicaoEnsinoSuperior),
      cursoEnsinoSuperior: optionalString(payload.cursoEnsinoSuperior),
      statusEnsinoSuperior: optionalString(payload.statusEnsinoSuperior),
      programa: optionalString(payload.programa),
      categoria: optionalString(payload.categoria),
      riscoEvasao: riscoEvasao as RiscoEvasao | undefined,
      status: status as StatusAluno | undefined,
      nivelJornada: optionalString(payload.nivelJornada),
      perfilSocioeconomico: optionalString(payload.perfilSocioeconomico),
      curso: optionalString(payload.curso),
      origemParticipacao: optionalString(payload.origemParticipacao)
    };
  }

  private validarAtualizacao(payload: AtualizarAlunoPayload): AtualizarAlunoPayload {
    const data: AtualizarAlunoPayload = { ...payload };
    if (data.nome !== undefined) data.nome = validarNomeAluno(requiredString(data.nome, 'nome', 3));
    if (data.email !== undefined) {
      data.email = requiredString(data.email, 'email', 5).toLowerCase();
      if (!data.email.includes('@')) throw new PayloadValidationError('O campo email deve conter um endereco valido.');
    }

    if (
      data.idade !== undefined &&
      data.idade !== null &&
      (!Number.isInteger(data.idade) || data.idade < 0 || data.idade > 120)
    ) {
      throw new PayloadValidationError('O campo idade deve estar entre 0 e 120.');
    }

    if (
      data.rendaMensal !== undefined &&
      data.rendaMensal !== null &&
      (!Number.isFinite(data.rendaMensal) || data.rendaMensal < 0)
    ) {
      throw new PayloadValidationError('O campo rendaMensal deve ser um numero maior ou igual a zero.');
    }

    if (
      data.engajamento !== undefined &&
      (!Number.isInteger(data.engajamento) || data.engajamento < 0 || data.engajamento > 100)
    ) {
      throw new PayloadValidationError('O campo engajamento deve ser um numero inteiro entre 0 e 100.');
    }

    if (data.genero !== undefined && data.genero !== null) {
      const genero = optionalString(data.genero)?.toLowerCase();
      if (genero && !GENEROS_ALUNO.includes(genero as (typeof GENEROS_ALUNO)[number])) {
        throw new PayloadValidationError('Genero invalido.');
      }
      data.genero = genero;
    }

    if (data.status !== undefined) {
      const status = optionalString(data.status)?.toLowerCase();
      if (!status || !STATUS_ALUNO.includes(status as StatusAluno)) {
        throw new PayloadValidationError('Status do aluno invalido.');
      }
      data.status = status as StatusAluno;
    }

    if (data.dataIngresso !== undefined) data.dataIngresso = assertIsoDate(data.dataIngresso, 'dataIngresso');

    if (data.dataIngressoEnsinoSuperior !== undefined && data.dataIngressoEnsinoSuperior !== null) {
      data.dataIngressoEnsinoSuperior = assertIsoDate(
        data.dataIngressoEnsinoSuperior,
        'dataIngressoEnsinoSuperior'
      );
    }

    if (data.riscoEvasao !== undefined) {
      const riscoEvasao = optionalString(data.riscoEvasao)?.toLowerCase();
      if (!riscoEvasao || !RISCOS_EVASAO.includes(riscoEvasao as RiscoEvasao)) {
        throw new PayloadValidationError('Risco de evasao invalido.');
      }
      data.riscoEvasao = riscoEvasao as RiscoEvasao;
    }

    [
      'telefone',
      'ocupacao',
      'tipoVinculoEmpregaticio',
      'escolaridade',
      'instituicaoEnsinoSuperior',
      'cursoEnsinoSuperior',
      'statusEnsinoSuperior',
      'programa',
      'categoria',
      'nivelJornada',
      'perfilSocioeconomico',
      'curso',
      'origemParticipacao'
    ].forEach((field) => {
      const key = field as keyof AtualizarAlunoPayload;
      if (data[key] !== undefined && data[key] !== null) {
        (data as Record<string, unknown>)[field] = optionalString(data[key]);
      }
    });

    return data;
  }
}

