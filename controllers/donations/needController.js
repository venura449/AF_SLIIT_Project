const Need = require("../../models/donations/Need.js");
const needService = require("../../services/donations/needService.js");

exports.createNeed = async (req, res) => {
  try {
    const need = await needService.createNeedRequest({
      ...req.body,
      recipient: req.user ? req.user._id : req.body.recipient,
    });
    res.status(201).json({ success: true, data: need });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllNeeds = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      urgency: req.query.urgency,
      location: req.query.location,
      status: req.query.status,
    };
    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await needService.getFilteredNeeds(filters, pagination);
    res.status(200).json({
      success: true,
      data: result.items,
      total: result.total,
      page: result.page,
      pages: result.pages,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateNeedsProgress = async (req, res) => {
  try {
    const { needId } = req.params;
    //for dubugging
    // console.log("Body received in controller:", req.body)
    const { amount, status } = req.body;

    const updatedNeed = await needService.updateNeedsStatus(needId, {
      amount,
      status,
    });

    res.status(200).json({ success: true, data: updatedNeed });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.uploadDocs = async (req, res) => {
  console.log("full request body:", req.body);
  console.log("full request files: ", req.files);
  try {
    const { needId } = req.params;

    console.log("Need ID received:", needId);
    console.log("Files received:", req.files);

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const updatedNeed = await needService.uploadVerificationDocs(
      needId,
      req.files,
    );
    res.status(200).json({ success: true, data: updatedNeed });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.verfyNeedRequest = async (req, res) => {
  try {
    const { needId } = req.params;

    const verifiedNeed = await Need.findByIdAndUpdate(
      needId,
      {
        isVerified: true,
        verifiedBy: req.user._id,
      },
      { new: true },
    );

    if (!verifiedNeed) {
      return res
        .status(400)
        .json({ success: false, message: "Need not found" });
    }

    res.status(200).json({
      success: true,
      data: verifiedNeed,
      message: "Need Request Verified Successfully",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//delete need request
exports.deleteNeed = async (req, res) => {
  try {
    const { needId } = req.params;
    const userId = req.user.id;

    await needService.deleteNeedRequest(needId, userId);

    res.status(200).json({
      success: true,
      message: "Need request deleted successfully",
    });
  } catch (error) {
    const statusCode = error.message === "Unauthorized" ? 403 : 400;
    res.status(statusCode).json({
        success: false,
        message: error.message
    });
  }
};
