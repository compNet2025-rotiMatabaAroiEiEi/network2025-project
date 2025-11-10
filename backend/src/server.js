const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

//  before release update this to config.env file
dotenv.config({ path: path.join(__dirname, "config", "config.env.testing") });
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running!", status: "ok" });
});

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("DB URL at runtime:", process.env.DATABASE_URL);
});
