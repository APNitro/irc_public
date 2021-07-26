"use strict";
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define(
    "User",
    {
      pseudo: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING
    },
    {}
  );
  User.associate = function (models) {
    // associations can be defined here
    models.User.hasMany(models.Message, {foreignKey: 'userId'})
    models.User.belongsToMany(models.Room, { through: 'UserRooms' });
    /*models.User.belongsTo(models.Status, {
      constraints: false
    });*/
  };
  return User;
};
