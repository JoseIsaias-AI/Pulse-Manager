const { parseCsvText } = require("../utils/csvParser");
const { createSuccessResponse, createErrorResponse } = require("../utils/helpers");

function importCsv(request, response) {
  const csvContent = String(request.body.csv || "");

  if (!csvContent.trim()) {
    return response.status(400).json(createErrorResponse("Envie o conteudo CSV em request.body.csv."));
  }

  const parsed = parseCsvText(csvContent);
  return response.json(createSuccessResponse(parsed));
}

module.exports = {
  importCsv
};
