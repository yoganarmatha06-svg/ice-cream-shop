import IceCream from '../models/IceCream.js';
import Flavor from '../models/Flavor.js';

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

// @desc    Create new ice cream variety
// @route   POST /api/icecreams
export const createIceCream = async (req, res) => {
  try {
    const { name, description, price, image, flavor, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Ice cream name is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }
    if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Valid price (greater than or equal to 0) is required' });
    }
    if (!flavor) {
      return res.status(400).json({ success: false, message: 'Flavor selection is required' });
    }

    // Verify flavor exists
    const flavorDoc = await Flavor.findById(flavor);
    if (!flavorDoc) {
      return res.status(400).json({ success: false, message: 'Selected flavor does not exist' });
    }

    const newIceCream = await IceCream.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
      flavor,
      status: status || 'Available',
    });

    const populated = await newIceCream.populate('flavor', 'name image status');

    res.status(201).json({
      success: true,
      data: populated,
      message: `Ice cream variety "${newIceCream.name}" added successfully!`,
    });
  } catch (error) {
    console.error('Error in createIceCream:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update existing ice cream variety
// @route   PUT /api/icecreams/:id
export const updateIceCream = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, flavor, status } = req.body;

    const iceCream = await IceCream.findById(id);
    if (!iceCream) {
      return res.status(404).json({ success: false, message: 'Ice cream variety not found' });
    }

    if (name) iceCream.name = name.trim();
    if (description) iceCream.description = description.trim();
    if (price !== undefined && !isNaN(price)) iceCream.price = Number(price);
    if (image) iceCream.image = image;
    if (status) iceCream.status = status;

    if (flavor && flavor !== String(iceCream.flavor)) {
      const flavorDoc = await Flavor.findById(flavor);
      if (!flavorDoc) {
        return res.status(400).json({ success: false, message: 'Selected flavor does not exist' });
      }
      iceCream.flavor = flavor;
    }

    const saved = await iceCream.save();
    const populated = await saved.populate('flavor', 'name image status');

    res.json({
      success: true,
      data: populated,
      message: `Ice cream "${populated.name}" updated successfully!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ice cream variety
// @route   DELETE /api/icecreams/:id
export const deleteIceCream = async (req, res) => {
  try {
    const { id } = req.params;
    const iceCream = await IceCream.findById(id);

    if (!iceCream) {
      return res.status(404).json({ success: false, message: 'Ice cream variety not found' });
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

