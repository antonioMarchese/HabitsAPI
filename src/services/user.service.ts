import dayjs from "dayjs";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

interface CreateUserProps {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export const userService = {
  findByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        habits: true,
      },
    });

    return user;
  },

  findByUsername: async (username: string) => {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        habits: true,
      },
    });

    return user;
  },

  create: async (props: CreateUserProps) => {
    const today = dayjs().toDate(); // starOf('day') zera as horas e minutos do dia

    const hashedPassword = await bcrypt.hash(props.password.toString(), 10);
    /* const changedUsername = `@${props.username}` */

    const user = await prisma.user.create({
      data: {
        username: props.username,
        first_name: props.firstName,
        last_name: props.lastName,
        email: props.email,
        phone: props.phone,
        password: hashedPassword,
        created_at: today,
        updated_at: today,
      },
    });

    return user;
  },

  update: async (
    id: string,
    attributes: {
      username: string;
      phone: string;
      firstName: string;
      lastName: string;
      email: string;
    }
  ) => {
    const res = await prisma.user.update({
      where: {
        id,
      },
      data: {
        username: attributes.username,
        first_name: attributes.firstName,
        last_name: attributes.lastName,
        phone: attributes.phone,
        email: attributes.email,
      },
    });

    return res;
  },

  updatePassword: async (id: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password.toString(), 10);
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
  },
};
