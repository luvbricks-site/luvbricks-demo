/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1) Themes
  const themesData = [
    { slug: "star-wars",     name: "Star Wars" },
    { slug: "harry-potter",  name: "Harry Potter" },
    { slug: "friends",       name: "Friends" },
    { slug: "duplo",         name: "Duplo" },
    { slug: "city",          name: "City" },
    { slug: "marvel",        name: "Marvel" },
    { slug: "cmf-series",    name: "CMF Series" },
  ];

  const themesBySlug = {};
  for (const t of themesData) {
    themesBySlug[t.slug] = await prisma.theme.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  // 2) Helper — single declaration of mkProd (do not duplicate below)
  async function mkProd(p) {
    const createData = {
      slug: p.slug,
      setNumber: p.setNumber,
      name: p.name,
      description: p.description ?? "",
      themeId: themesBySlug[p.theme].id,
      msrpCents: p.msrpCents,
      ageMin: p.ageMin ?? null,
      ageMax: p.ageMax ?? null,
      pieces: p.pieces ?? null,
      isActive: true,
    };

    // IMPORTANT: include all fields you want the seed to change on re-run
    const updateData = {
      setNumber: p.setNumber,
      name: p.name,
      description: p.description ?? "",
      themeId: themesBySlug[p.theme].id,
      msrpCents: p.msrpCents,
      ageMin: p.ageMin ?? null,
      ageMax: p.ageMax ?? null,
      pieces: p.pieces ?? null,
      isActive: true,
    };

    // Look for an existing product by slug OR setNumber
const existing = await prisma.product.findFirst({
  where: {
    OR: [{ slug: p.slug }, { setNumber: p.setNumber }],
  },
  select: { id: true },
});

let product;
if (existing) {
  // Update the existing row — handles slug or setNumber changes
  product = await prisma.product.update({
    where: { id: existing.id },
    data: updateData,
  });
} else {
  // Create a new row
  product = await prisma.product.create({
    data: createData,
  });
}
const newSku = `SKU-${p.setNumber}`;
await prisma.inventory.deleteMany({
  where: {
    productId: product.id,
    NOT: { sku: newSku },
  },
});


    // Images (update or create per index)
    if (p.images?.length) {
      for (let i = 0; i < p.images.length; i++) {
        const img = p.images[i];
        await prisma.productImage.upsert({
          where: { id: `${product.id}_${i}` },
          update: { url: img.url, alt: img.alt ?? "", sortOrder: i },
          create: {
            id: `${product.id}_${i}`,
            productId: product.id,
            url: img.url,
            alt: img.alt ?? "",
            sortOrder: i,
          },
        });
      }
    }

    // Inventory (temporary dev qtys are fine)
    await prisma.inventory.upsert({
      where: { sku: `SKU-${p.setNumber}` },
      update: {
        qty: p.qty ?? 10,
        stockStatus: (p.qty ?? 10) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      },
      create: {
        sku: `SKU-${p.setNumber}`,
        productId: product.id,
        qty: p.qty ?? 10,
        stockStatus: (p.qty ?? 10) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      },
    });
  }

  // 3) Sample products (put images in /public/images/products/)
  await mkProd({
    slug: "jango-fetts-starship",
    setNumber: 75409,
    name: "Jango Fett's Starship",
    theme: "star-wars",
    msrpCents: 29999,           
    pieces: 2970,
    ageMin: 18,
    qty: 12,
    images: [{ url: "/images/jangofett_starship_lego.webp", alt: "Jango Fett’s Starship box" }],
  });
  await mkProd({
    slug: "at-at-driver-helmet",
    setNumber: 75429,
    name: "AT-AT Driver Helmet",
    theme: "star-wars",
    msrpCents: 6999,           
    pieces: 730,
    ageMin: 18,
    qty: 8,
    images: [{ url: "/images/at-at_driver_helmet_75429.jpg", alt: "AT-AT Driver Helmet box" }],
  });
  await mkProd({
    slug: "at-st",
    setNumber: 75417,
    name: "AT-ST",
    theme: "star-wars",
    msrpCents: 19999,           
    pieces: 1513,
    ageMin: 18,
    qty: 2,
    images: [{ url: "/images/at-st_75417.webp", alt: "AT-ST box" }],
  });
  await mkProd({
    slug: "battle-of-felucia-seperatist-mtt",
    setNumber: 75435,
    name: "Battle of Felucia Seperatist MTT",
    theme: "star-wars",
    msrpCents: 15999,           
    pieces: 976,
    ageMin: 9,
    qty: 6,
    images: [{ url: "/images/felucia_75435.jpg", alt: "Battle of Felucia Seperatist MTT box" }],
  });
  await mkProd({
    slug: "ahsoka's-jedi-interceptor",
    setNumber: 75401,
    name: "Ahsoka's Jedi Interceptor",
    theme: "star-wars",
    msrpCents: 4499,           
    pieces: 290,
    ageMin: 8,
    qty: 2,
    images: [{ url: "/images/ahsoka_interceptor_75401.jpg", alt: "Ahsoka's Jedi Interceptor box" }],
  });
  await mkProd({
    slug: "arc-170-starfighter",
    setNumber: 75402,
    name: "ARC-170 Starfighter",
    theme: "star-wars",
    msrpCents: 6999,           
    pieces: 497,
    ageMin: 9,
    qty: 14,
    images: [{ url: "/images/arc170_75402.jpg", alt: "ARC-170 Starfighter box" }],
  });
  await mkProd({
    slug: "grogu-with-hover-pram",
    setNumber: 75403,
    name: "Grogu with Hover Pram",
    theme: "star-wars",
    msrpCents: 9999,           
    pieces: 1048,
    ageMin: 10,
    qty: 11,
    images: [{ url: "/images/grogu_hover_pram_75403.jpg", alt: "Grogu with Hover Pram box" }],
  });
  await mkProd({
    slug: "f1-truck-with-rb20-amr24-f1-cars",
    setNumber: 60445,
    name: "F1 Truck with RB20 & AMR24 F1 Cars",
    theme: "city",
    msrpCents: 9999,           
    pieces: 1086,
    ageMin: 8,
    qty: 8,
    images: [{ url: "/images/f1_truck_60445.jpg", alt: "F1 Truck with RB20 & AMR24 F1 Cars box" }],
  });
  await mkProd({
    slug: "no-limits-race-car-ramp-track",
    setNumber: 60460,
    name: "No Limits: Race Car Ramp Track",
    theme: "city",
    msrpCents: 4999,           
    pieces: 436,
    ageMin: 6,
    qty: 12,
    images: [{ url: "/images/no_limits_car_ramp_60460.jpg", alt: "No Limits: Race Car Ramp Track box" }],
  });
  await mkProd({
    slug: "the-city-tower",
    setNumber: 60473,
    name: "The City Tower",
    theme: "city",
    msrpCents: 20999,           
    pieces: 1941,
    ageMin: 8,
    qty: 12,
    images: [{ url: "/images/city_tower_set.jpg", alt: "The City Tower box" }],
  });
  await mkProd({
    slug: "explorer-train",
    setNumber: 60470,
    name: "Explorer Train",
    theme: "city",
    msrpCents: 20999,           
    pieces: 1517,
    ageMin: 7,
    qty: 6,
    images: [{ url: "/images/explorer_train_60470.jpg", alt: "Explorer Train box" }],
  });
  await mkProd({
    slug: "wheel-loader",
    setNumber: 60450,
    name: "Wheel Loader",
    theme: "city",
    msrpCents: 1499,           
    pieces: 81,
    ageMin: 4,
    qty: 0,
    images: [{ url: "/images/yellow_wheel_loader_60450.png", alt: "Yellow Wheel Loader box" }],
  });
  await mkProd({
    slug: "donut-truck",
    setNumber: 60452,
    name: "Donut Truck",
    theme: "city",
    msrpCents: 1999,           
    pieces: 196,
    ageMin: 5,
    qty: 7,
    images: [{ url: "/images/donut_truck_60452.webp", alt: "Donut Truck box" }],
  });
  await mkProd({
    slug: "arctic-truck",
    setNumber: 60471,
    name: "Arctic Truck",
    theme: "city",
    msrpCents: 11999,           
    pieces: 1057,
    ageMin: 8,
    qty: 5,
    images: [{ url: "/images/arctic_truck_60471.webp", alt: "Arctic Truck box" }],
  });
  await mkProd({
    slug: "lego-minifigures-series-27-6-pack",
    setNumber: 66795,
    name: "Minifigures Series 27 {Random 6 Pack}",
    theme: "cmf-series",
    msrpCents: 2994,           
    pieces: 6,
    ageMin: 5,
    qty: 6,
    images: [{ url: "/images/cmf_27_6pk_66795.jpg", alt: "Minifigures Series 27 Random 6 Pack box" }],
  });
  await mkProd({
    slug: "lego-minifigures-series-27-random-pack",
    setNumber: 71048,
    name: "Minifigures Series 27 {Random Pack}",
    theme: "cmf-series",
    msrpCents: 499,           
    pieces: 1,
    ageMin: 5,
    qty: 6,
    images: [{ url: "/images/cmf_27_1pk_71048.jpg", alt: "Minifigures Series 27 Random Pack box" }],
  });
  await mkProd({
    slug: "cmf-f1-race-cars-random-pack",
    setNumber: 71049,
    name: "CMF F1 Race Cars {Random Pack}",
    theme: "cmf-series",
    msrpCents: 499,           
    pieces: 29,
    ageMin: 6,
    qty: 0,
    images: [{ url: "/images/cmf_f1racecars_1pk_71049.jpg", alt: "CMF F1 Race Cars Random Pack box" }],
  });
  await mkProd({
    slug: "cmf-spider-man-across-the-spiderverse-series-random-6-pack",
    setNumber: 66797,
    name: "CMF Spider-Man: Across the Spider-Verse Series {Random 6 Pack}",
    theme: "cmf-series",
    msrpCents: 2994,           
    pieces: 6,
    ageMin: 5,
    qty: 6,
    images: [{ url: "/images/cmf_spiderman_66797.jpg", alt: "CMF Spider-Man Across the Spider-Verse Series Random 6 Pack box" }],
  });
  await mkProd({
    slug: "cmf-spider-man-random-pack",
    setNumber: 71050,
    name: "CMF Spider-Man: Across the Spider-Verse Series {Random Pack}",
    theme: "cmf-series",
    msrpCents: 499,           
    pieces: 1,
    ageMin: 5,
    qty: 0,
    images: [{ url: "/images/cmf_spiderman_1pk_71050.jpg", alt: "CMF Spider-Man Across the Spider-Verse Series Random Pack box" }],
  });
  await mkProd({
    slug: "beekeepers-house-and-flower-garden",
    setNumber: 42669,
    name: "Beekepers' House and Flower Garden",
    theme: "friends",
    msrpCents: 8999,           
    pieces: 1161,
    ageMin: 12,
    qty: 10,
    images: [{ url: "/images/beekeepers_garden_42669.webp", alt: "Beekeepers house and flower garden box" }],
  });
  await mkProd({
    slug: "hearlake-city-apartments-and-stores",
    setNumber: 42670,
    name: "Heartlake City Apartments and Stores",
    theme: "friends",
    msrpCents: 16999,           
    pieces: 2040,
    ageMin: 12,
    qty: 4,
    images: [{ url: "/images/heartlake_apartments_42670.jpg", alt: "Heartlake City Apartments and Stores box" }],
  });
  await mkProd({
    slug: "plant-cafe-flower-shop",
    setNumber: 42671,
    name: "Plant Cafe & Flower Shop",
    theme: "friends",
    msrpCents: 9999,           
    pieces: 1138,
    ageMin: 9,
    qty: 8,
    images: [{ url: "/images/plant_cafe_42671.webp", alt: "Plant Cafe and Flower Shop box" }],
  });
  await mkProd({
    slug: "family-holiday-beach-resort",
    setNumber: 42673,
    name: "Family Holiday Beach Resort",
    theme: "friends",
    msrpCents: 12999,           
    pieces: 1140,
    ageMin: 8,
    qty: 2,
    images: [{ url: "/images/friends_strandresort_set.jpg", alt: "Family Holiday Beach Resort box" }],
  });
  await mkProd({
    slug: "guinea-pig-playground",
    setNumber: 42640,
    name: "Guinea Pig Playground",
    theme: "friends",
    msrpCents: 999,           
    pieces: 86,
    ageMin: 5,
    qty: 12,
    images: [{ url: "/images/guinea_pig_playground_42640.jpg", alt: "Guinea Pig Playground box" }],
  });
  await mkProd({
    slug: "comic-book-and-game-store",
    setNumber: 42674,
    name: "Comic Book and Game Store",
    theme: "friends",
    msrpCents: 9999,           
    pieces: 1005,
    ageMin: 9,
    qty: 1,
    images: [{ url: "/images/comic_book_game_shop_42674.jpg", alt: "Comic Book and Game Store box" }],
  });
  await mkProd({
    slug: "diagon-alley-wizarding-shops",
    setNumber: 76444,
    name: "Diagon Alley Wizarding Shops",
    theme: "harry-potter",
    msrpCents: 19999,           
    pieces: 2750,
    ageMin: 18,
    qty: 13,
    images: [{ url: "/images/diagon_alley_76444.jpg", alt: "Diagon Alley Wizarding Shops box" }],
  });
  await mkProd({
    slug: "malfoy-manor",
    setNumber: 76453,
    name: "Malfoy Manor",
    theme: "harry-potter",
    msrpCents: 14999,           
    pieces: 1601,
    ageMin: 10,
    qty: 7,
    images: [{ url: "/images/malfoy_manor_76453.webp", alt: "Malfoy Manor box" }],
  });
  await mkProd({
    slug: "book-nook-hogwarts-express",
    setNumber: 76450,
    name: "Book Nook: Hogwarts Express",
    theme: "harry-potter",
    msrpCents: 9999,           
    pieces: 832,
    ageMin: 10,
    qty: 0,
    images: [{ url: "/images/book_nook_hog_exp_76450.jpg", alt: "Book Nook Hogwarts Express box" }],
  });
  await mkProd({
    slug: "hogwarts-castle-the-main-tower",
    setNumber: 76454,
    name: "Hogwarts Castle: The Main Tower",
    theme: "harry-potter",
    msrpCents: 25999,           
    pieces: 2135,
    ageMin: 10,
    qty: 6,
    images: [{ url: "/images/hogwarts_castle_main_tower_76454.jpg", alt: "Hogwarts Castle The Main Tower box" }],
  });
  await mkProd({
    slug: "quality-quidditch-supplies-and-ice-cream-parlour",
    setNumber: 76452,
    name: "Quality Quidditch Supplies & Ice Cream Parlour",
    theme: "harry-potter",
    msrpCents: 9999,           
    pieces: 795,
    ageMin: 8,
    qty: 6,
    images: [{ url: "/images/quidditch_cream_parlour.jpg", alt: "Quality Quidditch Supplies and Ice Cream Parlour box" }],
  });
  await mkProd({
    slug: "marvel-logo",
    setNumber: 76313,
    name: "MARVEL Logo",
    theme: "marvel",
    msrpCents: 9999,           
    pieces: 931,
    ageMin: 12,
    qty: 6,
    images: [{ url: "/images/marvel_logo_76313.jpg", alt: "MARVEL Logo box" }],
  });
  await mkProd({
    slug: "avengers-endgame-final-battle",
    setNumber: 76323,
    name: "Avengers Endgame: Final Battle",
    theme: "marvel",
    msrpCents: 9999,           
    pieces: 931,
    ageMin: 10,
    qty: 0,
    images: [{ url: "/images/avengers_endgame_challenge_76323.jpg", alt: "Avengers Endgame Final Battle box" }],
  });
  await mkProd({
    slug: "spider-man-vs-oscorp",
    setNumber: 76324,
    name: "Spider-Man Vs. Oscorp",
    theme: "marvel",
    msrpCents: 13999,           
    pieces: 808,
    ageMin: 10,
    qty: 12,
    images: [{ url: "/images/spiderman_oscorp_76324.webp", alt: "Spider-Man Vs. Oscorp box" }],
  });
  await mkProd({
    slug: "avengers-age-of-ultron-quinjet",
    setNumber: 76325,
    name: "Avengers: Age of Ultron Quinjet",
    theme: "marvel",
    msrpCents: 12999,           
    pieces: 1131,
    ageMin: 12,
    qty: 14,
    images: [{ url: "/images/avengers_quinjet_76325.jpg", alt: "Avengers: Age of Ultron Quinjet box" }],
  });

await mkProd({
    slug: "captain-america-civil-war-battle",
    setNumber: 76314,
    name: "Captain America: Civil War Battle",
    theme: "marvel",
    msrpCents: 9999,           
    pieces: 736,
    ageMin: 10,
    qty: 9,
    images: [{ url: "/images/captain_america_civilwar_battle_76314.jpg", alt: "Captain America: Civil War Battle box" }],
  });
  await mkProd({
    slug: "blueys-house-game",
    setNumber: 10459,
    name: "Bluey's Family House with Memory Game",
    theme: "duplo",
    msrpCents: 6999,           
    pieces: 83,
    ageMin: 3,
    qty: 9,
    images: [{ url: "/images/blueys_house_game_10459.jpg", alt: "Bluey's Family House with Memory Game box" }],
  });
  await mkProd({
    slug: "funfair",
    setNumber: 10453,
    name: "Peppa Pig Funfair",
    theme: "duplo",
    msrpCents: 4999,           
    pieces: 53,
    ageMin: 2,
    qty: 2,
    images: [{ url: "/images/funfair_10453.jpg", alt: "Peppa Pig Funfair box" }],
  });
  await mkProd({
    slug: "frozen-castle-party",
    setNumber: 10455,
    name: "Anna and Elsa's Frozen Castle Party",
    theme: "duplo",
    msrpCents: 6499,           
    pieces: 54,
    ageMin: 2,
    qty: 0,
    images: [{ url: "/images/frozen_castle_party_10455.jpg", alt: "Anna and Elsa's Frozen Castle Party box" }],
  });
  await mkProd({
    slug: "hopsys-castle-game",
    setNumber: 10450,
    name: "Hopsy's Castle Game",
    theme: "duplo",
    msrpCents: 4499,           
    pieces: 47,
    ageMin: 3,
    qty: 13,
    images: [{ url: "/images/hopsys_castle_game_10450.jpg", alt: "Hopsy's Castle Game box" }],
  });
  await mkProd({
    slug: "first-time-airport",
    setNumber: 10443,
    name: "First Time at the Airport",
    theme: "duplo",
    msrpCents: 3499,           
    pieces: 23,
    ageMin: 2,
    qty: 10,
    images: [{ url: "/images/first_time_airport_10443.jpg", alt: "First Time at the Airport box" }],
  });
  
}

// Run the seed
main()
  .then(async () => {
    console.log("Seed complete.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
