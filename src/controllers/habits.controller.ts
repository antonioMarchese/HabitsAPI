import dayjs from "dayjs";
import { FastifyReply, FastifyRequest } from "fastify";
import { string, z } from "zod";
import { habitService } from "../services/habit.service";
import { userService } from "../services/user.service";
import { authController } from "./auth.controller";

export const habitsController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    await authController.checkToken(request, reply);

    try {
      const user = await userService.findByEmail(request.user.email);

      const createHabitBody = z.object({
        title: z.string(),
        weekDays: z.array(z.number().min(0).max(6)),
      });

      const { title, weekDays } = createHabitBody.parse(request.body);

      await habitService.create({ user_id: user!.id, title, weekDays });
    } catch (error) {
      return reply.code(404).send({ mensagem: error });
    }
  },

  show: async (request: FastifyRequest, reply: FastifyReply) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    await authController.checkToken(request, reply);
    const user = await userService.findByEmail(request.user.email);

    const { date } = getDayParams.parse(request.query);
    const possibleHabits = await habitService.findPossibleHabits(
      date,
      user!.id
    );

    const completedHabits = await habitService.findCompletedHabits(
      date,
      user!.id
    );

    return {
      possibleHabits,
      completedHabits,
    };
  },

  toggle: async (request: FastifyRequest, reply: FastifyReply) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });
    await authController.checkToken(request, reply);

    const { id } = toggleHabitParams.parse(request.params);
    const user = await userService.findByEmail(request.user.email);
    await habitService.toggle(id, user!.id);
  },

  summary: async (request: FastifyRequest, reply: FastifyReply) => {
    await authController.checkToken(request, reply);
    const user = await userService.findByEmail(request.user.email);

    const user_id = user!.id;
    const summary = await habitService.getUserSummary(user_id);
    return reply.code(201).send(summary);
  },

  monthSummary: async (request: FastifyRequest, reply: FastifyReply) => {
    await authController.checkToken(request, reply);
    const user = await userService.findByEmail(request.user.email);
    const getDayParams = z.object({
      date: z.coerce.date().optional(),
    });

    const { date } = getDayParams.parse(request.query);

    const user_id = user!.id;
    const monthSummary = await habitService.getUserMonthSummary(user_id, date);
    const month = date ? dayjs(date).month() : dayjs().month();
    return reply.code(201).send({
      month,
      monthSummary,
    });
  },

  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    const deleteHabitParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteHabitParams.parse(request.params);
    await authController.checkToken(request, reply);

    const user = await userService.findByEmail(request.user.email);
    if (!user) return reply.code(401).send("Usuário não registrado");

    await habitService.deleteHabit(id);
  },
};
