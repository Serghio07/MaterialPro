const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");

const {
  listarTiposGasto,
  obtenerTipoGasto,
  crearTipoGasto,
  actualizarTipoGasto,
  eliminarTipoGasto,
} = require("../controllers/tiposGasto.controller");

const router = express.Router();

router.get("/", verificarToken, listarTiposGasto);
router.get("/:id", verificarToken, obtenerTipoGasto);
router.post("/", verificarToken, setUploadFolder("tipos-gasto"), upload.single("imagen"), crearTipoGasto);
router.put("/:id", verificarToken, setUploadFolder("tipos-gasto"), upload.single("imagen"), actualizarTipoGasto);
router.delete("/:id", verificarToken, eliminarTipoGasto);

module.exports = router;
