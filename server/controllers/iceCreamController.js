import IceCream from '../models/IceCream.js';
import Flavor from '../models/Flavor.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @desc    Get all ice creams with search, flavor filter & status filter
// @route   GET /api/icecreams
export const getIceCreams = async (req, res) => {
  try {
    const { search, flavor, status, sort } = req.query;
    let query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { description: regex }];
    }

    if (flavor && flavor !== 'all') {
      query.flavor = flavor;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'name-asc') sortOptions = { name: 1 };
    else if (sort === 'name-desc') sortOptions = { name: -1 };

    const iceCreams = await IceCream.find(query)
      .populate('flavor', 'name image status')
      .sort(sortOptions);

    res.json({
      success: true,
      count: iceCreams.length,
      data: iceCreams,
    });
  } catch (error) {
    console.error('Error in getIceCreams:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ice cream by ID
// @route   GET /api/icecreams/:id
export const getIceCreamById = async (req, res) => {
  try {
    const iceCream = await IceCream.findById(req.params.id).populate('flavor', 'name image status');
    if (!iceCream) {
      return res.status(404).json({ success: false, message: 'Ice cream variety not found' });
    }
    res.json({ success: true, data: iceCream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new ice cream variety & sync to Explore Artisanal Categories on website
// @route   POST /api/icecreams
export const createIceCream = async (req, res) => {
  try {
    const { name, description, price, image, flavor, category, customCategory, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Ice cream name is required' });
    }
    if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Valid price (greater than or equal to 0) is required' });
    }

    // 1. Verify flavor exists if provided (optional)
    let validFlavor = null;
    let flavorName = '';
    if (flavor && String(flavor).trim() !== '' && flavor !== 'none') {
      const flavorDoc = await Flavor.findById(flavor);
      if (flavorDoc) {
        validFlavor = flavorDoc._id;
        flavorName = flavorDoc.name;
      }
    }

    const trimmedName = name.trim();
    const finalImage = image || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80';
    const finalDesc = description ? description.trim() : `Freshly churned ${trimmedName} made with 100% natural dairy cream.`;

    // 2. Create new IceCream variety
    const newIceCream = await IceCream.create({
      name: trimmedName,
      description: finalDesc,
      price: Number(price),
      image: finalImage,
      flavor: validFlavor,
      status: status || 'Available',
    });

    // 3. Resolve or Create Category for "Explore Artisanal Categories"
    let targetCategory = null;
    let categoryNameToUse = '';

    if (customCategory && customCategory.trim()) {
      categoryNameToUse = customCategory.trim();
    } else if (category && category !== 'auto' && category !== 'new') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        targetCategory = await Category.findById(category);
      } else {
        categoryNameToUse = category.trim();
      }
    }

    if (!targetCategory) {
      if (!categoryNameToUse) {
        if (flavorName) {
          categoryNameToUse = flavorName;
        } else {
          categoryNameToUse = trimmedName;
        }
      }

      // Check if category exists with exact or similar name
      targetCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${categoryNameToUse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });

      // If not exact match, check if any category contains the name or vice versa
      if (!targetCategory) {
        const allCats = await Category.find({});
        for (const cat of allCats) {
          if (
            categoryNameToUse.toLowerCase().includes(cat.name.toLowerCase()) ||
            cat.name.toLowerCase().includes(categoryNameToUse.toLowerCase())
          ) {
            targetCategory = cat;
            break;
          }
        }
      }

      // If still not found, CREATE NEW CATEGORY so it appears in "Explore Artisanal Categories"!
      if (!targetCategory) {
        const generatedSlug = categoryNameToUse
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        targetCategory = await Category.create({
          name: categoryNameToUse,
          slug: generatedSlug,
          description: finalDesc,
          image: finalImage,
        });
      }
    }

    // 4. Create or sync corresponding Product for the Storefront Shop catalogue
    if (targetCategory) {
      let product = await Product.findOne({ name: trimmedName });
      if (!product) {
        await Product.create({
          name: trimmedName,
          description: finalDesc,
          price: Number(price),
          category: targetCategory._id,
          image: finalImage,
          flavour: flavorName || targetCategory.name,
          stock: status === 'Unavailable' ? 0 : 50,
          isFeatured: true,
          tags: ['Artisan', targetCategory.name],
        });
      } else {
        product.price = Number(price);
        product.image = finalImage;
        product.category = targetCategory._id;
        product.stock = status === 'Unavailable' ? 0 : 50;
        await product.save();
      }
    }

    const populated = await newIceCream.populate('flavor', 'name image status');

    res.status(201).json({
      success: true,
      data: populated,
      category: targetCategory,
      message: `Ice cream variety "${newIceCream.name}" added successfully and synced to Explore Artisanal Categories!`,
    });
  } catch (error) {
    console.error('Error in createIceCream:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update existing ice cream variety & sync to website catalogue
// @route   PUT /api/icecreams/:id
export const updateIceCream = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, flavor, category, customCategory, status } = req.body;

    const iceCream = await IceCream.findById(id);
    if (!iceCream) {
      return res.status(404).json({ success: false, message: 'Ice cream variety not found' });
    }

    const oldName = iceCream.name;

    if (name) iceCream.name = name.trim();
    if (description !== undefined) iceCream.description = description ? description.trim() : '';
    if (price !== undefined && !isNaN(price)) iceCream.price = Number(price);
    if (image) iceCream.image = image;
    if (status) iceCream.status = status;

    let flavorName = '';
    if (flavor !== undefined) {
      if (flavor && flavor !== 'none' && String(flavor).trim() !== '') {
        const flavorDoc = await Flavor.findById(flavor);
        if (flavorDoc) {
          iceCream.flavor = flavorDoc._id;
          flavorName = flavorDoc.name;
        }
      } else {
        iceCream.flavor = null;
      }
    }

    const saved = await iceCream.save();
    const populated = await saved.populate('flavor', 'name image status');

    // Sync updates to corresponding Product
    const product = await Product.findOne({ name: oldName });
    if (product) {
      if (name) product.name = name.trim();
      if (description !== undefined) product.description = description ? description.trim() : product.description;
      if (price !== undefined && !isNaN(price)) product.price = Number(price);
      if (image) product.image = image;
      if (status) product.stock = status === 'Unavailable' ? 0 : 50;
      await product.save();
    }

    res.json({
      success: true,
      data: populated,
      message: `Ice cream "${populated.name}" updated successfully!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ice cream variety & remove from catalogue
// @route   DELETE /api/icecreams/:id
export const deleteIceCream = async (req, res) => {
  try {
    const { id } = req.params;
    const iceCream = await IceCream.findById(id);

    if (!iceCream) {
      return res.status(404).json({ success: false, message: 'Ice cream variety not found' });
    }

    // Delete matching product from storefront catalogue
    const product = await Product.findOne({ name: iceCream.name });
    if (product) {
      const catId = product.category;
      await Product.deleteOne({ _id: product._id });

      // If category now has 0 products left and was custom-added, safely clean it up
      if (catId) {
        const remainingCount = await Product.countDocuments({ category: catId });
        if (remainingCount === 0) {
          const defaultSlugs = [
            'vanilla',
            'chocolate',
            'strawberry',
            'mango',
            'pistachio-nuts',
            'butterscotch',
            'cookies-cream',
            'coffee-mocha',
            'cotton-candy',
            'blueberry-cheesecake',
            'mint-choco-chip',
            'fruit-flavours',
          ];
          const catDoc = await Category.findById(catId);
          if (catDoc && !defaultSlugs.includes(catDoc.slug)) {
            await Category.deleteOne({ _id: catId });
          }
        }
      }
    }

    await IceCream.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Ice cream "${iceCream.name}" deleted successfully!`,
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

