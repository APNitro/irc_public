"use strict";
module.exports = (sequelize, DataTypes) => {
  var Room = sequelize.define(
    "Room",
    {
      name: DataTypes.STRING
    },
    {}
  );
  Room.associate = function(models) {
    // associations can be defined here
    models.Room.hasMany(models.Message,{foreignKey: 'roomId', onDelete: 'cascade', hooks:true })
    models.Room.belongsToMany(models.User, { through: 'UserRooms', onDelete: 'cascade', hooks:true });
    //models.Room.belongsTo(models.Contract);
  };
  return Room;
};
