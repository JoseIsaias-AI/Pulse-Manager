const prontuarioModel = require("../models/prontuarioModel");
const { createSuccessResponse } = require("../utils/helpers");

function listProntuarios(_request, response) {
  return response.json(createSuccessResponse(prontuarioModel.listProntuarios()));
}

module.exports = {
  listProntuarios
};
