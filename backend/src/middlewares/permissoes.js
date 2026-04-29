const restrictedModules = new Set(["prontuario"]);

function allowRestrictedModule(moduleName) {
  return (_request, _response, next) => {
    if (restrictedModules.has(moduleName)) {
      return next();
    }

    return next();
  };
}

module.exports = {
  allowRestrictedModule
};
