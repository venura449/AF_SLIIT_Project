const {
  signupService,
  loginService,
  deleteProfileService,
  getAllUsersService,
  updateUserStatusService,
  updateUserService,
  updateEmailService,
  deleteUserService,
} = require("../../services/auth/authService");
const User = require("../../models/users/User");

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const result = await signupService(username, email, password, role);

    res.status(201).json({
      message: "User registered successfully",
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
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Get Profile Controller
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Profile Controller
exports.updateProfile = async (req, res) => {
  try {
    const { username, profile } = req.body;
    const { fullName, phone, address, bio, verificationDocs } = profile || {};

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username if provided
    if (username) {
      user.username = username;
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

    // Return user object directly (frontend expects this format)
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Profile Controller
exports.deleteProfile = async (req, res) => {
  try {
    const deletedUser = await deleteProfileService(req.user._id);

    res.status(200).json({
      message: "Profile deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Users Controller (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User Status Controller (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await updateUserStatusService(userId, isActive);

    res.status(200).json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update User Controller (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await updateUserService(userId, updateData);

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete User Controller (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await deleteUserService(userId);

    res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update User Email Controller
exports.updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user._id;

    const user = await updateEmailService(userId, newEmail);

    res.status(200).json({
      message: "Email updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
