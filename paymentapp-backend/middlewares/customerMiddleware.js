const JWT_SECRET =  require("../config");
const jwt = require("jsonwebtoken")
const { User } = require("../db");
const zod = require("zod");
const userSchema = zod.object({
    username: zod.string().email({ message: "Invalid email address" }),
    password: zod.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one digit" })
    .regex(/[@$!#%*?&]/, { message: "Password must contain at least one special character" }),     
    firstname: zod.string()
    , lastname: zod.string()
})
async function zodMiddleware(req, res, next) {
    const { username, password, firstname, lastname, bankId } = req.body;
    // console.log(req.body);
    
    try {
        const result =userSchema.safeParse( { username, password, firstname, lastname});
    
        if(result.success){
            next();
        }
        else{
            console.log(
                
                "result is ", result
            );
            
        }
        }
     catch (error) {
        
                    return res.json({message : "validation inputs failed", message: error})    
    }
}
async function signupMiddleware(req, res, next) {
    console.log(req.body);
    
    try {
        const obj = await User.findOne({ username: req.body.username });
        console.log(obj);

            if(obj){
            res.status(401).json({
                message: "User with that email already exists. Please try to sign-in instead. tttt"
            })
            return;
        }
        next();
        
    } catch (error) {
        console.error("Error in signupMiddleware:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
}

// async function customerJwtMiddleware(req, res,  next) {
//     let token =         req.headers.authorization?.split(" ")[1];
//     console.log("xxtoken");
    
//     if(!token){
//         return res.json({message: "no token sent from frontend or logged out"})
//     }
//     const verfied = jwt.verify(token, JWT_SECRET);
//     console.log("verified ", verfied);
//     if(verfied){
//         req.user= verfied;
//         console.log("req.user ", req.user);
//         next();
//     }
//     else{
//         return res.status(403).json({message: "not authorized to access this api"})
//     }
   
// }

async function customerJwtMiddleware(req, res, next) {
    try {
        let token = req.headers.authorization?.split(" ")[1];
        console.log("xxtoken");
            console.log("token in here is ", token);
            
        if (!token) {
            return res.status(401).json({ message: "No token sent from frontend or logged out" });
        }

        const verified = jwt.verify(token, JWT_SECRET);
        console.log("verified ", verified);

        if (verified) {
            req.user = verified;
            console.log("req.user ", req.user);
            next();
        } else {
            return res.status(403).json({ message: "Not authorized to access this API or logged out"});
        }
    } catch (error) {
        console.error("Error in customerJwtMiddleware: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports = { signupMiddleware, zodMiddleware, customerJwtMiddleware }