const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('../libs/passwordLib');
const token = require('../libs/tokenLib');
const nodemailer = require('nodemailer')


/* Models */
const UserModel = mongoose.model('UserModel')
const AuthModel = mongoose.model('AuthModel')
const todoModel=mongoose.model('Todo');
const friendreqModel=mongoose.model('friendrequest');
const friendsModel=mongoose.model('friends');



// start user signup function 

let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not met the requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input
    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();


                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }// end create user function
    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }
    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails

                            }
                            console.log(responseBody)
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }


    validateUserInput(req, res)
        .then(createUser)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created successfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end user signup function 



// start of login function 
let loginFunction = (req, res) => {
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log(req.body);
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        /* generate the error message and the api response message here */
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let validatePassword = (retrievedUserDetails) => {
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }
    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails

                            }
                            console.log(responseBody)
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }

    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
}

// end of the login function 

//start of change password function
let changePassword = (req, res) => {
    UserModel.findOne({ 'userId': req.params.userId })
        .exec((err, result) => {
            if (err) {
                console.log(err)
                let apiResponse = response.generate(true, 'error', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'Event not found', 404, null)
                res.send(apiResponse)
            } else {
                result.password = passwordLib.hashpassword(req.body.password),
                    console.log(req.body)
                console.log(result)
                result.save(function (err, result) {
                    if (err) {
                        console.log(err)
                        let apiResponse = response.generate(true, 'error at save', 500, null)
                        res.send(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'password changed successfull', 200, result)
                        res.send(apiResponse)
                    }
                })

            }
        })
}
//end of change password function

// start of log-out function

let logout = (req, res) => {
    AuthModel.findOneAndRemove({ userId: req.user.userId }, (err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
} // end of the logout function.

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: false,
    pool: true,
    service: "gmail",
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: 'meetingscheduler1234@gmail.com',
        pass: 'schedule'
    }
});

//start of send mail to reset password
let sendMail = (req, res) => {
    if (req.body.email) {
        console.log(req.body);
        UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
            /* handle the error here if the User is not found */
            if (err) {
                logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                /* generate the error message and the api response message here */
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(userDetails)) {
                /* generate the response and the console error message here */
                logger.error('No User Found', 'userController: findUser()', 7)
                let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                res.send(apiResponse)
            } else {
                /* prepare the message and the api response here */
                logger.info('User Found', 'userController: findUser()', 10)
                let apiResponse = response.generate(false, 'User Details Found', 200, userDetails)
                res.send(apiResponse)


                let mailOptions = {
                    from: '"Scheduler"',
                    to: userDetails.email,
                    subject: '"Welcome to Scheduler"',
                    html: `<h2>Link to reset password</h2><br><h4>You have recieved the link to change the password.<a href="http://ec2-13-234-31-91.ap-south-1.compute.amazonaws.com/${userDetails.userId}/change">Click here...</a></h4>`
                }

                transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log('Reset Code send successfully')
                    }
                })

            }
        });

    } else {
        let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
        reject(apiResponse)
    }
}
//end of send mail function for resetting password




//create todo function is start
let createtodo=(req,res)=>{

    let newEvent = new todoModel({
        eventId: shortid.generate(),
        adminName:req.body.adminName,
        startYear:req.body.startYear,
        startMonth:req.body.startMonth,
        startDay:req.body.startDay,
        adminId:req.body.adminId,
        event:req.body.title,
    })

    newEvent.save((err, result) => {
        if (err) {
            console.log(err)
            logger.error(`Error occured : ${err}`, 'Database', 10)
            let apiResponse = response.generate(true, 'Failed to register Event', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Event not found', 404, null)
            res.send(apiResponse)
        } else {
            console.log(result)
            let apiResponse = response.generate(false, 'Event created', 200, result)
            res.send(apiResponse)
        }
    })
}

let getevent=(req,res)=>{
   todoModel.find({adminId:req.params.userId},(err,result)=>{
       if(err){
        logger.captureError('some error occured','get todo',9)
        let apiResponse=response.generate(true,'some error occured',403,null)
        res.send(apiResponse)
       } else if (check.isEmpty(result)) {
        let apiResponse = response.generate(true, 'Event not found', 404, null)
        res.send(apiResponse)
    } else {
           let apiResponse=response.generate(false,"events are listed this userId",200,result);
           res.send(apiResponse)
       }
   })
}


let deleteevent=(req,res)=>{

    let deleteE=()=>{
      return new Promise((resolve,reject)=>{
        todoModel.deleteOne({eventId:req.body.eventId},(err,result)=>{
            if(err){
                logger.captureError('some error occured','deleteb event',7)
            let apiResponse=response.generate(true,'some error occured',500,null)
            reject(apiResponse)
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'Event not found', 404, null)
                reject(apiResponse)
            }
            else {
                let apiResponse=response.generate(false,"events is Deleted Successfully",200,result);
                resolve(apiResponse)
            }
        })
      })   
}

     let fetch =()=>{
         return new Promise((resolve,reject)=>{
            todoModel.find({adminId:req.body.userId},(err,result)=>{
                if(err){
                 logger.error('some error occured','get todo',9)
                 let apiResponse=response.generate(true,'some error occured',403,null)
                 reject(apiResponse)
                } else if (check.isEmpty(result)) {
                 let apiResponse = response.generate(true, 'Event not found', 404, null)
                 reject(apiResponse)
             } else {
                    let apiResponse=response.generate(false,"events are listed this userId",200,result);
                    resolve(apiResponse)
                }
            })
         })
     }


     deleteE(req, res)
     .then(fetch)
     .then((resolve) => {
         let apiResponse = response.generate(false, 'todo updated', 200, resolve)
         res.send(apiResponse)
     })
     .catch((err) => {
         console.log(err);
         res.send(err);
     })

}



