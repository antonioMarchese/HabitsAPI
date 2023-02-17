/* import { Response, Request } from "fastify"; */
import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { jwtService } from "../services/jwt.service";
import { userService } from "../services/user.service";
import { authController, AuthenticatedRequest } from "./auth.controller";
import { prisma } from "../lib/prisma";
import { url } from "inspector";

export const userController = {
  // POST /register
  register: async (request: Request, res: Response) => {
    const userBody = z.object({
      first_name: z.string(),
      last_name: z.string(),
      email: z.string().email(),
      password: z.string(),
    });

    try {
      const { first_name, last_name, email, password } = userBody.parse(
        request.body
      );

      const userAlredyExists = await userService.findByEmail(email);

      if (userAlredyExists) throw new Error("Email ja cadastrado.");

      const user = await userService.create({
        firstName: first_name,
        lastName: last_name,
        email,
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
          first_name: true,
          last_name: true,
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
    const { firstName, lastName, email } = req.body;

    if (userEmail !== email) {
      const emailAlredyInUse = await userService.findByEmail(email);
      if (emailAlredyInUse)
        return res.status(401).json({
          Erro: "Este email não está disponível. Escolha outro ou mantenha o seu atual.",
        });
    }

    try {
      const updatedUser = await userService.update(userId, {
        email,
        firstName,
        lastName,
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
};
