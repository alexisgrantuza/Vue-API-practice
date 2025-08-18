import { PrismaClient } from "@prisma/client";
import { CreateUserData, UpdateUserData, UserQuery } from "../types/user";

const prisma = new PrismaClient();

export const getAllUsers = async (query: UserQuery = {}) => {
  const { search, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { username: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        address: {
          include: {
            geo: true,
          },
        },
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      address: {
        include: {
          geo: true,
        },
      },
      company: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const createUser = async (data: CreateUserData) => {
  return await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone,
      website: data.website,
      address: data.address
        ? {
            create: {
              street: data.address.street,
              suite: data.address.suite,
              city: data.address.city,
              zipcode: data.address.zipcode,
              geo: data.address.geo
                ? {
                    create: {
                      lat: data.address.geo.lat,
                      lng: data.address.geo.lng,
                    },
                  }
                : undefined,
            },
          }
        : undefined,
      company: data.company
        ? {
            create: {
              name: data.company.name,
              catchPhrase: data.company.catchPhrase,
              bs: data.company.bs,
            },
          }
        : undefined,
    },
    include: {
      address: {
        include: {
          geo: true,
        },
      },
      company: true,
    },
  });
};

export const updateUser = async (id: number, data: UpdateUserData) => {
  // First check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
    include: {
      address: true,
      company: true,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  return await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone,
      website: data.website,
      address: data.address
        ? {
            upsert: {
              create: {
                street: data.address.street,
                suite: data.address.suite,
                city: data.address.city,
                zipcode: data.address.zipcode,
                geo: data.address.geo
                  ? {
                      create: {
                        lat: data.address.geo.lat,
                        lng: data.address.geo.lng,
                      },
                    }
                  : undefined,
              },
              update: {
                street: data.address.street,
                suite: data.address.suite,
                city: data.address.city,
                zipcode: data.address.zipcode,
                geo: data.address.geo
                  ? {
                      upsert: {
                        create: {
                          lat: data.address.geo.lat,
                          lng: data.address.geo.lng,
                        },
                        update: {
                          lat: data.address.geo.lat,
                          lng: data.address.geo.lng,
                        },
                      },
                    }
                  : undefined,
              },
            },
          }
        : undefined,
      company: data.company
        ? {
            upsert: {
              create: {
                name: data.company.name,
                catchPhrase: data.company.catchPhrase,
                bs: data.company.bs,
              },
              update: {
                name: data.company.name,
                catchPhrase: data.company.catchPhrase,
                bs: data.company.bs,
              },
            },
          }
        : undefined,
    },
    include: {
      address: {
        include: {
          geo: true,
        },
      },
      company: true,
    },
  });
};

export const deleteUser = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.delete({
    where: { id },
  });

  return { message: "User deleted successfully" };
};
