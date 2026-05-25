import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.admin.findUnique({
    where: { username: "superadmin" },
  });

  if (!existing) {
    await prisma.admin.create({
      data: {
        username: "superadmin",
        accessCode: "17F6413A",
      },
    });
    console.log("Default admin created: superadmin");
  } else {
    console.log("Default admin already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
