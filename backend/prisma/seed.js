const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o script de seeding...');

  const lines = [
    'CHASSIS 4', 'CHASSIS1', 'CHASSIS2', 'CHASSIS3', 'CHASSIS5',
    'DECKING DOWN', 'DECKING UP', 'FINAL1', 'FINAL2', 'FINAL3',
    'GLAZING', 'TRIM 0', 'TRIM 1', 'TRIM 2','GOMA','GOMP'
  ];

  for (const lineName of lines) {
    await prisma.productionLine.upsert({
      where: { name: lineName },
      update: {},
      create: { name: lineName },
    });
  }
  console.log('Seeding de linhas de produção concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });