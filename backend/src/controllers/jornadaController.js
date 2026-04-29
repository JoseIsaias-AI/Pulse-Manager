const jornadaModel = require("../models/jornadaModel");
const { createSuccessResponse } = require("../utils/helpers");

function getResumo(_request, response) {
  return response.json(createSuccessResponse(jornadaModel.getResumo()));
}

module.exports = {
  getResumo
};
