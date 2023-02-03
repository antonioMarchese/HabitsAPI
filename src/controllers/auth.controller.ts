import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayload } from "jsonwebtoken";
import { jwtService } from "../services/jwt.service";

export const authController = {
  checkToken: async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token)
      return reply
        .code(404)
        .send({ message: "Rota não autorizada: token não fornecido." });

    jwtService.verifyToken(token, async (err, decoded) => {
      if (err || typeof decoded === "undefined")
        return reply
          .code(401)
          .send({ message: "Não autorizado: token inválido" });
      const userEmail = (decoded as JwtPayload).email;
      request.user = {
        email: userEmail,
      };
    });
  },
};
