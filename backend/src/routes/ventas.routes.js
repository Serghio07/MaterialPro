const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");

const {
  listarVentas,
  obtenerVenta,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
} = require("../controllers/ventas.controller");

const router = express.Router();

router.get("/", verificarToken, listarVentas);
router.get("/:id", verificarToken, obtenerVenta);
router.post("/", verificarToken, setUploadFolder("ventas"), upload.single("imagen"), crearVenta);
router.put("/:id", verificarToken, setUploadFolder("ventas"), upload.single("imagen"), actualizarVenta);
router.delete("/:id", verificarToken, eliminarVenta);

module.exports = router;
