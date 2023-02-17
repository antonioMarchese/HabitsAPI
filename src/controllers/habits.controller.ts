import dayjs from "dayjs";
import { Request, response, Response } from "express";
import { string, z } from "zod";
import { habitService } from "../services/habit.service";
import { userService } from "../services/user.service";
import { authController, AuthenticatedRequest } from "./auth.controller";

export const habitsController = {
  create: async (request: AuthenticatedRequest, reply: Response) => {
    await authController.checkToken(request, reply);

    try {
      const user = await userService.findByEmail(request.user!.email);

      const createHabitBody = z.object({
        title: z.string(),
        weekDays: z.array(z.number().min(0).max(6)),
      });

      const { title, weekDays } = createHabitBody.parse(request.body);

      await habitService.create({ user_id: user!.id, title, weekDays });
    } catch (error) {
      return reply.status(404).json({ mensagem: error });
    }

    return reply.status(201).send();
  },

  show: async (request: AuthenticatedRequest, reply: Response) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    await authController.checkToken(request, reply);
    const user = await userService.findByEmail(request.user!.email);

    const { date } = getDayParams.parse(request.query);
    const possibleHabits = await habitService.findPossibleHabits(
      date,
      user!.id
    );

    const completedHabits = await habitService.findCompletedHabits(
      date,
      user!.id
    );

    return reply.status(200).json({
      possibleHabits,
      completedHabits,
    });
  },

  toggle: async (request: AuthenticatedRequest, reply: Response) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });
    await authController.checkToken(request, reply);

    const { id } = toggleHabitParams.parse(request.params);
    console.log(id);
    const user = await userService.findByEmail(request.user!.email);
    await habitService.toggle(id, user!.id);
    return reply.status(200).send();
  },

  summary: async (request: AuthenticatedRequest, reply: Response) => {
    await authController.checkToken(request, reply);
    const user = await userService.findByEmail(request.user!.email);

    const user_id = user!.id;
    const summary = await habitService.getUserSummary(user_id);
    return reply.status(201).json(summary);
  },

  monthSummary: async (request: AuthenticatedRequest, reply: Response) => {
    await authController.checkToken(request, reply);
    const user = await userService.findByEmail(request.user!.email);
    const getDayParams = z.object({
      date: z.coerce.date().optional(),
    });

    const { date } = getDayParams.parse(request.query);

    const user_id = user!.id;
    const monthSummary = await habitService.getUserMonthSummary(user_id, date);
    const month = date ? dayjs(date).month() : dayjs().month();
    return reply.status(201).json({
      month,
      monthSummary,
    });
  },

  delete: async (request: AuthenticatedRequest, reply: Response) => {
    const deleteHabitParams = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteHabitParams.parse(request.params);
    await authController.checkToken(request, reply);

    const user = await userService.findByEmail(request.user!.email);
    if (!user) return reply.status(401).json("Usuário não registrado");

    await habitService.deleteHabit(id);
  },
};
