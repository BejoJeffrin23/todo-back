const express = require('express');
const router = express.Router();
const controller = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require("./../../app/middlewares/auth")


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // defining routes.

  // params: firstName, lastName, email, mobileNumber, password
  app.post(`${baseUrl}/signup`, controller.signUpFunction);
  /**
      * @apiGroup User
      * @apiVersion 1.0.0
      * @api {post} /api/v1/users/signup SignUp User
      * 
      * @apiParam {String} firstName First name of the user. (body params) (required)
      * @apiParam {String} lastName lastName of the user. (body params) (required)
      * @apiParam {Number} number mobile number of the user. (body params) (required)
      * @apiParam {String} email email of the user. (body params) (required)
      * @apiParam {String} password password of the user. (body params) (required)
      *
      * @apiSuccess {object} myResponse shows error status, message, http status code, result.
      * 
      *  @apiSuccessExample {json} Success-Response:
      *  {
         "error": false,
         "message": "User created successfully",
         "status": 200,
         "data": {
                 email: "meetingscheduler1234@gmail.com"
                 firstName: "Check"
                 isAdmin: false
                 lastName: "Check"
                 mobileNumber: "971-999999999"
                 password: "223388"
                 userName: "Check-user"
                 }
             }
      * @apiErrorExample {json} Error-Response:
      *
      * {
         "error": true,
         "message": "Error message",
         "status": 500/404/403,
         "data": null
        }
     */



  // params: email, password.
  app.post(`${baseUrl}/login`, controller.loginFunction);
  /**
  * @apiGroup User
  * @apiVersion  1.0.0
  * @api {post} /api/v1/users/login user login.
  *
  * @apiParam {string} email email of the user. (body params) (required)
  * @apiParam {string} password password of the user. (body params) (required)
  *
  * @apiSuccess {object} myResponse shows error status, message, http status code, result.
  * 
  * @apiSuccessExample {object} Success-Response:
      {
         "error": false,
         "message": "Login Successful",
         "status": 200,
         "data": {
             "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
             "userDetails": {
              email: "bejojeffrin23@gmail.com"
              firstName: "Bejo"
              isAdmin: false
              lastName: "Jeffrin"
              mobileNumber: "376-944"
              userId: "WSa0F9ja"
              userName: "Bejo-user"
         }
     }
  }
     @apiErrorExample {json} Error-Response:
      *
      * {
         "error": true,
         "message": "Error message",
         "status": 500/404/403,
         "data": null
        }
     */


  app.post(`${baseUrl}/logout`,auth.isAuthorized, controller.logout);
  /**
  * @apiGroup User
  * @apiVersion  1.0.0
  * @api {post} /api/v1/users/logout to logout user.
  *    
  * @apiSuccess {object} myResponse shows error status, message, http status code, result.
  * 
  * @apiSuccessExample {object} Success-Response:
      {
         "error": false,
         "message": "Logged Out Successfully",
         "status": 200,
         "data": null

     }
     * @apiErrorExample {json} Error-Response:
     *
     * {
         "error": true,
         "message": "Error message",
         "status": 500/404/403,
         "data": null
        }
 */

 
app.post(`${baseUrl}/reset`,controller.sendMail)
/**'
     * @apiGroup User
     * @apiVersion 1.0.0
     * @api {post} /api/users/reset To send email with link to reset password
     *
     * @apiParam {String} email as Body parameter.
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     *
     *  @apiSuccessExample {json} Success-Response:
     *  {
            "error": false,
            "message": "Please click on the link sent to your registered email.",
            "status": 200,
            "data": "null(Email will be sent your registered email address with link to reset password)"
        }
    @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured",
	    "status": 500
	    "data": [ {
              email: "bejojeffrin23@gmail.com"
              firstName: "Bejo"
              isAdmin: false
              lastName: "Jeffrin"
              mobileNumber: "376-944"
              userId: "WSa0F9ja"
              userName: "Bejo-user"
         }]
	   }
    */

