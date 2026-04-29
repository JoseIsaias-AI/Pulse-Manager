const express = require("express");

const importacaoController = require("../controllers/importacaoController");

const router = express.Router();

router.post("/csv", importacaoController.importCsv);

module.exports = router;
