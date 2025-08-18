import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { JsonPlaceholderUser } from "../src/types/user";

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

async function main() {
  try {
    await seedUsers();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
