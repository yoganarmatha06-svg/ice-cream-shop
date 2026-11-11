import Flavor from '../models/Flavor.js';
import IceCream from '../models/IceCream.js';

// @desc    Get all flavors with search & count of assigned ice creams
// @route   GET /api/flavors
export const getFlavors = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { description: regex }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const flavors = await Flavor.find(query).sort({ createdAt: -1 });

    // Calculate assigned ice cream count for each flavor
    const flavorsWithCount = await Promise.all(
      flavors.map(async (flavor) => {
        const count = await IceCream.countDocuments({ flavor: flavor._id });
        return {
          ...flavor.toObject(),
          assignedIceCreamCount: count,
        };
      })
    );

    res.json({
      success: true,
      count: flavorsWithCount.length,
      data: flavorsWithCount,
    });
  } catch (error) {
    console.error('Error in getFlavors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single flavor by ID
// @route   GET /api/flavors/:id
export const getFlavorById = async (req, res) => {
  try {
    const flavor = await Flavor.findById(req.params.id);
    if (!flavor) {
      return res.status(404).json({ success: false, message: 'Flavor not found' });
    }

    const assignedIceCreams = await IceCream.find({ flavor: flavor._id }).select('name price image status');

    res.json({
      success: true,
      data: {
        ...flavor.toObject(),
        assignedIceCreamCount: assignedIceCreams.length,
        assignedIceCreams,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new flavor
// @route   POST /api/flavors
export const createFlavor = async (req, res) => {
  try {
    const { name, description, image, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Flavor name is required' });
    }

    const existingFlavor = await Flavor.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existingFlavor) {
      return res.status(400).json({
        success: false,
        message: `A flavor with the name "${name.trim()}" already exists.`,
      });
    }

    const newFlavor = await Flavor.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      image: image || 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      data: newFlavor,
      message: `Flavor "${newFlavor.name}" created successfully!`,
    });
  } catch (error) {
    console.error('Error in createFlavor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update existing flavor
// @route   PUT /api/flavors/:id
export const updateFlavor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, status } = req.body;

    const flavor = await Flavor.findById(id);
    if (!flavor) {
      return res.status(404).json({ success: false, message: 'Flavor not found' });
    }

    if (name && name.trim().toLowerCase() !== flavor.name.toLowerCase()) {
      const existing = await Flavor.findOne({
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Another flavor with the name "${name.trim()}" already exists.`,
        });
      }
      flavor.name = name.trim();
    }

    if (description !== undefined) flavor.description = description.trim();
    if (image) flavor.image = image;
    if (status) flavor.status = status;

    const updatedFlavor = await flavor.save();

    res.json({
      success: true,
      data: updatedFlavor,
      message: `Flavor "${updatedFlavor.name}" updated successfully!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete flavor (Blocks deletion if assigned to any Ice Cream)
// @route   DELETE /api/flavors/:id
export const deleteFlavor = async (req, res) => {
  try {
    const { id } = req.params;
    const flavor = await Flavor.findById(id);

    if (!flavor) {
      return res.status(404).json({ success: false, message: 'Flavor not found' });
    }

    // Check if any Ice Cream variety is using this flavor
    const assignedIceCreams = await IceCream.find({ flavor: id }).select('name');
    if (assignedIceCreams.length > 0) {
      const namesList = assignedIceCreams.map((i) => `"${i.name}"`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Cannot delete flavor "${flavor.name}"! It is currently assigned to ${assignedIceCreams.length} ice cream ${assignedIceCreams.length === 1 ? 'variety' : 'varieties'} (${namesList}). Please reassign or delete these ice creams before removing this flavor.`,
        assignedCount: assignedIceCreams.length,
        assignedIceCreams,
      });
    }

    await Flavor.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Flavor "${flavor.name}" deleted successfully!`,
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

