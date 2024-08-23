const zod = require("zod");
const adminSchema = zod.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one digit" })
    .regex(/[@$!%*?&#]/, { message: "Password must contain at least one special character" })

const JWT_SECRET = require("../config");
const jwt = require("jsonwebtoken")

function adminJwtAuthenticateMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.json({ message: "no token provided" });
    }

    try {
        const verfied = jwt.verify(token, JWT_SECRET);
        console.log("verifying admin ", verfied);
        if (verfied.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Not an admin" });
        }
        req.user = verfied;
        next();
    } catch (error) {
        console.log(error);

    }
}



function adminZodMiddleware(req, res, next) {
    const result = adminSchema.safeParse(req.body.newPwd);
    if (result.success) {
        next();
    }
    else {
        res.status(400).json({
            message: 'Validation failed due to weak password Strength',
            errors: result.error.errors
        })
    }
}

module.exports = { adminJwtAuthenticateMiddleware, adminZodMiddleware }