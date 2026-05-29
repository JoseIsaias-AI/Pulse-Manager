import { AlunoRepository } from '../repositories/alunoRepository';
import { LabelPayload, SaudeMentalPayload, SaudeMentalRepository } from '../repositories/saudeMentalRepository';
import { BusinessRuleError, NotFoundError, PayloadValidationError } from '../utils/errors';
import { requiredString } from '../utils/validators';

const TIPOS_LABEL = ['risco', 'interesse', 'perfil', 'acompanhamento', 'prioridade', 'outro'];

export class SaudeMentalService {
  constructor(
    private readonly repository: SaudeMentalRepository,
    private readonly alunoRepository: AlunoRepository
  ) {}

  async listar(filtros: { idAluno?: number; idPsi?: number }, perfil?: string) {
    this.exigirPsicologo(perfil);
    return { success: true, data: await this.repository.listar(filtros) };
  }

  async criar(payload: SaudeMentalPayload, perfil?: string) {
    this.exigirPsicologo(perfil);
    const data = await this.validarRegistro(payload);
    return { success: true, data: await this.repository.criar(data) };
  }

  async listarLabels(filtros: { idAluno?: number; idPsi?: number }, perfil?: string) {
    this.exigirPsicologo(perfil);
    return { success: true, data: await this.repository.listarLabels(filtros) };
  }

  async criarLabel(payload: LabelPayload, perfil?: string) {
    this.exigirPsicologo(perfil);
    if (!TIPOS_LABEL.includes(payload.tipoLabel)) {
      throw new PayloadValidationError('Tipo de label invalido.');
    }
    await this.garantirAluno(payload.idAluno);
    return {
      success: true,
      data: await this.repository.criarLabel({
        ...payload,
        descricao: requiredString(payload.descricao, 'descricao', 3)
      })
    };
  }

  private async validarRegistro(payload: SaudeMentalPayload): Promise<SaudeMentalPayload> {
    await this.garantirAluno(payload.idAluno);
    return {
      ...payload,
      titulo: requiredString(payload.titulo, 'titulo', 3),
      observacao: requiredString(payload.observacao, 'observacao', 5)
    };
  }

  private async garantirAluno(idAluno: number) {
    const aluno = await this.alunoRepository.findById(Number(idAluno));
    if (!aluno) throw new NotFoundError('Aluno nao encontrado para registro psicologico.');
  }

  private exigirPsicologo(perfil?: string): void {
    if (perfil !== 'psicologo') {
      throw new BusinessRuleError('Registros de saude mental sao restritos ao perfil psicologo.');
    }
  }
}
