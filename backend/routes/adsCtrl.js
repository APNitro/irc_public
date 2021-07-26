var bcrypt = require("bcrypt");
var jwtUtils = require("../utils/jwt.utils");
var models = require("../models");
var asyncLib = require("async");

module.exports = {
    deleteAdAdmin: async function (req, res) {
        const adId = req.params.adId;
        var headerAuth = req.headers["authorization"];
        var userId = jwtUtils.getUserId(headerAuth);
        if (userId < 0) return res.status(400).json({ err: "Token invalide" });
        var adFound;
        try {
            adFound = await models.Ad.findOne({
                where: { id: adId }
            })
        } catch (err) {
            return res.status(500).json({ error: `Impossible de supprimer l'annonce` })
        }
        if (adFound) {
            adFound.setUsers(null).then(function () {
                models.Ad.destroy({
                    where: { id: adId }
                }).then(function() {
                    return res.status(200).json({success: `annonce supprimé`})
                }).catch(function(err) {
                    return res.status(500).json({error: 'erreur interne'})
                })
            }).catch(function(err) {
                return res.status(500).json({error: 'erreur interne'})
            })
        } else {
            return res.status(404).json({error: 'annonce introuvable'})
        }
    },
    getAdById: function (req, res) {
        const adId = req.params.adId;
        models.Ad.findOne({
            where: {id: adId},
            include: {
                model: models.Company,
                include: [models.Address]
            }
        }).then(function(adFound) {
            return res.status(200).json(adFound)
        }).catch(function(err) {
            return res.status(404).json({error: `impossible de retrouver l'annonce`})
        })
    },
    refuseUser: async function (req, res) {
        const adId = req.body.adId;
        const refuseUserId = req.body.userId;
        var headerAuth = req.headers["authorization"];
        var userId = jwtUtils.getUserId(headerAuth);
        if (userId < 0) return res.status(400).json({ err: "Token invalide" });
        var userFound;
        var adFound;
        var newNotif;
        try {
            adFound = await models.Ad.findOne({
                where: { id: adId },
                include: models.Company
            })
        } catch (err) {
            return res.status(500).json({ error: `Impossible de retrouver l'annonce` })
        }
        try {
            userFound = await models.User.findOne({
                where: { id: refuseUserId }
            })
        } catch (err) {
            return res.status(500).json({ error: `Impossible de retrouver l'utilisateur` })
        }
        try {
            newNotif = await models.Notif.create({
                object: `refus de votre demande`,
                message: `l'entreprise ${adFound.Company.dataValues.name} a refusé votre demande sur l'annonce ${adFound.title}`,
                seen: false
            })
        } catch (err) {
            return res.status(500).json({ error: `Impossible de créer la notification` })
        }

        /*models.UserAds.destroy({
            where: { userId: refuseUserId, adId: adId }
        })*/adFound.removeUser(userFound).then(function () {
            userFound.addNotif(newNotif).then(function (notif) {
                models.User.findOne({
                    where: { id: userId },
                    include: [models.Notif, models.Address, {
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
                return res.status(500).json({ error: 'impossible de créer la notification pour le postulant' })
            })
        }).catch(function (err) {
            return res.status(500).json({ error: `erreur lors de la suppression du postulant sur l'annonce` })
        })



    },
    acceptUser: async function (req, res) {
        const adId = req.body.adId;
        const refuseUserId = req.body.userId;
        var headerAuth = req.headers["authorization"];
        var userId = jwtUtils.getUserId(headerAuth);
        if (userId < 0) return res.status(400).json({ err: "Token invalide" });
        var userFound;
        var adFound;
        var newNotif;
        try {
            adFound = await models.Ad.findOne({
                where: { id: adId },
                include: models.Company
            })
        } catch (err) {
            return res.status(500).json({ error: `Impossible de retrouver l'annonce` })
        }
        try {
            userFound = await models.User.findOne({
                where: { id: refuseUserId }
            })
        } catch (err) {
            return res.status(500).json({ error: `Impossible de retrouver l'utilisateur` })
        }
        try {
            newNotif = await models.Notif.create({
                object: `votre demande a été accepté !`,
                message: `l'entreprise ${adFound.Company.dataValues.name} a accepté votre demande sur l'annonce ${adFound.title}`,
                seen: false
            })
        } catch (err) {
            return res.status(500).json({ error: `Impossible de créer la notification` })
        }
        try {
            adFound.update({
                validated: true
            })
        } catch (err) {
            return res.status(500).json({ error: `impossible de mettre l'annonce à jour` })
        }
        adFound.setUsers(userFound).then(function () {
            userFound.addNotif(newNotif).then(function (notif) {
                models.User.findOne({
                    where: { id: userId },
                    include: [models.Notif, models.Address, {
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
                return res.status(500).json({ error: `erreur lors de l'attribuation de la notification au postulant` })
            })
        }).catch(function (err) {
            return res.status(500).json({ error: `erreur lors de la mise à jour de la liste des postulants à l'annonce` })
        })
    },
    deleteAd: async function (req, res) {
        const adId = req.body.adId;
        var headerAuth = req.headers["authorization"];
        var userId = jwtUtils.getUserId(headerAuth);
        if (userId < 0) return res.status(400).json({ err: "Token invalide" });
        var adFound;
        try {
            adFound = await models.Ad.findOne({
                where: { id: adId }
            })
        } catch (err) {
            return res.status(500).json({ error: `Impossible de supprimer l'annonce` })
        }
        if (adFound) {
            adFound.setUsers(null).then(function () {
                models.Ad.destroy({
                    where: { id: adId }
                }).then(function (ad) {
                    models.User.findOne({
                        where: { id: userId },
                        include: [models.Notif, models.Address, {
                            model: models.Company,
                            include: [models.Address, {
                                model: models.Ad,
                                include: [{
                                    model: models.User,
                                    include: [models.Address]
                                }]
                            }]
                        }, {
                            model: models.Ad,
                            include: {
                                model: models.Company,
                                include: models.Address
                            }
                        }]
                    }).then(function (userFound) {
                        return res.status(200).json(
                            {
                                userId: userFound.id,
                                token: jwtUtils.generateTokenForUser(userFound),
                            });
                    }).catch(function (err) {
                        return res.status(500).json({ error: `impossible de retrouver l'utilisateur` })
                    })
                }).catch(function (err) {
                    return res.status(500).json({ error: `erreur lors de la suppression de l'annonce` })
                })
            }).catch(function (err) {
                return res.status(500).json({ error: `impossible d'effacer les postulants à l'annonce` })
            })
        } else {
            return res.status(404).json({ error: `annonce introuvable` })
        }
    },
    deleteUserAd: async function (req, res) {
        const adId = req.body.adId;
        var headerAuth = req.headers["authorization"];
        var userId = jwtUtils.getUserId(headerAuth);
        if (userId < 0) return res.status(400).json({ err: "Token invalide" });
        var userFound;
        try {
            userFound = await models.User.findOne({
                where: { id: userId }
            })
        } catch (err) {
            return res.status(404).json({ error: 'utilisateur introuvable' })
        }
        if (userFound) {
            if (userFound.status == 'company') {
                return res.status(500).json({ error: `Vous ne pouvez pas postuler en tant qu'entreprise` })
            }
        }
        models.Ad.findOne({
            where: { id: adId }
        }).then(function (adFound) {
            adFound.removeUser(userFound).then(function (ad) {
                models.User.findOne({
                    where: { id: userId },
                    include: [models.Notif, models.Address, {
                        model: models.Company,
                        include: [models.Address]
                    }, {
                        model: models.Ad,
                        include: {
                            model: models.Company,
                            include: models.Address
                        }
                    }]
                }).then(function (userFound) {
                    return res.status(200).json(
                        {
                            userId: userFound.id,
                            token: jwtUtils.generateTokenForUser(userFound),
                        });
                }).catch(function (err) {
                    return res.status(500).json({ error: `impossible de retrouver l'utilisateur` })
                })
            }).catch(function (err) {
                return res.status(500).json({ error: `impossible de supprimer le postulant` })
            })

        }).catch(function (err) {
            return res.status(500).json({ error: `impossible de retrouver l'annonce` })
        })

    },
    addUserAd: async function (req, res) {
        const adId = req.body.adId;
        var headerAuth = req.headers["authorization"];
        var userId = jwtUtils.getUserId(headerAuth);
        if (userId < 0) return res.status(400).json({ err: "Token invalide" });
        var userFound;
        try {
            userFound = await models.User.findOne({
                where: { id: userId }
            })
        } catch (err) {
            return res.status(404).json({ error: 'utilisateur introuvable' })
        }
        if (userFound) {
            if (userFound.status == 'company') {
                return res.status(500).json({ error: `Vous ne pouvez pas postuler en tant qu'entreprise` })
            }
        }
        models.Ad.findOne({
            where: { id: adId }
        }).then(function (adFound) {
            adFound.addUser(userFound).then(function (ad) {
                models.User.findOne({
                    where: { id: userId },
                    include: [models.Notif, models.Address, {
                        model: models.Company,
                        include: [models.Address]
                    }, {
                        model: models.Ad,
                        include: {
                            model: models.Company,
                            include: models.Address
                        }
                    }]
                }).then(function (userFound) {
                    return res.status(200).json(
                        {
                            userId: userFound.id,
                            token: jwtUtils.generateTokenForUser(userFound),
                        });
                }).catch(function (err) {
                    return res.status(500).json({ error: `impossible de retrouver l'utilisateur` })
                })
            }).catch(function (err) {
                return res.status(500).json({ error: `impossible d'assigner le postulant à l'annonce` })
            })

        }).catch(function (err) {
            return res.status(500).json({ error: `impossibe de retrouver l'annonce` })
        })
    },
    getAdsByPage: function (req, res) {
        const page = req.params.page;
        var adsRes = 0;
        models.Ad.findAll({
            where: {validated: false},
            include: [models.Company]
        }).then((ads) => {
            const l = ads.length;
            if (ads.length > page * 6) {
                adsRes = ads.slice(page * 6, page * 6 + 6)
            } else {
                adsRes = ads.slice((l / 6) * (parseInt(page) - 1), l);
            }
            res.status(200).json({ ads: adsRes, hasMore: ((parseInt(page) + 1) < (l / 6)) })
        }).catch(function(err) {
            return res.status(404).json({error: 'erreur interne'})
        })
    },
    createAd: async function (req, res) {
        var headerAuth = req.headers["authorization"];
        var userId = jwtUtils.getUserId(headerAuth);
        if (userId < 0) return res.status(400).json({ err: "Token invalide" });
        var title = req.body.title;
        var description = req.body.description;
        var contract = req.body.contract;
        var start = req.body.start;
        var end = req.body.end;
        var companyId = req.body.companyId;
        var salaire = req.body.salaire;
        var exp = req.body.exp;
        var companyFound;
        try {
            companyFound = await models.Company.findOne({
                where: { id: companyId }
            })
        } catch (err) {
            return res.status(500).json({ error: `impossible de trouver l'entreprise` })
        }
        if (companyFound) {
            models.Ad.create({
                title: title,
                description: description,
                contract: contract,
                start: start,
                end: end,
                salaire: salaire,
                exp: exp
            }).then(function (newAd) {
                newAd.setCompany(companyFound).then(function (newAd) {
                    models.User.findOne({
                        where: { id: userId },
                        include: [models.Address, {
                            model: models.Company,
                            include: [models.Address, {
                                model: models.Ad,
                                include: [{
                                    model: models.User,
                                    include: [models.Address]
                                }]
                            }]
                        }, {
                            model: models.Ad,
                            include: {
                                model: models.Company,
                                include: models.Address
                            }
                        }]
                    }).then(function (userFound) {
                        return res.status(200).json(
                            {
                                userId: userFound.id,
                                token: jwtUtils.generateTokenForUser(userFound),
                            });
                    }).catch(function (err) {
                        return res.status(500).json({ error: `impossible de retrouver l'utilisateur` })
                    })
                }).catch(function (err) {
                    return res.status(500).json({ error: `impossible d'assigner l'entreprise à l'annonce` })
                })
            }).catch(function (err) {
                return res.status(500).json({ error: `impossible de créer l'annonce` })
            })

        } else {
            return res.status(500).json({ error: `impossible de trouver l'entreprise` })
        }


    }
}

