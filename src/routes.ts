import express from "express";
import { userController } from "./controllers/user.controller";
import { habitsController } from "./controllers/habits.controller";
import { authController } from "./controllers/auth.controller";
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

router.post("/habits", habitsController.create);

router.get("/day", habitsController.show);
router.get("/userinfo", userController.userinfo);

// completar / não-completar um hábito
router.patch("/habits/:id/toggle", habitsController.toggle);

router.get("/summary", habitsController.summary);
router.get("/monthSummary", habitsController.monthSummary);

router.delete("/habits/:id/delete", habitsController.delete);

export { router };
