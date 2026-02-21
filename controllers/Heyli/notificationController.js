const {updateFCMToken} = require('../../services/Heyli/notificationService.js');

const saveToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    const user = await updateFCMToken(userId, token);

    res.status(200).json({ message: "Token saved successfully", user });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = { saveToken };