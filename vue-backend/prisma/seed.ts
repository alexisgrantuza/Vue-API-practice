import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { JsonPlaceholderUser, JsonPlaceholderComment } from "../src/types/user";

const prisma = new PrismaClient();

async function fetchUsersFromJsonPlaceholder(): Promise<JsonPlaceholderUser[]> {
  try {
    const response = await axios.get<JsonPlaceholderUser[]>(
      "https://jsonplaceholder.typicode.com/users"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users from JSONPlaceholder:", error);
    throw error;
  }
}

async function seedUsers() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await prisma.geo.deleteMany();
    await prisma.address.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();

    // Fetch users from JSONPlaceholder
    console.log("📥 Fetching users from JSONPlaceholder...");
    const users = await fetchUsersFromJsonPlaceholder();

    console.log(`📊 Found ${users.length} users to seed`);

    // Seed users with relations
    for (const userData of users) {
      console.log(`👤 Creating user: ${userData.name}`);

      const user = await prisma.user.create({
        data: {
          name: userData.name,
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          website: userData.website,
          address: {
            create: {
              street: userData.address.street,
              suite: userData.address.suite,
              city: userData.address.city,
              zipcode: userData.address.zipcode,
              geo: {
                create: {
                  lat: userData.address.geo.lat,
                  lng: userData.address.geo.lng,
                },
              },
            },
          },
          company: {
            create: {
              name: userData.company.name,
              catchPhrase: userData.company.catchPhrase,
              bs: userData.company.bs,
            },
          },
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

      console.log(`✅ Created user: ${user.name} (ID: ${user.id})`);
    }

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

async function fetchCommentFromJsonPlaceholder(): Promise<
  JsonPlaceholderComment[]
> {
  try {
    const response = await axios.get<JsonPlaceholderComment[]>(
      "https://jsonplaceholder.typicode.com/comments"
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch comments from JSONPlaceholder:", error);
    throw error;
  }
}

async function seedComment() {
  console.log("🌱 Starting comments seed...");

  try {
    console.log("🧹 Clearing existing comments...");
    await prisma.comment.deleteMany();

    console.log("📥 Fetching comments from JSONPlaceholder...");
    const comments = await fetchCommentFromJsonPlaceholder();

    // Fetch existing user ids to optionally link comments to users
    const users = await prisma.user.findMany({ select: { id: true } });
    const userIds = users.map((u) => u.id);

    console.log(`📊 Found ${comments.length} comments to seed`);

    const data = comments.map((c) => ({
      postId: c.postId,
      name: c.name,
      email: c.email,
      body: c.body,
      // Optionally associate to a random existing user
      userId:
        userIds.length > 0
          ? userIds[Math.floor(Math.random() * userIds.length)]
          : null,
    }));

    const result = await prisma.comment.createMany({ data });
    console.log(`✅ Created ${result.count} comments`);
  } catch (error) {
    console.error("❌ Error seeding comments:", error);
    throw error;
  }
}

async function main() {
  try {
    await seedUsers();
    await seedComment();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
