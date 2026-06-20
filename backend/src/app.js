const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config({ quiet: true });
const materialesRoutes = require("./routes/materiales.routes");
const authRoutes = require("./routes/auth.routes");
const clientesRoutes = require("./routes/clientes.routes");
const tiposGastoRoutes = require("./routes/tiposGasto.routes");
const ventasRoutes = require("./routes/ventas.routes");
const gastosRoutes = require("./routes/gastos.routes");
const historialRoutes = require("./routes/historial.routes");
const reportesRoutes = require("./routes/reportes.routes");
const configuracionRoutes = require("./routes/configuracion.routes");
const oroRoutes = require("./routes/oro.routes");
const equipoRoutes = require("./routes/equipo.routes");
const grupoRoutes = require("./routes/grupo.routes");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "blob:", "http://localhost:3000", "http://localhost:8081"],
      },
    },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const inicio = Date.now();
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  let usuario = req.path.startsWith("/uploads/") ? "recurso-publico" : "anonimo";

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      usuario = payload.email || payload.nombre || payload.id_usuario || "usuario";
    } catch {
      usuario = "token-invalido";
    }
  }

  res.on("finish", () => {
    const partes = [
      `[${new Date().toISOString()}]`,
      req.method,
      req.originalUrl,
      `status=${res.statusCode}`,
      `tiempo=${Date.now() - inicio}ms`,
      `usuario=${usuario}`,
      `ip=${req.ip}`,
    ];

    if (req.file) {
      partes.push(`archivo=${req.file.filename}`, `tipo=${req.file.mimetype}`, `bytes=${req.file.size}`);
    }

    if (Object.keys(req.query || {}).length) partes.push(`query=${JSON.stringify(req.query)}`);
    if (req.body && Object.keys(req.body).length && !req.originalUrl.includes("/login")) {
      const bodySeguro = { ...req.body };
      delete bodySeguro.password;
      delete bodySeguro.confirmarPassword;
      partes.push(`body=${JSON.stringify(bodySeguro)}`);
    }

    console.log(partes.join(" "));
  });

  next();
});

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "../uploads"))
);

app.get("/", (req, res) => {
  res.json({
    message: "API MaterialPro funcionando correctamente",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/materiales", materialesRoutes);
app.use("/api/tipos-gasto", tiposGastoRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/gastos", gastosRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/configuracion", configuracionRoutes);
app.use("/api/oro", oroRoutes);
app.use("/api/equipo", equipoRoutes);
app.use("/api/grupo", grupoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
