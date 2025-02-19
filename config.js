require("dotenv").config();

module.exports = {
  mongoURI: process.env.MONGO_URI || "your_mongo_uri_here",
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret",
};
