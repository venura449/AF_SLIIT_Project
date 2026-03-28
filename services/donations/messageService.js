const Message = require('../../models/donations/Message');

exports.sendMessage = async ({ itemListing, sender, receiver, content }) => {
    if (!content || !content.trim()) {
        throw new Error('Message content is required');
    }
    const message = new Message({ itemListing, sender, receiver, content: content.trim() });
    await message.save();
    return message.populate('sender', 'username email role');
};

exports.getConversation = async (itemListingId, userId) => {
    return await Message.find({
        itemListing: itemListingId,
        $or: [{ sender: userId }, { receiver: userId }]
    })
        .populate('sender', 'username email role')
        .populate('receiver', 'username email role')
        .sort({ createdAt: 1 });
};

exports.getMyConversations = async (userId) => {
    // Get distinct item listings where user has messages
    const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }]
    }).distinct('itemListing');

    const ItemListing = require('../../models/donations/ItemListing');
    const conversations = [];

    for (const itemId of messages) {
        const item = await ItemListing.findById(itemId).populate('donor', 'username email');
        if (!item) continue;

        const lastMessage = await Message.findOne({ itemListing: itemId, $or: [{ sender: userId }, { receiver: userId }] })
            .sort({ createdAt: -1 })
            .populate('sender', 'username');

        conversations.push({ item, lastMessage });
    }

    conversations.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
    return conversations;
};
