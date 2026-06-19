const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");
const {
  listarEquipo,
  obtenerIntegrante,
  crearIntegrante,
  actualizarIntegrante,
  eliminarIntegrante,
} = require("../controllers/equipo.controller");

const router = express.Router();

router.get("/", verificarToken, listarEquipo);
router.get("/:id", verificarToken, obtenerIntegrante);
router.post("/", verificarToken, setUploadFolder("equipo"), upload.single("imagen"), crearIntegrante);
router.put("/:id", verificarToken, setUploadFolder("equipo"), upload.single("imagen"), actualizarIntegrante);
router.delete("/:id", verificarToken, eliminarIntegrante);

module.exports = router;
