const express = require("express");

const impactoController = require("../controllers/impactoController");

const router = express.Router();

router.get("/resumo", impactoController.getResumo);

module.exports = router;
