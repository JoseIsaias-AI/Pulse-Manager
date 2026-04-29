const impactoModel = require("../models/impactoModel");
const { createSuccessResponse } = require("../utils/helpers");

function getResumo(_request, response) {
  return response.json(createSuccessResponse(impactoModel.getResumo()));
}

module.exports = {
  getResumo
};
