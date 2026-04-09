const {
    createFeedback,
    getFeedbacks,
    putFeedbackAvgRating,
    putFeedback,
    removeFeedback,
    submitPlatformReview,
    getPlatformReviews
} = require('../../services/feedback/feedbackService.js');
const { sendNotificationToUsers} = require("../../services/notifications/notificationService");
const Donation = require("../../models/donations/Donation.js");

exports.addFeedback = async (req, res) => {
    try {
        const { need, needId, content, description, rating, imageUrl } = req.body;

        const user =
            req.user?._id ||
            req.user?.id ||
            req.body.user;
        const uploadedImageUrl = req.file ? `/uploads/feedbacks/${req.file.filename}` : imageUrl;

        const savedFeedback = await createFeedback({
            need: need || needId,
            user,
            content: content || description,
            rating,
            imageUrl: uploadedImageUrl
        });

        if(process.env.NODE_ENV === "test") {

            try {
                const donorIds = await Donation.distinct("donor", {
                    need: savedFeedback.need?._id || savedFeedback.need,
                });

                if (donorIds.length > 0) {
                    const title = "New Feedback On A Need You Supported";
                    const body = `${req.user?.username || "A recipient"} added feedback for "${savedFeedback.need?.title || "a need"}".`;

                    await sendNotificationToUsers(donorIds, title, body, {
                        type: "need_feedback",
                        needId: (savedFeedback.need?._id || savedFeedback.need).toString(),
                        feedbackId: savedFeedback._id.toString(),
                    });
                }

            } catch (notificationError) {
                console.error("Feedback notification failed:", notificationError.message);
            }
        }

        res.status(201).json({ message: "Feedback added successfully", savedFeedback });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
}

exports.feedback = async (req, res) => {
    try {
        const feedbacks = await getFeedbacks();

        res.status(200).json({ message: "Feedbacks fetched successfully", feedbacks });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

exports.updateAvgRating = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedFeedback = await putFeedbackAvgRating(id);

        res.status(200).json({ message: "Average rating updated successfully", updatedFeedback });
    } catch (e) {
        if (e.message === "Feedback not found") {
            return res.status(404).json({ error: e.message });
        } else {
            res.status(500).json({ error: e.message });
        }
    }
}

exports.updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { need, needId, user, content, description, rating, imageUrl } = req.body;
        const uploadedImageUrl = req.file ? `/uploads/feedbacks/${req.file.filename}` : imageUrl;

        const updatedFeedback = await putFeedback(id, {
            need: need || needId,
            user,
            content: content || description,
            rating,
            imageUrl: uploadedImageUrl
        });

        res.status(200).json({ message: "Feedback updated successfully", updatedFeedback });
    } catch (e) {
        if (e.message === "Feedback not found") {
            return res.status(404).json({ error: e.message });
        } else {
            res.status(500).json({ error: e.message });
        }
    }
}

exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFeedback = await removeFeedback(id);

        res.status(200).json({ message: "Feedback deleted successfully", deletedFeedback });
    } catch (e) {
        if (e.message === "Feedback not found") {
            return res.status(404).json({ error: e.message });
        } else {
            res.status(500).json({ error: e.message });
        }
    }
}

exports.submitPlatformReview = async (req, res) => {
    try {
        const { content, rating } = req.body;
        const user = req.user._id;
        const saved = await submitPlatformReview({ user, content, rating });
        res.status(201).json({ success: true, message: "Review submitted successfully", data: saved });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
}

exports.getPlatformReviews = async (req, res) => {
    try {
        const reviews = await getPlatformReviews();
        res.status(200).json({ success: true, data: reviews });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
}
