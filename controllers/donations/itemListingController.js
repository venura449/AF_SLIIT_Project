const itemService = require('../../services/donations/itemListingService');

exports.createItem = async (req, res) => {
    try {
        const { title, description, category, condition, location } = req.body;
        const item = await itemService.createItem({
            donor: req.user._id,
            title,
            description,
            category,
            condition,
            location,
            files: req.files || []
        });
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getMyItems = async (req, res) => {
    try {
        const items = await itemService.getMyItems(req.user._id);
        res.status(200).json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAllAvailableItems = async (req, res) => {
    try {
        const items = await itemService.getAllAvailableItems();
        res.status(200).json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const items = await itemService.getAllItems();
        res.status(200).json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const item = await itemService.getItemById(req.params.id);
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const item = await itemService.updateItem(req.params.id, req.user._id, req.body);
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        await itemService.deleteItem(req.params.id, req.user._id);
        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
