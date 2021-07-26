var express = require("express");
var usersCtrl = require("./routes/usersCtrl");
var path = require('path');
var url = require('url');
exports.router = (function() {
  var apiRouter = express.Router();

  // User Routes
  apiRouter.route("/users/register").post(usersCtrl.register);
  apiRouter.route("/users/login/").post(usersCtrl.login);
  apiRouter.route("/form").get(function(req, res) {
    res.status(200).render('form.html');
  })
  apiRouter.route("/editpseudo/").post(usersCtrl.editPseudo)
  apiRouter.route("/listrooms/").get(usersCtrl.listRooms);
  apiRouter.route("/listrooms/:query").get(usersCtrl.listRooms);
  apiRouter.route("/getuserroom/:room").get(usersCtrl.getUserRoom);
  apiRouter.route("/index").get(function(req, res){
    var q = url.parse(req.url, true);
    //res.sendFile(path.join(__dirname + '/index.html'))
    //console.log(q.query)
    var message = q.query['name'] != null ? q.query['name'] : 'whoever you are'
    res.status(200).render('index.html',{message: message});
})
  apiRouter.route("/index").post(function(req, res) {
    var name = req.body.name;
    if (name) {
      res.status(200).render('index.html', {message: name});
    }
  })
  apiRouter.route("/student/:number").get(function(req, res) {
    var q = url.parse(req.url, true);
    var name = q.query['name'];
    var number = req.params.number;
    //res.json({name: name, number: number})
    /*(typeof number === "number" & name != null) &&*/ 
    res.cookie('name', name, {maxAge: 900000, httpOnly: true})
    number != null && res.cookie('number', number, {maxAge: 900000, httpOnly: true})
    res.status(200).render('student.ejs', {name: name, number: number})  
  })
  apiRouter.route("/users/").get(function(req, res) {
      console.log('heyyy')
      res.status(200).json({test: "okff"})
  });
  apiRouter.route("/memory").get(function(req, res) {
    var name = req.cookies['name'];
    var number = req.cookies['number'];
    if (name != 'undefined' && number){
      res.status(200).send(`${name}, student number ${number} was here.`)
    }
    else if (number) {
      res.status(200).send(`student number ${number} was here.`)
    }
  })
  //apiRouter.route("/users/me/").get(userCtrl.getUserProfile);
  //apiRouter.route("/users/me/").put(userCtrl.updateUserProfile);

  // Project Routes
  /*apiRouter.route("/projects/new/").post(projectCtrl.createProject);
  apiRouter.route("/projects/all/").get(projectCtrl.listProject);

  apiRouter
    .route("/projects/:projectId/vote/like/")
    .post(participantCtrl.likeProject);
  apiRouter
    .route("/projects/:projectId/vote/dislike/")
    .post(participantCtrl.dislikeProject);*/

  return apiRouter;
})(); // Permet d'instancier apiRouter