import * as repository from '../repositories/saudeMentalRepository';
import type { CriarProntuarioInput, Prontuario, ProntuarioComAluno } from '../models/SaudeMentalModel';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';

function validarPerfilPsicologo(ehPsicologo: boolean) {
  if (!ehPsicologo) {
    throw new ForbiddenError('Apenas psicologos podem acessar registros de saude mental');
  }
}

export async function criar(
  dados: CriarProntuarioInput,
  ehPsicologo: boolean
): Promise<Prontuario> {
  validarPerfilPsicologo(ehPsicologo);

  const idPsi = dados.id_psi ?? dados.id_psicologo;
  const titulo = dados.titulo ?? dados.classificacao;

  if (!dados.observacao || !titulo || !dados.id_aluno || !idPsi) {
    throw new BadRequestError('Campos obrigatorios: observacao, titulo, id_aluno, id_psi');
  }

  const alunoExiste = await repository.alunoExiste(dados.id_aluno);
  if (!alunoExiste) {
    throw new NotFoundError(`Aluno ${dados.id_aluno} nao encontrado`);
  }

  const psicologoExiste = await repository.psicologoExiste(idPsi);
  if (!psicologoExiste) {
    throw new NotFoundError(`Psicologo ${idPsi} nao encontrado`);
  }

  return repository.criarProntuario({
    observacao: dados.observacao,
    titulo,
    id_aluno: dados.id_aluno,
    id_psi: idPsi,
  });
}

export async function listar(
  idPsi: number | undefined,
  ehPsicologo: boolean
): Promise<ProntuarioComAluno[]> {
  validarPerfilPsicologo(ehPsicologo);

  if (!idPsi) {
    throw new BadRequestError('Informe id_psi para listar os prontuarios');
  }

  const psicologoExiste = await repository.psicologoExiste(idPsi);
  if (!psicologoExiste) {
    throw new NotFoundError(`Psicologo ${idPsi} nao encontrado`);
  }

  return repository.listarPorPsicologo(idPsi);
}
