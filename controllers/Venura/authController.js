const { signupService, loginService, deleteProfileService } = require('../../services/Venura/authService');
const User = require('../../models/Venura/User');

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const result = await signupService(username, email, password, role);

    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginService(email, password);

    res.status(200).json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Get Profile Controller
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Profile Controller
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, bio, verificationDocs } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    user.profile = {
      ...user.profile,
      fullName: fullName || user.profile?.fullName,
      phone: phone || user.profile?.phone,
      address: address || user.profile?.address,
      bio: bio || user.profile?.bio,
      verificationDocs: verificationDocs || user.profile?.verificationDocs,
    };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Profile Controller
exports.deleteProfile = async (req, res) => {
  try {
    const deletedUser = await deleteProfileService(req.user.id);

    res.status(200).json({
      message: 'Profile deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
