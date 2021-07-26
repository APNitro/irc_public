var jwt = require("jsonwebtoken");
var models = require('../models');
const user = require("../models/user");

const JWT_SIGN_SECRET = "28061982azertynbvcx";

module.exports = {
  sendBackToken: async function (userId) {
    try {
    var userRes = await models.User.findOne({
      where: { id: userId }
    })
  } catch(err) {
    return 'error'
  }
      return ({
        userId: userId,
        token: generateTokenForUser(userRes),
      })
  },
  generateTokenForUser: function (userData) {
    return jwt.sign(
      {
        userId: userData.id,
        email: userData.email,
        pseudo: userData.pseudo,
        rooms: userData.Rooms ? userData.Rooms : [],
      },
      JWT_SIGN_SECRET,
      {
        expiresIn: "1h"
      }
    );
  },
  parseAuthorization: function (authorization) {
    return authorization != null ? authorization.replace("Bearer ", "") : null;
  },
  getUserId: function (authorization) {
    var userId = -1;
    var token = module.exports.parseAuthorization(authorization);
    if (token != null) {
      try {
        var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
        if (jwtToken != null) {
          userId = jwtToken.userId;
        }
      } catch (error) { }
    }
    return userId;
  }
};
