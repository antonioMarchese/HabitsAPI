import dayjs from "dayjs";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

interface CreateUserProps {
  firstName: string;
  lastName: string;
  email: string;
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

  create: async (props: CreateUserProps) => {
    const today = dayjs().toDate(); // starOf('day') zera as horas e minutos do dia

    const hashedPassword = await bcrypt.hash(props.password.toString(), 10);

    const user = await prisma.user.create({
      data: {
        first_name: props.firstName,
        last_name: props.lastName,
        email: props.email,
        password: hashedPassword,
        created_at: today,
        updated_at: today,
      },
    });

    return user;
  },
};
