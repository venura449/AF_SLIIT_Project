const messageService = require('../../services/donations/messageService');

exports.sendMessage = async (req, res) => {
    try {
        const { itemListingId, receiverId, content } = req.body;
        const message = await messageService.sendMessage({
            itemListing: itemListingId,
            sender: req.user._id,
            receiver: receiverId,
            content
        });
        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const messages = await messageService.getConversation(req.params.itemId, req.user._id);
        res.status(200).json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getMyConversations = async (req, res) => {
    try {
        const conversations = await messageService.getMyConversations(req.user._id);
        res.status(200).json({ success: true, data: conversations });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
