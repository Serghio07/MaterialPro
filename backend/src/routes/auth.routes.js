const express = require("express");
const {
  registrarUsuario,
  loginUsuario,
  verificarEmail,
  reenviarCodigo,
  obtenerPerfil,
} = require("../controllers/auth.controller");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos. Intenta nuevamente en unos minutos." },
});

const reenviarLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados codigos solicitados. Intenta nuevamente en unos minutos." },
});

router.post("/register", setUploadFolder("usuarios"), upload.single("imagen"), registrarUsuario);
router.post("/login", loginLimiter, loginUsuario);
router.post("/verificar-email", verificarEmail);
router.post("/reenviar-codigo", reenviarLimiter, reenviarCodigo);
router.get("/perfil", verificarToken, obtenerPerfil);

module.exports = router;
