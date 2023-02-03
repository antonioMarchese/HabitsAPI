import Fastify from "fastify";
import cors from "@fastify/cors";
import { appRoutes } from "./routes";

const app = Fastify();

app.register(cors); // para que a API possa receber requisições de qualquer aplicação
app.register(appRoutes);

app
  .listen({
    port: 3333,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("Server running at port 3333");
  });
