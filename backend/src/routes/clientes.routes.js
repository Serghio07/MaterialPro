const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");

const {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} = require("../controllers/clientes.controller");

const router = express.Router();

router.get("/", verificarToken, listarClientes);
router.get("/:id", verificarToken, obtenerCliente);
router.post("/", verificarToken, setUploadFolder("clientes"), upload.single("imagen"), crearCliente);
router.put("/:id", verificarToken, setUploadFolder("clientes"), upload.single("imagen"), actualizarCliente);
router.delete("/:id", verificarToken, eliminarCliente);

module.exports = router;
