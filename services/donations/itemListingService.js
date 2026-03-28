const ItemListing = require('../../models/donations/ItemListing');
const fs = require('fs');
const path = require('path');

exports.createItem = async ({ donor, title, description, category, condition, location, files }) => {
    if (!title || !description) {
        throw new Error('Title and description are required');
    }

    // files are already saved to disk by multer; store their serve paths
    const images = (files || []).map(file => `/uploads/item_images/${file.filename}`);

    const item = new ItemListing({ donor, title, description, category, condition, location, images });
    await item.save();
    return item;
};

exports.getMyItems = async (donorId) => {
    return await ItemListing.find({ donor: donorId }).sort({ createdAt: -1 });
};

exports.getAllAvailableItems = async () => {
    return await ItemListing.find({ status: 'Available' })
        .populate('donor', 'username email')
        .sort({ createdAt: -1 });
};

exports.getAllItems = async () => {
    return await ItemListing.find()
        .populate('donor', 'username email')
        .sort({ createdAt: -1 });
};

exports.getItemById = async (itemId) => {
    const item = await ItemListing.findById(itemId).populate('donor', 'username email');
    if (!item) throw new Error('Item not found');
    return item;
};

exports.updateItem = async (itemId, donorId, updateData) => {
    const item = await ItemListing.findById(itemId);
    if (!item) throw new Error('Item not found');
    if (item.donor.toString() !== donorId.toString()) throw new Error('Not authorized');

    const allowed = ['title', 'description', 'category', 'condition', 'location', 'status'];
    allowed.forEach((field) => {
        if (updateData[field] !== undefined) item[field] = updateData[field];
    });

    await item.save();
    return item;
};

exports.deleteItem = async (itemId, donorId) => {
    const item = await ItemListing.findById(itemId);
    if (!item) throw new Error('Item not found');
    if (item.donor.toString() !== donorId.toString()) throw new Error('Not authorized');

    // Delete images from local disk
    for (const imgPath of item.images) {
        const fullPath = path.join(__dirname, '../../', imgPath);
        fs.unlink(fullPath, () => { }); // ignore errors if file missing
    }

    await ItemListing.findByIdAndDelete(itemId);
    return item;
};
