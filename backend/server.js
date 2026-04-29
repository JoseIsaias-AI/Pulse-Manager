require("dotenv").config();

const app = require("./src/app");
const PORT = Number(process.env.PORT) || 3000;
const databaseMode = process.env.DB_MODE || "memory";

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Modo de dados: ${databaseMode}`);
});
