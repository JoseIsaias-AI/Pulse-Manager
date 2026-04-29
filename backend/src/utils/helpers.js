function createSuccessResponse(data) {
  return {
    success: true,
    data
  };
}

function createErrorResponse(message) {
  return {
    success: false,
    message
  };
}

module.exports = {
  createSuccessResponse,
  createErrorResponse
};
