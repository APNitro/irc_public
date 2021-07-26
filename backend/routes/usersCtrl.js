var bcrypt = require("bcrypt");
var jwtUtils = require("../utils/jwt.utils");
var models = require("../models");
var asyncLib = require("async");
const path = require('path');



// Se rendre ici https://emailregex.com/
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// Se rendre ici http://regexlib.com/Search.aspx?k=password&AspxAutoDetectCookieSupport=1
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;
module.exports = {
  editPseudo: async function (req, res) {
    var pseudo = req.body.pseudo;
    var headerAuth = req.headers["authorization"];
    var userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0) return res.status(400).json({ err: "Token invalide" });
    try {
      var userFound = await models.User.findOne({
        where: {
          id: userId
        },
        include: {
          model: models.Room,
          include: {
            model: models.Message,
            include: {
              model: models.User,
              attributes: ['pseudo']
            }
          }
        }
      })
    } catch(err) {

    }


      models.User.findOne({
        where: {
          pseudo: pseudo
        }
      }).then((user) => {
        console.log((user === null))
        if (userFound && (user === null)) {
          userFound.update({
            pseudo: pseudo
          }).then((user) => {
            return res.status(200).json(
              {
                userId: user.id,
                token: jwtUtils.generateTokenForUser(user),
              });
          }).catch((err) => {
            return res.status(500).json({error: 'erreur interne.'})
          })
        }
   
      }).catch(err => {
        console.log(err)
      })

    
  },
  listRooms: async function (req, res) {
    var query = req.params.query;
    var rooms;
    try{rooms = await models.Room.findAll();} catch(err) {}
    var filterRoom = [];

    if (query){for (var i = 0; i < rooms.length; i++) {
      console.log(rooms[i].name)
      rooms[i].name.includes(query) && filterRoom.push(rooms[i])
    }
  } else {
    filterRoom = rooms;
  }
    return res.status(200).json({rooms: filterRoom})
  },
  getUserRoom: async function (req, res) {
    var room = req.params.room;
    try {
      var room = await models.Room.findOne({
        where: { name: room },
        include: [models.User]
      })
    } catch(err) {

    }
    return res.status(200).json({
      room: room
    })
  },
  deleteUser: async function (req, res) {
    var headerAuth = req.headers["authorization"];
    var userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0) return res.status(400).json({ err: "Token invalide" });
    var deleteId = req.params.deleteId;
    var userFound;
    var deleteUserAd;
    var userAdsFound;
    var companyFound;
    var notifFound;
    var adsFound;

    /*try {
      userAdsFound = await models.UserAds.findAll({
        where: { userId: deleteId }
      })
    } catch (err) {
      return res.status(404).json({ error: `erreur interne` })
    }*/
    try {
      userFound = await models.User.findOne({
        where: { id: deleteId },
        include: [models.Ad]
      })
    } catch (err) {
      return res.status(404).json({ error: `erreur interne` })
    }
    try {
      notifFound = await models.Notif.findAll({
        where: { userId: deleteId }
      })
    } catch (err) {
      return res.status(404).json({ error: `erreur interne2` })
    }
    if (userFound.companyId) {
      try {
        companyFound = await models.Company.findOne({
          where: { id: userFound.companyId }
        })
      } catch (err) {
        return res.status(404).json({ error: `erreur interne3` })
      }
    }
    try {
      var userAds = await models.Ad.findAll({
        include: {
          model: models.User,
          where: { id: deleteId }
        }
      })
    } catch (err) {
      return res.status(404).json({ error: `erreur interne3.2` })
    }

    if (userAds) {
      userAds.forEach(async (ad) => {
        try {
          deleteUserAd = await ad.removeUser(userFound)
        }
        catch (err) {
          return res.status(404).json({ error: `erreur interne3.5` })
        }
      })
    }
    if (companyFound) {
      try {
        adsFound = await models.Ad.destroy({
          where: { companyId: companyFound.id }
        })
      } catch (err) {
        return res.status(404).json({ error: `erreur interne4` })
      }
    }

    if (notifFound) {
      try {
        var deleteNotif = await notifFound.forEach(notif => {
          notif.destroy()
        });
      } catch (err) {
        return res.status(404).json({ error: `erreur interne6` })
      }
    }

    if (companyFound) {
      try {
        deleteCompany = await companyFound.destroy()
      } catch (err) {
        return res.status(404).json({ error: `erreur interne8` })
      }
    }
    if (userFound) {
      try {
        await userFound.destroy()
      } catch (err) {
        return res.status(404).json({ error: err })
      }
    }
    return res.status(200).json({ success: 'utilisateur supprmié avec succès' })


  },
  getAllAdmin: async function (req, res) {
    var headerAuth = req.headers["authorization"];
    var userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0) return res.status(400).json({ err: "Token invalide" });
    var users;
    var ads;
    var companies;
    try {
      users = await models.User.findAll({
        include: [models.Address, {
          model: models.Company,
          include: [models.Address]
        }]
      })
    } catch (err) {
      return res.status(404).json({ error: `erreur interne` })
    }
    try {
      ads = await models.Ad.findAll({
        include: models.Company
      })
    } catch (err) {
      return res.status(404).json({ error: `erreur interne3` })
    }
    return res.status(200).json({ users: users, ads: ads })
  },
  getUserById: function (req, res) {
    const userId = req.params.id;
    models.User.findOne({
      where: { id: userId },
      include: [models.Address]
    }).then(function (userFound) {
      if (userFound) {
        if (userFound.status === 'jobseeker') {
          return res.status(200).json(userFound)
        } else {
          return res.status(404).json({ error: `utilisateur non valide` })
        }
      } else {
        return res.status(404).json({ error: `Impossible de retrouver l'utilisateur` })
      }
    }).catch(function (err) {
      return res.status(500).json({ error: `erreur interne` })
    })
  },
  getCv: function (req, res) {
    const cvName = req.params.cvName;
    let chemin = path.join(__dirname, '../public/uploads', cvName)
    var options = {
      //root: path.join(__dirname),
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    }
    res.sendFile(chemin, options, function (err) {
      if (err) {
        return res.json({ error: 'erreur' })
      } else {
        console.log('Sent:', cvName)
      }
    })
  },
  getImage: function (req, res) {
    const imageName = req.params.imageName;
    let chemin = path.join(__dirname, '../public/uploads', imageName)
    console.log(chemin)
    var options = {
      //root: path.join(__dirname),
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    }
    res.sendFile(chemin, options, function (err) {
      if (err) {
        return res.json({ error: 'erreur' })
      } else {
        console.log('Sent:', imageName)
      }
    })
  },
  upload: async function (req, res) {
    var headerAuth = req.headers["authorization"];
    var userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0) return res.status(400).json({ err: "Token invalide" });
    upload(req, res, (err, path) => {
      if (!err) {
        models.User.findOne({ where: { id: userId } }).then(function (userFound) {
          userFound.update({ picture: req.file.filename }).then(function (user) {
            models.User.findOne({
              where: { id: userId },
              include: [models.Notif, models.Address, {
                model: models.Ad,
                include: [{
                  model: models.Company,
                  include: models.Address
                }]
              }, {
                model: models.Company,
                include: [models.Address, {
                  model: models.Ad,
                  include: [{
                    model: models.User,
                    attributes: ['id', 'first_name', 'last_name', 'phone', 'email', 'presentation'],
                    include: [models.Address]
                  }]
                }]
              }]
            }).then(function (user) {
              return res.status(200).json({
                userId: user.id,
                token: jwtUtils.generateTokenForUser(user),
              })
            }).catch(function (err) {
              return res.status(500).json({ error: 'problème lors de la mise à jour des informations' })
            })
          }).catch(function (err) {
            return res.status(500).json({ error: `erreur lors de la mise à jour de la photo de profile de l'utilisateur` })
          })
        }).catch(function (err) {
          return res.status(500).json({ error: `impossible de retrouver l'utilisateur` })
        })
      }
    })


  },
  register: function (req, res) {
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;


    //var isAdmin = req.body.isAdmin;
    if (password != password2) {
      return res.status(400).json({ error: "Les 2 mots de passe doivent correspondre" })
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: "Adresse mail invalide"
      });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        error:
          "Le taille du mot de passe doit être comprise entre 4 et 8 caracteres"
      });
    }

    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            attributes: ["email"],
            where: {$or: [{ email: email }, {pseudo: pseudo}]}
          })
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res
                .status(500)
                .json({ error: err });
            });
        },
        function (userFound, done) {
          if (!userFound) {
            bcrypt.hash(password, 5, function (err, bcryptedPassword) {
              done(null, userFound, bcryptedPassword);
            });
          } else {
            return res.status(400).json({ error: "Cette adresse mail est déjà utilisé par un autre utilisateur" });
          }
        },
        function (userFound, bcryptedPassword, done) {
          models.User.create({
            pseudo: pseudo,
            email: email,
            password: bcryptedPassword
          })
            .then(function (newUser) {
              done(null, newUser);
            }
            )
            .catch(function (err) {
              return res
                .status(500)
                .json({ error: `problème lors de l'insertion de l'utilisateur` });
            });
        },
        function (newUser, done) {
          done(newUser)
        }
      ],
      function (newUser) {
        if (newUser) {
          return res.status(201).json({ userId: newUser.id });
        } else {
          return res.status(500).json({ error: "Echec d'insertion" });
        }
      }
    );
  },
  editCompany: async function (req, res) {
    var headerAuth = req.headers["authorization"];
    var userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0) return res.status(400).json({ err: "Token invalide" });
    var address = {
      number: parseInt(req.body.address.number),
      street: req.body.address.street,
      city: req.body.address.city,
      zip_code: parseInt(req.body.address.zip_code)
    }
    var name = req.body.name;
    var companyType = req.body.companyType;
    var sector = req.body.sector;
    var description = req.body.description;
    var website = req.body.website;
    var siret = req.body.siret;
    var picture = req.body.picture;
    if (address.number || address.street || address.city || address.zip_code) {
      if ((!(address.number > 0) || !(address.number < 100000)) & address.number != '') {
        return res.status(400).json({ err: "Address invalide" });
      }
      if (address.street === '' || address.city === '' || address.zip_code === '') {
        return res.status(400).json({ err: "Address invalide" });
      }
    }
    var userFound;
    var addressCreate;
    var companyFound;
    try {
      userFound = await models.User.findOne({
        where: { id: parseInt(userId) },
        include: models.Company
      })
    } catch (err) {
      return res.status(500).json({ error: `erreur lors de la récupération des données de l'utilisateur` })
    }
    try {
      companyFound = await models.Company.findOne({
        where: { id: userFound.companyId },
        include: models.Address
      })
    } catch (err) {
      return res.status(500).json({ error: `impossible de récupérer les données de l'entreprise` })
    }
    if (address.street != '') {
      var addressFound = await models.Address.findOne({
        where: {
          number: address.number,
          street: address.street,
          city: address.city,
          zip_code: address.zip_code
        }
      })
    }
    if (!addressFound & address.street != '') {
      try {
        addressFound = await models.Address.create({
          number: address.number,
          street: address.street,
          city: address.city,
          zip_code: address.zip_code
        })
      } catch (err) {
        return res.status(500).json({ error: 'impossible de créer la nouvelle adresse' })
      }
    }

    if (addressFound || address.street == "") {
      companyFound.update({
        name: name
          ? name
          : companyFound.name,
        companyType: companyType
          ? companyType
          : companyFound.companyType,
        sector: sector
          ? sector
          : companyFound.sector,
        description: description
          ? description
          : companyFound.description,
        website: website
          ? website
          : companyFound.website,
        siret: siret
          ? siret
          : companyFound.siret,
      }).then(function (companyFound) {
        companyFound.setAddress(addressFound ? addressFound : companyFound.address).then(function (company) {
          models.User.findOne({
            where: { email: userFound.email },
            include: [models.Address, {
              model: models.Company,
              include: [models.Address]
            }]
          }).then(function (user) {
            return res.status(200).json({
              userId: user.id,
              token: jwtUtils.generateTokenForUser(user),
            })
          }).catch(function (err) {
            return res.status(500).json({ error: 'problème lors de la mise à jour des informations' })
          })
        }).catch(function (err) {
          return res.status(500).json({ error: 'problème lors de la mise à jour des informations' })
        })

      }).catch(function (err) {
        return res.status(500).json({ error: 'problème lors de la mise à jour des informations' })
      })
    }
  },
  edit: async function (req, res) {
    var headerAuth = req.headers["authorization"];
    var userId = jwtUtils.getUserId(headerAuth);
    if (userId < 0) return res.status(400).json({ err: "Token invalide" });
    var birthday = req.body.birthday;
    var address = {
      number: parseInt(req.body.address.number),
      street: req.body.address.street,
      city: req.body.address.city,
      zip_code: parseInt(req.body.address.zip_code)
    }
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var phone = req.body.phone;
    var presentation = req.body.presentation;
    var school = req.body.school;
    var schoolLocation = req.body.schoolLocation;
    var graduateYear = req.body.graduateYear;
    var linkedin = req.body.linkedin;


    if (address.number || address.street || address.city || address.zip_code) {
      if ((!(address.number > 0) || !(address.number < 100000)) & address.number != '') {
        return res.status(400).json({ err: "Address invalide" });
      }
      if (address.street === '' || address.city === '' || address.zip_code === '') {
        return res.status(400).json({ err: "Address invalide" });
      }
    }
    var addressFound;
    var userFound;
    var addressCreate;
    if (address.street != '') {
      addressFound = await models.Address.findOne({
        where: {
          number: address.number,
          street: address.street,
          city: address.city,
          zip_code: address.zip_code
        }
      })
    }
    if (!addressFound & address.street != '') {
      try {
        addressFound = await models.Address.create({
          number: address.number,
          street: address.street,
          city: address.city,
          zip_code: address.zip_code
        })
      } catch (err) {
        return res.status(500).json({ error: 'problème lors de la création de la nouvelle adresse' })
      }
    }

    try {
      userFound = await models.User.findOne({
        where: { id: parseInt(userId) }
      })
    } catch (err) {
      return res.status(500).json({ error: `impossible de retrouver l'utilisateur` })
    }

    if (addressFound || address.street == "") {
      userFound.update({
        birthday: birthday
          ? birthday
          : userFound.birthday,
        phone: phone
          ? phone
          : userFound.phone,
        email: userFound.email,
        first_name: first_name ? first_name : userFound.first_name,
        last_name: last_name ? last_name : userFound.last_name,
        presentation: presentation ? presentation : userFound.presentation,
        school: school ? school : userFound.school,
        schoolLocation: schoolLocation ? schoolLocation : userFound.schoolLocation,
        graduateYear: graduateYear ? graduateYear : userFound.graduateYear,
        linkedin: linkedin ? linkedin : userFound.linkedin
      }).then(function (userFound) {
        userFound.setAddress(addressFound ? addressFound : userFound.address).then(function (userFound) {
          models.User.findOne({
            where: { email: userFound.email },
            include: [models.Notif, models.Address, {
              model: models.Ad,
              include: [{
                model: models.Company,
                include: models.Address
              }]
            }, {
              model: models.Company,
              include: [models.Address, {
                model: models.Ad,
                include: [{
                  model: models.User,
                  attributes: ['id', 'first_name', 'last_name', 'phone', 'email', 'presentation'],
                  include: [models.Address]
                }]
              }]
            }]
          }).then(function (user) {
            return res.status(200).json({
              userId: user.id,
              token: jwtUtils.generateTokenForUser(user),
            })
          }).catch(function (err) {
            return res.status(500).json({ error: 'problème lors de la mise à jour des informations' })
          })
        }).catch(function (err) {
          return res.status(500).json({ error: 'problème lors de la mise à jour des informations' })
        })

      }).catch(function (err) {
        return res.status(500).json({ error: 'problème lors de la mise à jour des informations' })
      })
    }
  },
  login: function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    if (email == '' || password == '') {
      return res
        .status(400)
        .json({ error: "Merci de renseigner les parametres de connexion" });
    }

    asyncLib.waterfall(
      [
        function (done) {
          models.User.findOne({
            where: { email: email },
            include: {
              model: models.Room,
              include: {
                model: models.Message,
                include: {
                  model: models.User,
                  attributes: ['pseudo']
                }
              }
            }
          })
            .then(function (userFound) {
              done(null, userFound);
            })
            .catch(function (err) {
              return res.status(400).json({ error: `l'utilisateur n'existe pas ${email}` });
            });
        },
        function (userFound, done) {
          if (userFound) {
            bcrypt.compare(password, userFound.password, function (
              errBcrypt,
              resBcrypt
            ) {
              done(null, userFound, resBcrypt);
            });
          } else {
            return res.status(404).json({ error: "User introuvable" });
          }
        },
        function (userFound, resBcrypt, done) {
          if (resBcrypt) {
            done(userFound);
          } else {
            return res.status(404).json({ error: "User introuvable" });
          }
        }
      ],
      function (userFound) {
        if (userFound) {
          return res.status(200).json(
            {
              userId: userFound.id,
              token: jwtUtils.generateTokenForUser(userFound),
            });
        } else {
          return res.status(403).json({ error: "Echec de connexion" });
        }
      }
    );
  },

};
