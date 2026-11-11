import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';

// @desc    Fetch all products with filtering, search, sorting
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, search, flavour, sort, featured, minPrice, maxPrice, limit, page } = req.query;

    let query = {};

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { flavour: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category (by id or by slug)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({
          $or: [{ slug: category.toLowerCase() }, { name: { $regex: category, $options: 'i' } }],
        });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    // Filter by flavour
    if (flavour && flavour !== 'all') {
      query.flavour = { $regex: flavour, $options: 'i' };
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'popular') sortOptions = { numReviews: -1, rating: -1 };
    else if (sort === 'name-asc') sortOptions = { name: 1 };

    const pageSize = Number(limit) || 50;
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug image')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      data: products,
      total: totalProducts,
      page: currentPage,
      pages: Math.ceil(totalProducts / pageSize),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug image');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      image,
      flavour,
      stock,
      isFeatured,
      tags,
      calories,
      allergens,
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and category are required',
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      category,
      image: image || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
      flavour: flavour || 'Artisan',
      stock: stock !== undefined ? Number(stock) : 50,
      isFeatured: Boolean(isFeatured),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : ['Artisan', 'Fresh']),
      calories: calories ? Number(calories) : 240,
      allergens: Array.isArray(allergens) ? allergens : ['Dairy'],
    });

    const populated = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Product created successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fields = [
      'name',
      'description',
      'price',
      'discountPrice',
      'category',
      'image',
      'flavour',
      'stock',
      'isFeatured',
      'tags',
      'calories',
      'allergens',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'tags' && typeof req.body[field] === 'string') {
          product[field] = req.body[field].split(',').map((s) => s.trim());
        } else {
          product[field] = req.body[field];
        }
      }
    });

    const updated = await product.save();
    const populated = await Product.findById(updated._id).populate('category', 'name slug');

    res.json({
      success: true,
      data: populated,
      message: 'Product updated successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.deleteOne({ _id: product._id });
    await Review.deleteMany({ product: product._id });

    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new review for product
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const alreadyReviewed = await Review.findOne({
      product: product._id,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
      await alreadyReviewed.save();
    } else {
      await Review.create({
        user: req.user._id,
        userName: req.user.name,
        userAvatar: req.user.profileImage,
        product: product._id,
        rating: Number(rating),
        comment,
      });
    }

    // Recalculate average rating
    const allReviews = await Review.find({ product: product._id });
    const avgRating =
      allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    product.rating = Math.round(avgRating * 10) / 10;
    product.numReviews = allReviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      rating: product.rating,
      numReviews: product.numReviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
