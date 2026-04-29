const express = require("express");

const prontuarioController = require("../controllers/prontuarioController");
const { allowRestrictedModule } = require("../middlewares/permissoes");

const router = express.Router();

router.get("/", allowRestrictedModule("prontuario"), prontuarioController.listProntuarios);

module.exports = router;
