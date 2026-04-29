const express = require("express");

const comunicacaoController = require("../controllers/comunicacaoController");
const { validateComunicacaoPayload } = require("../middlewares/validacao");

const router = express.Router();

router.get("/", comunicacaoController.listComunicacoes);
router.post("/", validateComunicacaoPayload, comunicacaoController.createComunicacao);

module.exports = router;
