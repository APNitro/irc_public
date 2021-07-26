"use strict";
module.exports = (sequelize, DataTypes) => {
  var Message = sequelize.define(
    "Message",
    {
      content: DataTypes.STRING,
      time: DataTypes.STRING
    },
    {}
  );
  Message.associate = function(models) {
    // associations can be defined here
    models.Message.belongsTo(models.User, { foreignKey: 'userId', constraints: false });
    models.Message.belongsTo(models.Room, { foreignKey: 'roomId', constraints: false });
    //models.Message.belongsTo(models.Contract);
  };
  return Message;
};