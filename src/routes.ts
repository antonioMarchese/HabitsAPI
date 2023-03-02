import express from "express";
import { userController } from "./controllers/user.controller";
import { habitsController } from "./controllers/habits.controller";
const multerConfig = require("./config/multer.js");
const multer = require("multer");

const router = express.Router();

// Registro com senha encriptada
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/loginWithToken", userController.loginWithToken);
router.post(
  "/user/profile/updateAvatar",
  multer(multerConfig).single("file"),
  userController.updateAvatar
);
router.put("/users/current", userController.update);
router.put("/users/current/password", userController.updatePassword);

// Criação de hábitos
router.post("/habits", habitsController.create);

router.get("/habit/:id", habitsController.habitInfo);

// Todos os hábitos de um dia
router.get("/day", habitsController.show);

// Informações do usuário
router.get("/userinfo", userController.userinfo);

// completar / não-completar um hábito
router.patch("/habits/:id/toggle", habitsController.toggle);

router.get("/summary", habitsController.summary);
router.get("/weekSummary", habitsController.weekInfo);
router.get("/monthSummary", habitsController.monthSummary);

// GET todos os hábitos do usuário
router.get("/users/habits", habitsController.getAllHabits);

// Atualiza um determinado hábito
router.put("/users/habits/:id/update", habitsController.update);

router.delete("/habits/:id/delete", habitsController.delete);

export { router };
