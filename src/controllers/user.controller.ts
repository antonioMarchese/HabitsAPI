/* import { Response, Request } from "fastify"; */
import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { jwtService } from "../services/jwt.service";
import { userService } from "../services/user.service";
import { authController, AuthenticatedRequest } from "./auth.controller";
import { prisma } from "../lib/prisma";

export const userController = {
  // POST /register
  register: async (request: Request, res: Response) => {
    const userBody = z.object({
      username: z.string(),
      first_name: z.string(),
      last_name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      password: z.string(),
    });

    try {
      const { username, first_name, last_name, phone, email, password } =
        userBody.parse(request.body);

      const userAlredyExists = await userService.findByEmail(email);
      const usernameAlredyExists = await userService.findByUsername(username);

      if (userAlredyExists) throw new Error("Email ja cadastrado.");
      if (usernameAlredyExists)
        throw new Error("Nome de usuário indisponível.");

      const user = await userService.create({
        username,
        firstName: first_name,
        lastName: last_name,
        email,
        phone,
        password,
      });

      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error)
        return res.status(400).json({ message: error.message });
    }
  },

  // POST /login
  login: async (req: Request, res: Response) => {
    const userBody = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = userBody.parse(req.body);
    try {
      // Checks if the user exists
      const user = await userService.findByEmail(email);
      if (!user) return res.status(404).send("Usuário não cadastrado.");

      // Checks if the passwords match
      const isSame = await bcrypt.compare(password, user.password);
      if (!isSame) return res.status(401).send({ mensagem: "Senha inválida." });

      const payload = {
        id: user.id,
        firstName: user.first_name,
        email: user.email,
      };

      const token = jwtService.signToken(payload, "1d");

      return res.status(200).json({ authenticated: true, ...payload, token });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
    }
  },

  // POST /loginWithToken
  loginWithToken: async (request: AuthenticatedRequest, res: Response) => {
    await authController.checkToken(request, res);

    try {
      const user = await userService.findByEmail(request.user!.email);
      if (!user) return res.status(404).send("Usuário não encontrado.");

      const payload = {
        id: user.id,
        firstName: user.first_name,
        email: user.email,
      };

      const token = jwtService.signToken(payload, "1d");

      return res.status(200).send({ authenticated: true, ...payload, token });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).send({ message: error.message });
      }
    }
  },

  // GET /userinfo
  userinfo: async (request: AuthenticatedRequest, res: Response) => {
    await authController.checkToken(request, res);
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: request.user!.email,
        },
        select: {
          username: true,
          first_name: true,
          last_name: true,
          phone: true,
          email: true,
          created_at: true,
          avatar: true,
        },
      });
      return res.status(200).send(user);
    } catch (error) {
      if (error instanceof Error) return res.status(400).send(error);
      return res.status(500).send(error);
    }
  },

  update: async (req: AuthenticatedRequest, res: Response) => {
    await authController.checkToken(req, res);

    const userEmail = req.user!.email;
    const user = await userService.findByEmail(userEmail);
    const userId = user!.id;
    const { username, firstName, lastName, phone, email } = req.body;

    if (userEmail !== email) {
      const emailAlredyInUse = await userService.findByEmail(email);
      if (emailAlredyInUse)
        return res.status(401).json({
          Erro: "Este email não está disponível. Escolha outro ou mantenha o seu atual.",
        });
    }

    if (username !== user!.username) {
      const usernameAlredyInUse = await userService.findByUsername(username);
      if (usernameAlredyInUse)
        return res.status(401).json({
          Erro: "Nome de usuário indisponível. Escolha outro ou continue com o seu.",
        });
    }

    try {
      const updatedUser = await userService.update(userId, {
        username,
        email,
        firstName,
        lastName,
        phone,
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof Error) return res.status(400).send(error);
      return res.status(500).send(error);
    }
  },

  updateAvatar: async (request: any, res: Response) => {
    try {
      const email = request.user!.email;
      const avatar = String(request.file.filename);
      const user = await prisma.user.update({
        where: {
          email,
        },
        data: {
          avatar,
        },
      });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).send(error);
    }
  },

  updatePassword: async (request: AuthenticatedRequest, response: Response) => {
    await authController.checkToken(request, response);
    const updatePasswordBody = z.object({
      password: z.string(),
      newPassword: z.string(),
    });

    const { password, newPassword } = updatePasswordBody.parse(request.body);
    const user = await userService.findByEmail(request.user!.email);

    // Checks if the passwords match
    const isSame = await bcrypt.compare(password, user!.password);
    if (!isSame) return response.status(401).send({ Erro: "Senha incorreta." });

    await userService.updatePassword(user!.id, newPassword);
    return response.status(204).send();
  },
};
