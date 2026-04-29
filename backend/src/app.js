const express = require("express");
const cors = require("cors");

const alunoRoutes = require("./routes/alunoRoutes");
const jornadaRoutes = require("./routes/jornadaRoutes");
const prontuarioRoutes = require("./routes/prontuarioRoutes");
const impactoRoutes = require("./routes/impactoRoutes");
const comunicacaoRoutes = require("./routes/comunicacaoRoutes");
const importacaoRoutes = require("./routes/importacaoRoutes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origem nao permitida pelo CORS"));
  }
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/alunos", alunoRoutes);
app.use("/api/jornada", jornadaRoutes);
app.use("/api/prontuarios", prontuarioRoutes);
app.use("/api/impacto", impactoRoutes);
app.use("/api/comunicacao", comunicacaoRoutes);
app.use("/api/importacao", importacaoRoutes);

module.exports = app;
