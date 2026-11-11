import vanillaImg from './vanilla.jpg';
import chocolateImg from './chocolate.jpg';
import strawberryImg from './strawberry.jpg';
import mangoImg from './mango.jpg';
import pistachioNutsImg from './pistachio-nuts.jpg';
import butterscotchImg from './butterscotch.jpg';
import cookiesCreamImg from './cookies-cream.jpg';
import coffeeMochaImg from './coffee-mocha.jpg';
import cottonCandyImg from './cotton-candy.jpg';
import blueberryCheesecakeImg from './blueberry-cheesecake.jpg';
import mintChocoChipImg from './mint-choco-chip.jpg';
import fruitFlavoursImg from './fruit-flavours.jpg';

export const categoryImages = {
  vanilla: vanillaImg,
  chocolate: chocolateImg,
  strawberry: strawberryImg,
  mango: mangoImg,
  'pistachio-nuts': pistachioNutsImg,
  butterscotch: butterscotchImg,
  'cookies-cream': cookiesCreamImg,
  'coffee-mocha': coffeeMochaImg,
  'cotton-candy': cottonCandyImg,
  'blueberry-cheesecake': blueberryCheesecakeImg,
  'mint-choco-chip': mintChocoChipImg,
  'fruit-flavours': fruitFlavoursImg,
};

export const getCategoryImage = (category) => {
  if (!category) return vanillaImg;

  // Try by exact slug
  if (category.slug && categoryImages[category.slug]) {
    return categoryImages[category.slug];
  }

  // Normalized lookup by name
  const normalized = (category.slug || category.name || '')
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-');

  if (categoryImages[normalized]) {
    return categoryImages[normalized];
  }

  // Substring match
  const nameLower = (category.name || '').toLowerCase();
  for (const [key, img] of Object.entries(categoryImages)) {
    const cleanKey = key.replace(/-/g, ' ');
    if (nameLower.includes(cleanKey) || cleanKey.includes(nameLower)) {
      return img;
    }
  }

  // Check if category has a valid local asset path
  if (category.image && !category.image.startsWith('http')) {
    return category.image;
  }

  return vanillaImg;
};

export default categoryImages;

