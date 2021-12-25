//config
const config = require('config');

// Mongo DB
const db = require('./../services/db.service.js'),
    User = require('./../model/userModel.js');
//crypt 
const bcrypt = require('bcryptjs');
const saltRounds = 10;
//JSONWebToken
const jwt = require('jsonwebtoken');

//verify jsonwebtoken
const verifyToken = require('../services/jsonWebTokenHelper');

//Validation
const { validationResult } = require('express-validator');

let userCreateFunction = (req, res) => {
    console.log("call create user api");
    const encryptPassword = bcypt.hashSync(req.body.password, saltRounds);
    let userCreateData = {
        name: req.body.name,
        email: req.body.email,
        password: encryptPassword
    };
    //console.log(userCreateData);
    //check already exist mail id
    User.findOne({ email: userCreateData.email }, (error, result) => {
        if (error) {
            res.status(400).send({
                status: 0,
                error: error,
                msg: "Error on find user mail id",
                data: []
            });
        }
        else {
            if (result) {
                res.status(200).send({
                    status: 1,
                    error: null,
                    msg: 'Email Id is already Exist',
                    data: []
                });
            }
            else {
                //Create new record
                let user = new User(userCreateData);
                user.save((err, result) => {
                    if (err) {
                        res.status(400).send({
                            status: 0,
                            error: err,
                            msg: "Error on user create",
                            data: []
                        });
                    }
                    else {
                        res.status(200).send({
                            status: 1,
                            error: null,
                            msg: 'User created successfully',
                            data: [userCreateData]
                        });
                    }
                });
            }
        }
    });

}

let userLoginFunction = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    console.log("call user login api");
    var userData = {
        email: req.body.email,
        password: req.body.password
    };
    //console.log(userData);
    User.findOne({ email: userData.email }, (err, result) => {
        if (err) {
            res.status(400).send({
                status: 0,
                error: err,
                msg: "Error on email check",
                data: {}
            });
        } else {
            if (result === null) {
                res.status(200).send({
                    status: 1,
                    error: 'validation',
                    field: 'email',
                    msg: 'This mail id is not exist',
                    data: {}
                });
            }
            else {
                //console.log(result);
                const getDBPassword = result.password ? result.password : '';
                let comparePass = bcrypt.compareSync(userData.password, getDBPassword);
                if (comparePass === false) {
                    res.status(200).send({
                        status: 1,
                        error: 'validation',
                        field: 'password',
                        msg: 'Invalid Password',
                        data: {}
                    });
                } else {
                    const getUserId = result.id;
                    const getUserName = result.name;
                    const getUserEmail = result.email;
                    const getUseRole = 1;
                    let token = jwt.sign(
                        {
                            userId: getUserId,
                            userName: getUserName,
                            userEmail: getUserEmail,
                            userRole: getUseRole
                        },
                        config.get('constants.jsonwebtoken.screat'),
                        {
                            algorithm: config.get('constants.jsonwebtoken.algorithm'),
                            expiresIn: config.get('constants.jsonwebtoken.expiresIn'),
                            audience: config.get('constants.jsonwebtoken.audience'),
                            issuer: config.get('constants.jsonwebtoken.issuer'),
                            subject: config.get('constants.jsonwebtoken.subject'),
                        });

                    res.status(200).send({
                        status: 1,
                        error: null,
                        msg: 'User login successfully',
                        data: { 
                            token: token
                        }
                    });
                }
            }
        }
    });
}

let userLogoutFunction = (req, res) => {
    console.log("call user logout api");
    var userData = req.body;
    res.status(200).send({
        status: 1,
        msg: 'User is logout successfully',
        data: { status: 1, error: null,  msg: "User logout successfully", data: {} }
    });
}

let userListFunction = (req, res) => {
    console.log("call user list api");
    User.find((err, result) => {
        if (err) {
            res.status(400).send({
                status: 0,
                msg: err,
                data: []
            });
        } else {
            res.status(200).send({
                status: 1,
                msg: 'Get all user lists',
                data: result
            });
        }
    }).limit(10);
};

let userDetailFunction = (req, res) => {
    console.log("call user detail api", req.params.id);
    User.findById('5d7d1f7a3f6416223bf94ff7', (err, result) => {
        if (err) {
            res.status(400).send({
                status: 0,
                msg: err,
                data: []
            });
        } else {
            res.status(200).send({
                status: 1,
                msg: 'Get user detail',
                data: result
            });
        }
    });
};

let userUpdateFunction = (req, res) => {
    console.log("call user update api", req.params.id);
    User.findByIdAndUpdate('5d7d1f7a3f6416223bf94ff7', { $set: req.body }, (err, result) => {
        if (err) {
            res.status(400).send({
                status: 0,
                msg: err,
                data: []
            });
        } else {
            res.status(200).send({
                status: 1,
                msg: 'User detail is updated',
                data: result
            });
        }
    });
};

let userDeleteFunction = (req, res) => {
    console.log("call user delete api", req.params.id);
    User.findByIdAndRemove('5d7d1f7a3f6416223bf94ff7', (err, result) => {
        if (err) {
            res.status(400).send({
                status: 0,
                msg: err,
                data: []
            });
        } else {
            res.status(200).send({
                status: 1,
                msg: 'User is deleted',
                data: result
            });
        }
    });
};

module.exports = {
    createUser: userCreateFunction,
    getUsers: userListFunction,
    getSingleUser: userDetailFunction,
    deleteUser: userDeleteFunction,
    updateUser: userUpdateFunction,
    login: userLoginFunction,
    logout: userLogoutFunction,
    //loginValidation: loginValidation,
    //loginValidationFunction: loginValidationFunction

}