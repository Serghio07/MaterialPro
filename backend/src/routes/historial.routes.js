const express = require("express");
const verificarToken = require("../middleware/auth.middleware");

const {
  listarHistorial,
} = require("../controllers/historial.controller");

const router = express.Router();

router.get("/", verificarToken, listarHistorial);

module.exports = router;