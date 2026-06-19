const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");
const {
  listarOro,
  obtenerOro,
  crearOro,
  actualizarOro,
  eliminarOro,
  resumenSemanalOro,
} = require("../controllers/oro.controller");

const router = express.Router();

router.get("/", verificarToken, listarOro);
router.get("/resumen/semanal", verificarToken, resumenSemanalOro);
router.get("/:id", verificarToken, obtenerOro);
router.post("/", verificarToken, setUploadFolder("oro"), upload.single("imagen"), crearOro);
router.put("/:id", verificarToken, setUploadFolder("oro"), upload.single("imagen"), actualizarOro);
router.delete("/:id", verificarToken, eliminarOro);

module.exports = router;
