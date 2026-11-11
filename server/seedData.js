import Admin from './models/Admin.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';
import Review from './models/Review.js';
import Flavor from './models/Flavor.js';
import IceCream from './models/IceCream.js';

export const seedDatabase = async () => {
  try {
    console.log(' Seeding fresh Scoop Dreams artisan database with Vanilla & new flavours...');

    // 1. Seed Admin and User Collections
    await Admin.deleteMany({});
    const adminAccount = await Admin.create({
      name: 'Scoop Dreams Admin',
      email: 'admin@scoopdreams.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.deleteMany({});
    const demoUser = await User.create({
      name: 'Emma Watson',
      email: 'user@scoopdreams.com',
      password: 'user123',
      phone: '+1 (555) 123-4567',
      role: 'user',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    });

    // 2. Seed Categories (Including prominent Vanilla and new popular flavours)
    await Category.deleteMany({});
    const categoriesData = [
      {
        name: 'Vanilla',
        description: 'Pure Madagascar bourbon vanilla pods steeped in slow-churned sweet cream.',
        image: '/images/categories/vanilla.jpg',
        slug: 'vanilla',
      },
      {
        name: 'Chocolate',
        description: 'Decadent 72% Belgian dark cocoa ribbons and truffle crumbles.',
        image: '/images/categories/chocolate.jpg',
        slug: 'chocolate',
      },
      {
        name: 'Strawberry',
        description: 'Fresh farm-picked strawberries blended with organic heavy cream.',
        image: '/images/categories/strawberry.jpg',
        slug: 'strawberry',
      },
      {
        name: 'Mango',
        description: 'Sun-ripened Alphonso mangoes churned to velvety perfection.',
        image: '/images/categories/mango.jpg',
        slug: 'mango',
      },
      {
        name: 'Pistachio & Nuts',
        description: 'Roasted Sicilian pistachios with aromatic cardamom infusion.',
        image: '/images/categories/pistachio-nuts.jpg',
        slug: 'pistachio-nuts',
      },
      {
        name: 'Butterscotch',
        description: 'Golden caramelized brown butter swirls with flaky sea-salt crunch.',
        image: '/images/categories/butterscotch.jpg',
        slug: 'butterscotch',
      },
      {
        name: 'Cookies & Cream',
        description: 'Crunchy crushed chocolate sandwich cookies with soft vanilla dough drops.',
        image: '/images/categories/cookies-cream.jpg',
        slug: 'cookies-cream',
      },
      {
        name: 'Coffee & Mocha',
        description: 'Cold-brewed Colombian arabica espresso folded with dark mocha fudge.',
        image: '/images/categories/coffee-mocha.jpg',
        slug: 'coffee-mocha',
      },
      {
        name: 'Cotton Candy',
        description: 'Carnival spun sugar pastel swirls with rainbow sprinkles and sweet nostalgia.',
        image: '/images/categories/cotton-candy.jpg',
        slug: 'cotton-candy',
      },
      {
        name: 'Blueberry & Cheesecake',
        description: 'Velvety cream cheesecake ice cream ribboned with wild blueberry coulis.',
        image: '/images/categories/blueberry-cheesecake.jpg',
        slug: 'blueberry-cheesecake',
      },
      {
        name: 'Mint Choco Chip',
        description: 'Crisp organic peppermint cream loaded with flaky dark cacao chips.',
        image: '/images/categories/mint-choco-chip.jpg',
        slug: 'mint-choco-chip',
      },
      {
        name: 'Fruit Flavours',
        description: 'Exotic wild berries, zesty citrus, and refreshing natural sorbets.',
        image: '/images/categories/fruit-flavours.jpg',
        slug: 'fruit-flavours',
      },
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    // 2b. Seed Flavors (Exact Schema: name, description, image, status)
    await Flavor.deleteMany({});
    const flavorsData = categoriesData.map((c) => ({
      name: c.name,
      description: c.description,
      image: c.image,
      status: 'Active',
    }));
    const createdFlavors = await Flavor.insertMany(flavorsData);
    const flavorMap = {};
    createdFlavors.forEach((f) => {
      flavorMap[f.name.toLowerCase()] = f._id;
    });

    // 3. Seed Products (Including multiple delicious Vanilla products & new flavour varieties)
    await Product.deleteMany({});
    const productsData = [
      // --- Vanilla Flavours ---
      {
        name: 'Classic Vanilla Cloud',
        description: 'Slow-steeped Madagascar Bourbon vanilla bean gelato with subtle flecks of cacao nibs and whipped velvet texture.',
        price: 4.99,
        discountPrice: 4.25,
        category: catMap['vanilla'],
        image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
        flavour: 'Bourbon Vanilla',
        stock: 80,
        rating: 4.9,
        numReviews: 95,
        isFeatured: true,
        tags: ['All-Time Favorite', 'Organic', 'Bestseller'],
        calories: 190,
        allergens: ['Dairy'],
      },
      {
        name: 'French Vanilla Bean Custard',
        description: 'Traditional slow-cooked French egg-yolk custard churned with Tahitian and Bourbon vanilla caviar and caramelized wafer crisps.',
        price: 5.49,
        discountPrice: 4.80,
        category: catMap['vanilla'],
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
        flavour: 'French Vanilla',
        stock: 65,
        rating: 5.0,
        numReviews: 68,
        isFeatured: true,
        tags: ['Chef Signature', 'Ultra Creamy'],
        calories: 210,
        allergens: ['Dairy', 'Eggs'],
      },
      {
        name: 'Vanilla Salted Honey Caramel',
        description: 'Bourbon vanilla bean gelato ribboned with golden wildflower honey caramel and hand-crushed Maldon sea-salt flakes.',
        price: 5.75,
        discountPrice: 4.99,
        category: catMap['vanilla'],
        image: 'https://images.unsplash.com/photo-1560008511-11c63416e52d?auto=format&fit=crop&w=600&q=80',
        flavour: 'Vanilla Caramel',
        stock: 50,
        rating: 4.9,
        numReviews: 42,
        isFeatured: true,
        tags: ['Sweet & Salty', 'Artisan Choice'],
        calories: 225,
        allergens: ['Dairy'],
      },

      // --- Strawberry Flavours ---
      {
        name: 'Berry Blush Swirl',
        description: 'Handcrafted raspberry and wild strawberry cream with luscious raspberry coulis and fresh forest berries in a crisp waffle cone.',
        price: 5.99,
        discountPrice: 4.99,
        category: catMap['strawberry'],
        image: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80',
        flavour: 'Strawberry & Berry',
        stock: 45,
        rating: 4.9,
        numReviews: 48,
        isFeatured: true,
        tags: ['Signature', 'Fresh Fruit', 'Bestseller'],
        calories: 220,
        allergens: ['Dairy'],
      },
      {
        name: 'Wild Strawberry & Mascarpone',
        description: 'Italian mascarpone sweet cream swirled with mountain wild strawberries and balsamic reduction pearls.',
        price: 6.40,
        discountPrice: 5.50,
        category: catMap['strawberry'],
        image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=600&q=80',
        flavour: 'Strawberry Mascarpone',
        stock: 28,
        rating: 4.9,
        numReviews: 31,
        isFeatured: false,
        tags: ['Gourmet', 'Chef Special'],
        calories: 235,
        allergens: ['Dairy'],
      },

      // --- Mango Flavours ---
      {
        name: 'Mango Velvet Drip',
        description: 'Vibrant Ratnagiri Alphonso mango gelato enriched with silky passionfruit drizzle and candied mango pearls.',
        price: 6.25,
        discountPrice: 5.49,
        category: catMap['mango'],
        image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
        flavour: 'Tropical Mango',
        stock: 38,
        rating: 4.9,
        numReviews: 62,
        isFeatured: true,
        tags: ['Seasonal', 'Gluten-Free', 'Bestseller'],
        calories: 210,
        allergens: ['Dairy'],
      },

      // --- Pistachio Flavours ---
      {
        name: 'Pistachio Dream Cream',
        description: 'Roasted Bronte pistachio custard laced with delicate mint notes, dark chocolate shavings, and toasted nut clusters.',
        price: 6.75,
        discountPrice: 5.95,
        category: catMap['pistachio-nuts'],
        image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
        flavour: 'Pistachio & Mint',
        stock: 30,
        rating: 5.0,
        numReviews: 53,
        isFeatured: true,
        tags: ['Artisan Choice', 'Award Winner'],
        calories: 260,
        allergens: ['Dairy', 'Tree Nuts'],
      },
      {
        name: 'Royal Kesar Pista Royale',
        description: 'Kashmiri saffron threads steeped in condensed milk cream, loaded with pistachios and slivered California almonds.',
        price: 6.95,
        discountPrice: 6.20,
        category: catMap['pistachio-nuts'],
        image: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80',
        flavour: 'Saffron & Pistachio',
        stock: 33,
        rating: 5.0,
        numReviews: 76,
        isFeatured: false,
        tags: ['Heritage', 'Rich Royale'],
        calories: 275,
        allergens: ['Dairy', 'Tree Nuts'],
      },

      // --- Chocolate Flavours ---
      {
        name: 'Belgian Dark Truffle',
        description: 'Intense 75% Single-Origin Callebaut dark chocolate with melted truffle swirls and chocolate flake crunch.',
        price: 6.50,
        discountPrice: 5.80,
        category: catMap['chocolate'],
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
        flavour: 'Dark Chocolate',
        stock: 35,
        rating: 4.9,
        numReviews: 44,
        isFeatured: true,
        tags: ['Pure Chocolate', 'Decadent'],
        calories: 290,
        allergens: ['Dairy', 'Soy'],
      },
      {
        name: 'Hazelnut Cocoa Crunch',
        description: 'Piedmont roasted hazelnuts ground into velvety Gianduja chocolate ice cream with crunchy praline bits.',
        price: 6.49,
        discountPrice: 5.75,
        category: catMap['chocolate'],
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
        flavour: 'Chocolate Hazelnut',
        stock: 42,
        rating: 4.9,
        numReviews: 81,
        isFeatured: true,
        tags: ['Decadent', 'Bestseller'],
        calories: 280,
        allergens: ['Dairy', 'Tree Nuts'],
      },

      // --- Butterscotch Flavours ---
      {
        name: 'Salted Butterscotch Swirl',
        description: 'Slow-simmered brown sugar butterscotch ribbon infused with Maldon sea salt and butter-toasted toffee pebbles.',
        price: 5.95,
        discountPrice: 5.25,
        category: catMap['butterscotch'],
        image: 'https://images.unsplash.com/photo-1560008511-11c63416e52d?auto=format&fit=crop&w=600&q=80',
        flavour: 'Butterscotch & Caramel',
        stock: 50,
        rating: 4.8,
        numReviews: 39,
        isFeatured: false,
        tags: ['Sweet & Salty', 'Classic'],
        calories: 250,
        allergens: ['Dairy'],
      },

      // --- Cookies & Cream (NEW) ---
      {
        name: 'Midnight Oreo Cookie Dough',
        description: 'Rich sweet cream infused with crushed dark Oreo sandwich cookies and soft vanilla chocolate chip cookie dough nuggets.',
        price: 6.20,
        discountPrice: 5.40,
        category: catMap['cookies-cream'],
        image: 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=600&q=80',
        flavour: 'Cookies & Cream',
        stock: 55,
        rating: 4.9,
        numReviews: 87,
        isFeatured: true,
        tags: ['Crowd Favorite', 'Crunchy Dough'],
        calories: 270,
        allergens: ['Dairy', 'Gluten', 'Soy'],
      },

      // --- Coffee & Mocha (NEW) ---
      {
        name: 'Cold Brew Mocha Hazelnut',
        description: 'Artisanal cold-brew Arabica coffee gelato with dark chocolate fudge swirl and roasted hazelnut praline.',
        price: 6.35,
        discountPrice: 5.50,
        category: catMap['coffee-mocha'],
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
        flavour: 'Mocha Coffee',
        stock: 36,
        rating: 4.9,
        numReviews: 51,
        isFeatured: true,
        tags: ['Coffee Lovers', 'Caffeine Kick'],
        calories: 240,
        allergens: ['Dairy', 'Tree Nuts'],
      },
      {
        name: 'Caramel Macchiato Crunch',
        description: 'Cold-brewed espresso ice cream swirled with golden dulce de leche caramel and crushed Italian biscotti pieces.',
        price: 6.10,
        discountPrice: 5.25,
        category: catMap['coffee-mocha'],
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
        flavour: 'Coffee & Caramel',
        stock: 36,
        rating: 4.8,
        numReviews: 35,
        isFeatured: false,
        tags: ['Coffee Lovers', 'Energy Boost'],
        calories: 245,
        allergens: ['Dairy', 'Gluten'],
      },

      // --- Cotton Candy (NEW) ---
      {
        name: 'Unicorn Dream Cotton Candy',
        description: 'Magical ribbons of spun pink and blue carnival sugar crystals swirled in sweet cream with rainbow candy pearls.',
        price: 5.99,
        discountPrice: 5.20,
        category: catMap['cotton-candy'],
        image: 'https://images.unsplash.com/photo-1516559828984-fb3b99548b21?auto=format&fit=crop&w=600&q=80',
        flavour: 'Cotton Candy',
        stock: 40,
        rating: 4.8,
        numReviews: 64,
        isFeatured: true,
        tags: ['Kids & Teens', 'Pastel Magic', 'Carnival'],
        calories: 215,
        allergens: ['Dairy'],
      },

      // --- Blueberry & Cheesecake (NEW) ---
      {
        name: 'Wild Blueberry Graham Cheesecake',
        description: 'Rich Philadelphia-style cream cheese gelato folded with wild Maine blueberry coulis and buttery graham cracker crust crumble.',
        price: 6.45,
        discountPrice: 5.75,
        category: catMap['blueberry-cheesecake'],
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80',
        flavour: 'Blueberry Cheesecake',
        stock: 32,
        rating: 5.0,
        numReviews: 58,
        isFeatured: true,
        tags: ['Cheesecake Lover', 'Gourmet Dessert'],
        calories: 265,
        allergens: ['Dairy', 'Gluten'],
      },

      // --- Mint Choco Chip (NEW) ---
      {
        name: 'Midnight Mint Cacao Chip',
        description: 'Crisp organic garden peppermint ice cream packed with chunky semi-sweet dark cacao chunks and melted chocolate ribbon.',
        price: 5.75,
        discountPrice: 4.99,
        category: catMap['mint-choco-chip'],
        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
        flavour: 'Mint Chocolate',
        stock: 40,
        rating: 4.8,
        numReviews: 45,
        isFeatured: false,
        tags: ['Refreshing', 'Minty Classic'],
        calories: 230,
        allergens: ['Dairy', 'Soy'],
      },

      // --- Fruit Flavours ---
      {
        name: 'Lavender Honey & Blackberry',
        description: 'Infusion of French culinary lavender blossoms, raw wildflower honey, and tart mountain blackberry ribbons.',
        price: 6.80,
        discountPrice: 6.00,
        category: catMap['fruit-flavours'],
        image: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=600&q=80',
        flavour: 'Lavender & Blackberry',
        stock: 22,
        rating: 4.7,
        numReviews: 19,
        isFeatured: true,
        tags: ['Floral & Fruity', 'Artisan Choice'],
        calories: 215,
        allergens: ['Dairy'],
      },
    ];

    const createdProducts = await Product.insertMany(productsData);

    // 3b. Seed IceCream Varieties (Exact Schema: name, description, price, image, flavor, status)
    await IceCream.deleteMany({});
    const iceCreamsData = productsData.map((p) => {
      const catObj = createdCategories.find((c) => String(c._id) === String(p.category));
      const fName = catObj ? catObj.name.toLowerCase() : 'vanilla';
      const fId = flavorMap[fName] || createdFlavors[0]._id;
      return {
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        flavor: fId,
        status: p.stock > 0 ? 'Available' : 'Unavailable',
      };
    });
    const createdIceCreams = await IceCream.insertMany(iceCreamsData);

    // 4. Seed Coupons
    await Coupon.deleteMany({});
    await Coupon.insertMany([
      {
        code: 'SCOOP20',
        discount: 20,
        discountType: 'percentage',
        minSpend: 15,
        usageLimit: 200,
        usedCount: 14,
        isActive: true,
      },
      {
        code: 'SWEET10',
        discount: 10,
        discountType: 'percentage',
        minSpend: 10,
        usageLimit: 500,
        usedCount: 42,
        isActive: true,
      },
      {
        code: 'WELCOME5',
        discount: 5,
        discountType: 'fixed',
        minSpend: 20,
        usageLimit: 100,
        usedCount: 8,
        isActive: true,
      },
    ]);

    // 5. Seed Reviews
    await Review.deleteMany({});
    const sampleReviews = [
      {
        user: demoUser._id,
        userName: demoUser.name,
        userAvatar: demoUser.profileImage,
        product: createdProducts[0]._id, // Classic Vanilla Cloud
        rating: 5,
        comment: 'The Bourbon Vanilla bean aroma is unmatched! Pure, authentic, velvety cream perfection.',
      },
      {
        user: demoUser._id,
        userName: 'Sophia Laurent',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        product: createdProducts[3]._id, // Berry Blush Swirl
        rating: 5,
        comment: 'Hands down the most divine strawberry ice cream I have ever tasted! Velvety smooth with real berries.',
      },
      {
        user: demoUser._id,
        userName: 'Marcus Sterling',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        product: createdProducts[6]._id, // Pistachio Dream Cream
        rating: 5,
        comment: 'The pistachio flavor is so authentic and rich! You can tell they use genuine Sicilian pistachios.',
      },
      {
        user: demoUser._id,
        userName: 'Chloe Bennett',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        product: createdProducts[11]._id, // Midnight Oreo Cookie Dough
        rating: 5,
        comment: 'The chunks of cookie dough and crushed Oreos are beyond generous! Absolute favorite.',
      },
    ];

    await Review.insertMany(sampleReviews);

    console.log(` Scoop Dreams database seeded successfully with ${createdCategories.length} categories and ${createdProducts.length} artisanal flavours!`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
