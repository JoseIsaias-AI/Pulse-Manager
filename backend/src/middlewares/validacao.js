const { createErrorResponse } = require("../utils/helpers");

function validateAlunoPayload(request, response, next) {
  const { nome, email, cpf } = request.body;

  if (!nome || String(nome).trim().length < 3) {
    return response.status(400).json(createErrorResponse("Nome do aluno invalido."));
  }

  if (!email || !String(email).includes("@")) {
    return response.status(400).json(createErrorResponse("E-mail invalido."));
  }

  if (!cpf || String(cpf).replace(/\D/g, "").length !== 11) {
    return response.status(400).json(createErrorResponse("CPF invalido."));
  }

  return next();
}

function validateComunicacaoPayload(request, response, next) {
  const { segmento, assunto, mensagem } = request.body;

  if (!segmento || !assunto || !mensagem) {
    return response.status(400).json(createErrorResponse("Segmento, assunto e mensagem sao obrigatorios."));
  }

  return next();
}

module.exports = {
  validateAlunoPayload,
  validateComunicacaoPayload
};
