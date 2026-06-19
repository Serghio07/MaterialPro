const express = require("express");
const cors = require("cors");
require("dotenv").config();
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

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
