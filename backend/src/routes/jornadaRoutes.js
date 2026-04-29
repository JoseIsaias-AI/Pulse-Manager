const express = require("express");

const jornadaController = require("../controllers/jornadaController");

const router = express.Router();

router.get("/resumo", jornadaController.getResumo);

module.exports = router;
