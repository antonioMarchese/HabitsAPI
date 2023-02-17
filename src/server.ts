/* import Fastify from "fastify";
import cors from "@fastify/cors"; */
import { router } from "./routes";
const multer = require("multer");
import express from "express";
import cors from "cors";

const app = express();

app.use(cors()); // para que a API possa receber requisições de qualquer aplicação

app.use(express.json());
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.listen(3333, "0.0.0.0", () => {
  console.log("Server running at port 3333");
});
