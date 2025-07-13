import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Создание пользователя
    await prisma.user.create({
        data: {
            steamId: 'STEAM_1234567890',
            username: 'admin',
            email: 'admin@example.com',
            balance: 1000,
            role: 'ADMIN',
            isActive: true,
        },
    });

    // Создание кейса
    await prisma.case.create({
        data: {
            name: 'Start Case',
            description: 'Первый кейс',
            image: 'https://example.com/case.jpg',
            price: 10.0,
            isActive: true,
        },
    });
}

main()
    .then(() => console.log('✅ Seed завершён'))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
