const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");

const {
  listarGastos,
  obtenerGasto,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
} = require("../controllers/gastos.controller");

const router = express.Router();

router.get("/", verificarToken, listarGastos);
router.get("/:id", verificarToken, obtenerGasto);
router.post("/", verificarToken, setUploadFolder("gastos"), upload.single("imagen"), crearGasto);
router.put("/:id", verificarToken, setUploadFolder("gastos"), upload.single("imagen"), actualizarGasto);
router.delete("/:id", verificarToken, eliminarGasto);

module.exports = router;
