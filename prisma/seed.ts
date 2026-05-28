import { PrismaClient, AssetFolder } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding North Hanover Grille database...');

  // Clean up existing data (safe for dev)
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.beer.deleteMany();
  await prisma.special.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.siteSetting.deleteMany();

  // === Site Settings (makes homepage look real immediately) ===
  await prisma.siteSetting.createMany({
    data: [
      { key: 'hero_headline', value: 'A Modern Grille.\nExceptional Food.\nWarm Hospitality.' },
      { key: 'hero_subheadline', value: 'Craft beers on tap, a thoughtfully seasonal menu, and an atmosphere that feels like home in downtown Carlisle.' },
      { key: 'hours_text', value: 'Tue–Thu 11am–9pm • Fri–Sat 11am–9:30pm • Closed Sun & Mon' },
      { key: 'address_text', value: '37 N. Hanover Street, Carlisle, PA 17013' },
      { key: 'phone', value: '(717) 241-5517' },
      { key: 'instagram_url', value: 'https://instagram.com/n_hanover_grille' },
      { key: 'facebook_url', value: 'https://facebook.com/p/North-Hanover-Grille-100063744092978' },
    ],
  });

  // === Sample Beers (realistic rotating list for Carlisle) ===
  const beers = [
    { name: 'Left Hand Milk Stout', type: 'Milk Stout', price: 7.5, abv: 6.0, description: 'Sweet roasted malt, chocolate, and coffee notes. Nitro pour.' },
    { name: 'Ever Grain Joose Juicy', type: 'Hazy IPA', price: 8, abv: 6.8, description: 'Juicy citrus, soft mouthfeel, low bitterness.' },
    { name: 'Bell’s Two Hearted', type: 'American IPA', price: 7, abv: 7.0, description: 'Classic piney, citrus-forward IPA from Michigan.' },
    { name: 'Dewey Swishy Pants', type: 'Hazy IPA', price: 7.5, abv: 6.5, description: 'Tropical fruit bomb with a smooth finish.' },
    { name: 'Yuengling Lager', type: 'Lager', price: 5, abv: 4.5, description: 'America’s oldest brewery. Crisp and clean.' },
    { name: 'Left Hand Milk Stout Nitro', type: 'Milk Stout', price: 7.5, abv: 6.0, description: 'The famous nitro version – cascades like Guinness.' },
    { name: 'New Trail Broken Heels', type: 'Hazy IPA', price: 8, abv: 6.5, description: 'Local PA hazy with bright grapefruit and berry.' },
    { name: 'Miller Lite', type: 'Light Lager', price: 4.5, abv: 4.2, description: 'The classic. Cold and refreshing.' },
  ];

  for (const [index, beer] of beers.entries()) {
    await prisma.beer.create({
      data: {
        name: beer.name,
        type: beer.type,
        price: beer.price,
        abv: beer.abv,
        description: beer.description,
        isVisible: true,
        sortOrder: index + 1,
      },
    });
  }

  // === Menu Categories + Items ===
  const menuData = [
    {
      name: 'Shareables & Apps',
      items: [
        { name: 'Buffalo Chicken Dip', price: 11, description: 'House-made with pretzel bites' },
        { name: 'Nachos Grande', price: 12, description: 'Beef, cheese, jalapeños, sour cream, pico' },
        { name: 'Cheesesteak Eggrolls', price: 10, description: 'American cheese, fried onions, side of ketchup' },
        { name: 'Boneless Wings (8)', price: 11, description: 'Choice of sauce' },
      ],
    },
    {
      name: 'Wings',
      items: [
        { name: 'Bone-In Wings (8)', price: 12, description: 'Tossed in your choice of sauce' },
        { name: 'Boneless Wings (8)', price: 11, description: 'Crispy and juicy' },
        { name: 'Boneless Wings (12)', price: 15, description: 'Best value for the table' },
      ],
    },
    {
      name: 'Handhelds',
      items: [
        { name: 'Classic Cheeseburger', price: 13, description: 'American cheese, lettuce, tomato, onion' },
        { name: 'Brisket Cheesesteak', price: 15, description: 'Smoked brisket, peppers, onions, provolone' },
        { name: 'Crispy Chicken Sandwich', price: 13, description: 'Pickles, slaw, comeback sauce' },
        { name: 'Crab Cake Sandwich', price: 16, description: 'Old Bay remoulade, lettuce, tomato' },
      ],
    },
    {
      name: 'Entrees & Salads',
      items: [
        { name: 'Flat Iron Steak', price: 24, description: 'Chimichurri, choice of side' },
        { name: 'Beer Battered Haddock', price: 18, description: 'Fries, tartar, lemon' },
        { name: 'Greek Salad', price: 11, description: 'Add grilled chicken +$6' },
        { name: 'Southwest Chicken Salad', price: 14, description: 'Black beans, corn, avocado, chipotle ranch' },
      ],
    },
  ];

  for (const [catIndex, cat] of menuData.entries()) {
    const category = await prisma.menuCategory.create({
      data: {
        name: cat.name,
        sortOrder: catIndex + 1,
        isVisible: true,
      },
    });

    for (const [itemIndex, item] of cat.items.entries()) {
      await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          name: item.name,
          price: item.price,
          description: item.description,
          sortOrder: itemIndex + 1,
          isVisible: true,
        },
      });
    }
  }

  // === One Sample Specials PDF record (no real file – staff will upload real ones) ===
  await prisma.special.create({
    data: {
      title: 'Tuesday Wing Night & Daily Specials',
      pdfPath: '/uploads/specials/placeholder-specials.pdf', // placeholder – real one uploaded in admin
      isVisible: true,
    },
  });

  console.log('✅ Seed complete!');
  console.log('   - 8 beers seeded');
  console.log('   - 4 menu categories with items');
  console.log('   - Site settings populated');
  console.log('   - 1 placeholder specials record');
  console.log('');
  console.log('Next steps:');
  console.log('  1. npm run db:push (if needed)');
  console.log('  2. npm run dev');
  console.log('  3. Go to /admin and upload real photos + a real specials PDF');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
