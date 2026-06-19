const express = require("express");
const {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
} = require("../controllers/auth.controller");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");

const router = express.Router();

router.post(
  "/register",
  setUploadFolder("usuarios"),
  upload.single("imagen"),
  registrarUsuario
);
router.post("/login", loginUsuario);
router.get("/perfil", verificarToken, obtenerPerfil);

module.exports = router;
