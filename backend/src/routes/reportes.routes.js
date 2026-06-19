const express = require("express");
const verificarToken = require("../middleware/auth.middleware");

const {
  obtenerReporteSemanal,
  guardarReporteSemanal,
  listarReportesSemanales,
} = require("../controllers/reportes.controller");

const router = express.Router();

router.get("/semanal", verificarToken, obtenerReporteSemanal);
router.post("/semanal", verificarToken, guardarReporteSemanal);
router.get("/semanales", verificarToken, listarReportesSemanales);

module.exports = router;