app.post(`${baseUrl}/:userId/change`,controller.changePassword)
/**'
     * @apiGroup User
     * @apiVersion 1.0.0
     * @api {post} /api/users/:userId/change To reset password
     *
     * @apiParam {String} password as Body parameter.
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     *
     *  @apiSuccessExample {json} Success-Response:
     *  {
            "error": false,
            "message": "Password changed successfully.",
            "status": 200,
            "data": "result"
        }
    @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured",
	    "status": 500
	    "data": null
	   }
    */

   app.post(`${baseUrl}/createtodo`,controller.createtodo);
   /**
       * @api {post} /api/v1/users/cratetodo create users event
       * @apiVersion 0.0.1
       * @apiGroup post
       * 
       * @apiParam {String} userId of the user passed as a body parameter
       * @apiParam {String} event of the user passed as a body parameter
       * @apiParam {String} Done of the user passed as a body parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"event is created",
       *   "status":200,
       *   "data": [
       *              {
       *                userId:"string",
       *                firstName:"string",
       *                lastName:"string",
       *                statusId:"string",
       *                event:"string",
       *                Done:"string"
       *              }
       *           ]  
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":403,
       *      "data":null
       *    }
       */
  
  
  
  app.get(`${baseUrl}/gettodo/:userId`,controller.getevent);
   /**
       * @api {get} /api/v1/users/gettodo/:userId get users todo
       * @apiVersion 0.0.1
       * @apiGroup get
       * 
       * @apiParam {String} userId of the user passed as a URL parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"events are listed this userId",
       *   "status":200,
       *   "data": [
       *              {
       *                userId:"string",
       *                firstName:"string",
       *                lastName:"string",
       *                statusId:"string",
       *                event:"string",
       *                Done:"string"
       *              }
       *           ]  
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":400,
       *      "data":null
       *    }
       */
  
  
  
  
  app.post(`${baseUrl}/delete`,controller.deleteevent);
   /**
       * @api {post} /api/v1/users/delete delete users todo
       * @apiVersion 0.0.1
       * @apiGroup post
       * 
       * @apiParam {String} statusId of the user passed as a body parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"events is Deleted Successfully",
       *   "status":200,
       *   "data": []  
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":400,
       *      "data":null
       *    }
       */
  
  
  
  
  app.post(`${baseUrl}/update`,controller.updateevent);
   /**
       * @api {post} /api/v1/users/update edit users todo
       * @apiVersion 0.0.1
       * @apiGroup post
       * 
       * @apiParam {String} statusId of the user passed as a body parameter
       * @apiParam {String} event of the user passed as a body parameter
       * @apiParam {String} Done of the user passed as a body parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"events is updated Successfully",
       *   "status":200,
       *   "data": []  
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":403,
       *      "data":null
       *    }
       */
  
  
  
  app.get(`${baseUrl}/getevent/:eventId`,controller.geteventbystatusId);
   /**
       * @api {get} /api/v1/users/getevent/:statusId get users particular todo
       * @apiVersion 0.0.1
       * @apiGroup get
       * 
       * @apiParam {String} statusId of the user passed as a URL parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"event are listed this statusId",
       *   "status":200,
      *   "data": [
       *              {
       *                userId:"string",
       *                firstName:"string",
       *                lastName:"string",
       *                statusId:"string",
       *                event:"string",
       *                Done:"string"
       *              }
       *           ]  
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":500,
       *      "data":null
       *    }
       */
  
  
  
  
  app.get(`${baseUrl}/getusers`,controller.getusers);
   /**
       * @api {get} /api/v1/users/getuser get users 
       * @apiVersion 0.0.1
       * @apiGroup get
       * 
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"users are listed",
       *   "status":200,
        *   "data": [
       *              {
       *                userId:"string",
       *                firstName:"string",
       *                lastName:"string",
       *                email:"string",
       *                countryCode:"number",
       *                mobileNumbernumber:"number"
       *              }
       *           ]
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":500,
       *      "data":null
       *    }
       */
  
  
  
       
  app.post(`${baseUrl}/sendrequest`,controller.sendrequest);
   /**
       * @api {post} /api/v1/users/sendrequest send friend request 
       * @apiVersion 0.0.1
       * @apiGroup post
       * 
       * @apiParam {String} senderId of the user passed as a body parameter
       * @apiParam {String} receiverId of the user passed as a body parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"Request send succesfully",
       *   "status":200,
        *   "data": [
       *              {
       *                  friendreqId:"string",
       *                  senderfirstName:"string",
       *                  senderlastName:"string",
       *                  receiverfirstName:"string",
       *                  receiverlastname:"string",
       *                  senderId:"string",
       *                  receiverId:"string"
       *              }
       *           ]
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":403,
       *      "data":null
       *    }
       */
  
  
  
       
  app.get(`${baseUrl}/getrequest/:userId`,controller.getrequest);
   /**
       * @api {get} /api/v1/users/getrequest/:userId get friend rrequest 
       * @apiVersion 0.0.1
       * @apiGroup get
       * 
       * @apiParam {String} userId of the user passed as a URL parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"requests are listed",
       *   "status":200,
        *   "data": [
       *              {
       *                  friendreqId:"string",
       *                  senderfirstName:"string",
       *                  senderlastName:"string",
       *                  receiverfirstName:"string",
       *                  receiverlastname:"string",
       *                  senderId:"string",
       *                  receiverId:"string"
       *              }
       *           ]
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":400,
       *      "data":null
       *    }
       */
  
  
  
       
  app.post(`${baseUrl}/acceptrequest`,controller.acceptrequest);
   /**
       * @api {post} /api/v1/users/acceptrequest accept friend rrequest 
       * @apiVersion 0.0.1
       * @apiGroup post
       * 
       * @apiParam {String} friendreqId of the user passed as a body parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"Request are accepted",
       *   "status":200,
        *   "data": [
       *              {
       *                  friendId:"string",
       *                  senderfirstName:"string",
       *                  senderlastName:"string",
       *                  receiverfirstName:"string",
       *                  receiverlastname:"string",
       *                  senderId:"string",
       *                  receiverId:"string"
       *              }
       *           ]
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":500,
       *      "data":null
       *    }
       */
  
  
  
       
  app.get(`${baseUrl}/getfriends/:userId`,controller.getfriends);
   /**
       * @api {get} /api/v1/users/getfriends/:userId get friends
       * @apiVersion 0.0.1
       * @apiGroup get
       * 
       * @apiParam {String} userId of the user passed as a URL parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"Friends are listed",
       *   "status":200,
        *   "data": [
       *              {
       *                  friendId:"string",
       *                  senderfirstName:"string",
       *                  senderlastName:"string",
       *                  receiverfirstName:"string",
       *                  receiverlastname:"string",
       *                  senderId:"string",
       *                  receiverId:"string"
       *              }
       *           ]
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":500,
       *      "data":null
       *    }
       */
  
  
  
       
  app.post(`${baseUrl}/deletefriendrequest`,controller.deletefrndreq);
  /**
       * @api {post} /api/v1/users/deletefriendrequest delete friend request
       * @apiVersion 0.0.1
       * @apiGroup post
       * 
       * @apiParam {String} friendreqId of the user passed as a body parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"Request is deleted successfully",
       *   "status":200,
       *   "data": []
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":403,
       *      "data":null
       *    }
       */
  
  
  
       
  app.post(`${baseUrl}/unfriend`,controller.unfriend);
  /**
       * @api {post} /api/v1/users/unfriend delete friend 
       * @apiVersion 0.0.1
       * @apiGroup post
       * 
       * @apiParam {String} friendId of the user passed as a body parameter
       * 
       *  @apiSuccessExample {json} Success-Response:
       *  {
       *   "error":false,
       *   "message":"Unfriend successfully",
       *   "status":200,
       *   "data": []
       *  }
       *   @apiErrorExample {json} Error-Response:
       *    {
       *      "error":true,
       *      "message":"Error Occured",
       *      "status":403,
       *      "data":null
       *    }
       */
  
  

}
