const users = [];
const moment = require('moment');
var jwtUtils = require("./jwt.utils");

var models = require("../models");
// Join user to chat
async function userLeaveRoom(username, room) {
  /*console.log(users)
  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].room === room) {
      users.splice(i, 1);
      console.log(users)
    }
  }*/
  var roomFound;
  try {
    roomFound = await models.Room.findOne({
      where: {name: room}
    })
  } catch {

  }
  models.User.findOne({
    where: {pseudo: username}
  })
  .then(function(userFound) {
    userFound.removeRoom(roomFound)
    .then((user) => {
      models.User.findOne({
        where: {pseudo: username},
        include: [models.Room]
      }).then((user) => {
        return {
          userId: user.id,
          token: jwtUtils.generateTokenForUser(user),
        };
      }).catch((err) => {

      })
    }).catch((err) => {

    })
  })
  .catch(function(err) {

  })
}
async function userJoin(id, username, room) {
  const user = { id, username, room };
  var roomFound;
  try {
    roomFound = await models.Room.findOne({
      where: { name: room }
    })
  } catch {

  }
  if (!roomFound) {
    try {
      roomFound = await models.Room.create({
        name: room
      })
    } catch {

    }

  }
  models.User.findOne({
    where: { pseudo: username }
  }).then(function (userFound) {
    userFound.addRoom(roomFound)
    .then(function(userF) {
      return user
    })
    .catch(function(err) {

    })
  }).catch(function(err) {

  })
  users.push(user);
  console.log(users)
  return user;
}

// Get current user
function getCurrentUser(id) {
  console.log(users)
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
async function getRoomUsers(room) {
  /*var u = [];
  models.UserRoom.findAll({
    where: {roomId : room.id}
  })
  .then(async (users) => {
    for (var i = 0; i < users.length; i++) {
      var user = await models.User.findOne({
        where: {id: users[i].id}
      })
      u.push(user);
    }
    return u;
  })*/
 models.Room.findOne({
    where: {name: room},
    include: [models.User]
  })
  .then(function(roomFound) {
    return roomFound;
  })
  //return users.filter(user => user.room === room);
}
async function emitMessage({room, username, message}) {
  var roomFound;
  var userFound;
  try {
    roomFound = await models.Room.findOne({
      where: {name: room}
    })
  } catch(err) {
    console.log(err)
  }
  try {
    userFound = await models.User.findOne({
      where: {pseudo: username}
    })
  } catch(err) {
    console.log(err)
  }
  models.Message.create({
    content: message,
    time: moment().format('h:mm a'),
    userId: userFound.id,
    roomId: roomFound.id
  })
  .then(function(newMessage) {
    
  })
  .catch(function(err) {
    console.log(err)

  })
}
async function getMessagesRoom(room) {
  var roomFound;
  try {
    roomFound = await models.Room.findOne({
      where: {name: room},
      include: [{
        model: models.Message,
        include: [models.User]
      }]
    })
  } catch(err) {

  }
  console.log(roomFound)
  return roomFound.Messages;
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  userLeaveRoom,
  emitMessage,
  getMessagesRoom
};