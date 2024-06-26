const {validateAuthToken} = require('../utils/authtoken')
require('dotenv').config()
// request -> authentication -> autorization -> route controller -> ...
const authHeader = 'authorization';

/* check user based on authenication token/header return in req.user with user data info and req.authenticated bool true if user is authenticated otherwise false */
const authenticate = async (req, res, next)=>{
    let authToken = req.headers[authHeader]; 
    if(!authToken){
        console.log("Authenticated :", false)
        req.authenticated = false; 
        return next();  
    }

    //for now jwt token holds user data but this will be changed to hold maybe id of user or smth else and based on that will determine user
    const user = await validateAuthToken(authToken); 
    

    if(user){
        req.authenticated = true;
        req.user = user; 
    }else{
        req.authenticated = false;
        req.user = undefined
    }
    console.log("authenticated :",req.authenticated);
    next();
}

function createpPermisionObj(){
    return{
        viewer : false, 
        member : false, 
        admin : false, 
        owner : false, 
        user : false, 
    }
}

function authorize (requiredRoles){
    return async (req, res, next) => {
        req.permissions = createpPermisionObj(); 
        req.permissions.viewer = true;

        if(req.authenticated){
            req.permissions.user = true
        }

        const path = req.originalUrl.split('/')

        if(req.params.clubname && path[1]=='club'){
            //console.log("club request, check if user is a club member/admin" )
        }
        
        roles = requiredRoles.split(':')
        //check if in required roles, user have one of those role 
        const isAuthorized = roles.some(role => req.permissions[role]);
        console.log("Authorized :", isAuthorized)
        if(isAuthorized){

            return next(); 
        }
        res.status(401).json({succesfull: false, message : "Unauthorized"})
        return
    }
}

module.exports = {authenticate,authorize}