import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import bcrypt from "bcrypt";
import { jwtService } from "../services/jwt.service";
import { userService } from "../services/user.service";
import { authController } from "./auth.controller";
import { prisma } from "../lib/prisma";

export const userController = {
  // POST /register
  register: async (request: FastifyRequest, reply: FastifyReply) => {
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

      if (userAlredyExists) return new Error("Email ja cadastrado.");

      const user = await userService.create({
        firstName: first_name,
        lastName: last_name,
        email,
        password,
      });

      return reply.code(201).send(user);
    } catch (error) {
      if (error instanceof Error)
        return reply.code(400).send({ message: error.message });
    }
  },

  // POST /login
  login: async (request: FastifyRequest, reply: FastifyReply) => {
    const userBody = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = userBody.parse(request.body);
    try {
      // Checks if the user exists
      const user = await userService.findByEmail(email);
      if (!user) return reply.code(404).send("Usuário não cadastrado.");

      // Checks if the passwords match
      const isSame = await bcrypt.compare(password, user.password);
      if (!isSame) return reply.code(401).send({ mensagem: "Senha inválida." });

      const payload = {
        id: user.id,
        firstName: user.first_name,
        email: user.email,
      };

      const token = jwtService.signToken(payload, "1d");

      return reply.code(200).send({ authenticated: true, ...payload, token });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ message: error.message });
      }
    }
  },

  // POST /loginWithToken
  loginWithToken: async (request: FastifyRequest, reply: FastifyReply) => {
    await authController.checkToken(request, reply);

    try {
      const user = await userService.findByEmail(request.user.email);
      if (!user) return reply.code(404).send("Usuário não encontrado.");

      const payload = {
        id: user.id,
        firstName: user.first_name,
        email: user.email,
      };

      const token = jwtService.signToken(payload, "1d");

      return reply.code(200).send({ authenticated: true, ...payload, token });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ message: error.message });
      }
    }
  },

  // GET /userinfo
  userinfo: async (request: FastifyRequest, reply: FastifyReply) => {
    await authController.checkToken(request, reply);
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: request.user.email,
        },
        select: {
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
        },
      });
      return reply.code(200).send(user);
    } catch (error) {
      if (error instanceof Error) return reply.code(400).send(error);
      return reply.code(500).send(error);
    }
  },
};
