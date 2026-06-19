const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");

const {
  listarMateriales,
  obtenerMaterial,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
} = require("../controllers/materiales.controller");

const router = express.Router();

router.get("/", verificarToken, listarMateriales);
router.get("/:id", verificarToken, obtenerMaterial);
router.post("/", verificarToken, setUploadFolder("materiales"), upload.single("imagen"), crearMaterial);
router.put("/:id", verificarToken, setUploadFolder("materiales"), upload.single("imagen"), actualizarMaterial);
router.delete("/:id", verificarToken, eliminarMaterial);

module.exports = router;
