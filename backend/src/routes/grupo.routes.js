const express = require("express");
const verificarToken = require("../middleware/auth.middleware");
const { upload, setUploadFolder } = require("../middleware/upload.middleware");
const { obtenerGrupo, actualizarGrupo } = require("../controllers/grupo.controller");

const router = express.Router();

router.get("/", verificarToken, obtenerGrupo);
router.put("/", verificarToken, setUploadFolder("equipo"), upload.single("imagen"), actualizarGrupo);

module.exports = router;
