const alunoModel = require("../models/alunoModel");
const { createSuccessResponse, createErrorResponse } = require("../utils/helpers");

function listAlunos(_request, response) {
  return response.json(createSuccessResponse(alunoModel.listAlunos()));
}

function getAlunoById(request, response) {
  const aluno = alunoModel.findAlunoById(Number(request.params.id));

  if (!aluno) {
    return response.status(404).json(createErrorResponse("Aluno não encontrado."));
  }

  return response.json(createSuccessResponse(aluno));
}

function createAluno(request, response) {
  const aluno = alunoModel.createAluno(request.body);
  return response.status(201).json(createSuccessResponse(aluno));
}

module.exports = {
  listAlunos,
  getAlunoById,
  createAluno
};
