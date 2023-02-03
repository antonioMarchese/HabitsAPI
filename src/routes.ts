import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { userController } from "./controllers/user.controller";
import { habitsController } from "./controllers/habits.controller";

export async function appRoutes(app: FastifyInstance) {
  // Registro com senha encriptada
  app.post("/register", userController.register);
  app.post("/login", userController.login);

  app.post("/habits", habitsController.create);

  app.get("/day", habitsController.show);
  app.get("/userinfo", userController.userinfo);

  // completar / não-completar um hábito
  app.patch("/habits/:id/toggle", habitsController.toggle);

  app.get("/summary", habitsController.summary);
  app.get("/monthSummary", habitsController.monthSummary);

  app.delete("/habits/:id/delete", habitsController.delete);
}
