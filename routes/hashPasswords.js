const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function hashPasswords() {
  const users = await prisma.users.findMany();

  for (const user of users) { // hash all the user's passwords it not hashed
    if (!user.password.startsWith('$2b$')) { // already hashed passwords start like this
      const hashed = await bcrypt.hash(user.password, 10);
      await prisma.users.update({
        where: { userID: user.userID },
        data: { password: hashed },
      });
      console.log(`Hashed password for user ${user.username}`);
    }
  }

  console.log("All done!");
  process.exit();
}

hashPasswords();
