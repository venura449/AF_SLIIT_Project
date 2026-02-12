const { signupService, loginService } = require('../../services/Venura/authService');

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await signupService(username, email, password);

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
