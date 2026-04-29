const comunicacaoModel = require("../models/comunicacaoModel");
const { createSuccessResponse } = require("../utils/helpers");

function listComunicacoes(_request, response) {
  return response.json(createSuccessResponse(comunicacaoModel.listComunicacoes()));
}

function createComunicacao(request, response) {
  const created = comunicacaoModel.createComunicacao(request.body);
  return response.status(201).json(createSuccessResponse(created));
}

module.exports = {
  listComunicacoes,
  createComunicacao
};
