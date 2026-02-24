const {
  uploadNicDocumentService,
  getDocumentStatusService,
  getPendingDocumentsService,
  getUnverifiedUsersService,
  verifyDocumentService,
  getDocumentPathService,
} = require('../../services/Venura/documentService');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../../models/Venura/User');

// Upload NIC Document Controller
exports.uploadNicDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    const result = await uploadNicDocumentService(req.user._id, req.file);
    res.status(200).json({
      message: 'Document uploaded successfully. Awaiting admin verification.',
      user: result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Document Status Controller
exports.getDocumentStatus = async (req, res) => {
  try {
    const status = await getDocumentStatusService(req.user._id);
    res.status(200).json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Users with Pending Documents (Admin)
exports.getPendingDocuments = async (req, res) => {
  try {
    const users = await getPendingDocumentsService();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Unverified Users (Admin)
exports.getUnverifiedUsers = async (req, res) => {
  try {
    const users = await getUnverifiedUsersService();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify User Document (Admin)
exports.verifyDocument = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approve, rejectionReason } = req.body;

    if (typeof approve !== 'boolean') {
      return res.status(400).json({ error: 'Please specify approve as true or false' });
    }

    const user = await verifyDocumentService(userId, approve, rejectionReason);
    res.status(200).json({
      message: approve ? 'User document verified successfully' : 'User document rejected',
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get User Document File (Admin) - Also accepts token as query param
exports.getUserDocument = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check for token in query params (for img src) or use the one from middleware
    let user = req.user;
    if (!user && req.query.token) {
      try {
        const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
        user = await User.findById(decoded.userId).select('-password');
        if (!user || user.role !== 'Admin') {
          return res.status(403).json({ error: 'Admin access required' });
        }
      } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const documentPath = await getDocumentPathService(userId);

    // Resolve the absolute path
    const absolutePath = path.resolve(documentPath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Document file not found' });
    }

    // Send the file
    res.sendFile(absolutePath);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