let updateevent=(req,res)=>{
    let options=req.body;
    todoModel.update({eventId:req.body.eventId},options,{multi:true}).exec((err,result)=>{
        if(err){
            logger.captureError('some error occured','update event',6)
        let apiResponse=response.generate(true,'some error occured',403,null)
        res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Event not found', 404, null)
            reject(apiResponse)
        } 
        else {
            let apiResponse=response.generate(false,"events is updated Successfully",200,result);
            res.send(apiResponse)
        }
    })
}


let geteventbystatusId=(req,res)=>{
    todoModel.findOne({eventId:req.params.eventId},(err,result)=>{
            if(err){
                logger.captureError('some error occured','get event',7)
            let apiResponse=response.generate(true,'some error occured',400,null)
            res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'Event not found', 404, null)
                reject(apiResponse)
            } 
            else {
                let apiResponse=response.generate(false,"event are listed this statusId",200,result);
                res.send(apiResponse)
            }
    })
}


let getusers=(req,res)=>{
     UserModel.find()
     .lean()
     .exec((err,result)=>{
        if(err){
            logger.captureError('some error occured','get users',5)
        let apiResponse=response.generate(true,'some error occured',500,null)
        res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Event not found', 404, null)
            reject(apiResponse)
        } 
        else {
            let apiResponse=response.generate(false,"users are listed",200,result);
            res.send(apiResponse)
        }
     })
}

let getrequest=(req,res)=>{
    friendreqModel.find({receiverId:req.params.userId},(err,result)=>{
        if(err){
            logger.error('some error occured','getrequest',9)
        let apiResponse=response.generate(true,'some error occured',500,null)
        res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Event not found', 404, null)
            res.send(apiResponse)
        } 
        else {
            let apiResponse=response.generate(false,"requests are listed",200,result);
            res.send(apiResponse)
        }
})
}

