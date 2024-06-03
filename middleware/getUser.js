const jwt = require('jsonwebtoken');
const JWT_SECRET = "iamvatsal";

const fetchUser= (req , res , next) =>{
    //get token from header

    const token=req.header('auth-token');//while hitting api name nust be same in header i.e auth-token
    
    if(!token){
        return res.status(401).send({error :"Plese authanticate by using valid toekn"});
    }
    try {
    const data=jwt.verify(token , JWT_SECRET);
    req.user = data.user;
    next(); //will call next fucntion in auth.js file
    }
    catch (error) {
        return res.status(401).send({error :"Plese authanticate by using valid toekn"});
        next();
    }
}
   


module.exports=fetchUser;