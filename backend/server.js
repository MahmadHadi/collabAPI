import express from "express";
import { configDotenv } from "dotenv";

import connectDB from "./config/connectDB.js";
import reqRouter from "./router/req.router.js";

const app = express();
configDotenv();

const PORT = process.env.PORT | 3000;
connectDB();

app.use("/api/requests", reqRouter);

app.get("/", (req, res) => {
  res.send("Server is running ");
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
