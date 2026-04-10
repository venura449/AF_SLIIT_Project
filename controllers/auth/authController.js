const {
  signupService,
  loginService,
  deleteProfileService,
  getAllUsersService,
  updateUserStatusService,
  updateUserService,
  updateEmailService,
  deleteUserService,
  forgotPasswordService,
  resetPasswordService,
} = require("../../services/auth/authService");
const User = require("../../models/users/User");
const { validateUserPresent } = require("../../utils/helperFunctions.js");
const { updateUsername } = require("../../utils/helperFunctions.js");

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
    const authErrors = [
      'Email and password are required',
      'Invalid email or password',
    ];
    const status = authErrors.includes(error.message) ? 401 : 500;
    res.status(status).json({ error: error.message });
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

    validateUserPresent(user);

    // Validate username: only letters and underscores, max 8 characters
    if (username) {
      if (username.length > 8) {
        return res.status(400).json({ error: "Username cannot exceed 8 characters" });
      }
      if (!/^[a-zA-Z_]+$/.test(username)) {
        return res.status(400).json({ error: "Username can only contain letters and underscores" });
      }
    }

    // Validate phone: exactly 10 digits
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    updateUsername(user, username);

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

// Forgot Password Controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reset Password Controller
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const result = await resetPasswordService(token, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