let acceptrequest=(req,res)=>{
    friendreqModel.findOne({friendreqId:req.body.friendreqId},(err,result)=>{
        if(err){
            logger.error('some error occured','acceptrequest',4)
            let apiResponse=response.generate(true,'some error occured',400,null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Event not found', 404, null)
            res.send(apiResponse)
        } 
        else if(result){
            let createUser=new friendsModel({
                friendreqId:result.friendreqId,
                senderId:result.senderId,
                receiverId:result.receiverId,
                receiverFirstName:result.receiverFirstName,
                receiverLastName:result.receiverLastName,
                senderName:result.senderName,
            })
            deletereq(result.friendreqId);
            createUser.save((err,result)=>{
                if(err){
                    logger.captureError('some error occured','acceptrequest',8)
            let apiResponse=response.generate(true,'some error occured',403,null)
            res.send(apiResponse)
                }
                else{
                    
                    let apiResponse=response.generate(false,"Request are accepted",200,result);
                    res.send(apiResponse);
                }
               
            })
        }
    })
    
}

let deletereq=(friendreqId)=>{
    console.log(friendreqId)
    friendreqModel.deleteOne({friendreqId:friendreqId},(err,result)=>{
    })

}
let deletefrndreq=(req,res)=>{
    friendreqModel.deleteOne({friendreqId:req.body.friendreqId},(err,result)=>{
        if(err){
            logger.captureError('some error occured','deletefrndrequest',6)
    let apiResponse=response.generate(true,'some error occured',500,null)
    res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Event not found', 404, null)
            res.send(apiResponse)
        } 
        else {
            let apiResponse=response.generate(false,"Request is deleted successfully",200,result);
            res.send(apiResponse);
        }
    })
}


let getfriends=(req,res)=>{
    console.log(req.params.userId)
    friendsModel.find({senderId:req.params.userId},(err,result)=>{
        if(err){
            logger.error('some error occured','get friends',5)
    let apiResponse=response.generate(true,'some error occured',500,null)
    res.send(apiResponse)
        } else if(check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'friendlist empty', 404, null)
            res.send(apiResponse)
        } 
        else {
            let apiResponse=response.generate(false,"Friends are listed",200,result);
            res.send(apiResponse);
            console.log(apiResponse)
        }
    })
}
let unfriend=(req,res)=>{
    console.log(req.body.friendreqId)
    friendsModel.deleteOne({friendreqId:req.body.friendreqId},(err,result)=>{
        if(err){
            logger.error('some error occured','un friend',5)
    let apiResponse=response.generate(true,'some error occured',500,null)
    res.send(apiResponse)
        }else if(check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'friendlist empty', 404, null)
            res.send(apiResponse)
        } 
        else {
            let apiResponse=response.generate(false,"Unfriend successfully",200,result);
            res.send(apiResponse);
        }
    })
}
let sendrequest=(req,res)=>{

    let findUser = () => {
        return new Promise((resolve, reject) => {
                UserModel.findOne({ userId: req.body.receiverId }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        /* generate the error message and the api response message here */
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });
        })
    }

    let findfriendreq=()=>{
        return new Promise((resolve,reject)=>{
            friendreqModel.findOne({receiverId:req.body.receiverId,senderId:req.body.senderId},(err,result)=>{
                if(err){
                    logger.error('some error occured','findfriendreq',5)
            let apiResponse=response.generate(true,'some error occured',500,null)
            reject(apiResponse)
                }
                else if(check.isEmpty(result)){
                    resolve(req);
                }
                else {
                    logger.error('some error occured','findfriendreq',8)
                    let apiResponse=response.generate(true,'Request is send already',403,null)
                    reject(apiResponse)
                }
            })
        })
    }
    let friendsId=()=>{
        return new Promise((resolve,reject)=>{
         friendsModel.findOne({receiverId:req.body.receiverId,senderId:req.body.senderId},(err,result)=>{
            if(err){
                logger.error('some error occured','friendsId',8)
        let apiResponse=response.generate(true,'some error occured',400,null)
        reject(apiResponse)
            }
            else if(check.isEmpty(result)){
                resolve(req);
            }
            else {
                logger.error('some error occured','friendsId',5)
                let apiResponse=response.generate(true,'already friends',500,result)
                console.log(apiResponse)
                reject(apiResponse)
            }
         })
        })
    }
  
    let sendrequest=()=>{
        return new Promise((resolve,reject)=>{
            
            let createrequest=new friendreqModel({
                        friendreqId:shortid.generate(),
                        senderId:req.body.senderId,
                        receiverId:req.body.receiverId,
                        senderName:req.body.senderName,
                        receiverFirstName:req.body.receiverFirstName,
                        receiverLastName:req.body.receiverLastName
                    })
                    createrequest.save((err,result)=>{
                        if(err){
                          logger.error('some error occured','send request',7)
                          let apiResponse=response.generate(true,'some error occured',400,null)
                          reject(apiResponse)
                        }
                        else {
                          resolve(result)
                      }
                    })
                }
        )}

findUser(req,res).then(
    findfriendreq)
    .then( friendsId)
   .then(sendrequest)
   .then((resolve)=>{
       let apiResponse=response.generate(false,'Request send succesfully',200,resolve);
       console.log(apiResponse)
       res.send(apiResponse);
   })
   .catch((reject)=>{
       res.send(reject);
   })
}

module.exports = {

    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout,
    sendMail:sendMail,
    changePassword:changePassword,
    createtodo:createtodo,
    getevent:getevent,
    deleteevent:deleteevent,
    updateevent:updateevent,
    geteventbystatusId:geteventbystatusId,
    getusers:getusers,
    sendrequest:sendrequest,
    getrequest:getrequest,
    acceptrequest:acceptrequest,
    getfriends:getfriends,
    deletefrndreq:deletefrndreq,
    unfriend:unfriend


}// end exports