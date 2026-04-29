const express = require("express");

const alunoController = require("../controllers/alunoController");
const { validateAlunoPayload } = require("../middlewares/validacao");

const router = express.Router();

router.get("/", alunoController.listAlunos);
router.get("/:id", alunoController.getAlunoById);
router.post("/", validateAlunoPayload, alunoController.createAluno);

module.exports = router;
