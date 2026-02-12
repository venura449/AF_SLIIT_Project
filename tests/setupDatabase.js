const mongoose = require('mongoose');

module.exports = async function setupDatabase() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Ensure the collection exists
  const db = mongoose.connection;
  await db.createCollection('users');
  await mongoose.disconnect();
};
