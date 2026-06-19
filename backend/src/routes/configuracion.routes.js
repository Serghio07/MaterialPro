const express = require("express");
const verificarToken = require("../middleware/auth.middleware");

const {
  obtenerConfiguracion,
  actualizarConfiguracion,
} = require("../controllers/configuracion.controller");

const router = express.Router();

router.get("/", verificarToken, obtenerConfiguracion);
router.put("/", verificarToken, actualizarConfiguracion);

module.exports = router;