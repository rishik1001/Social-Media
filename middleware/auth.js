import users from "../models/user.js"
import jwt from "jsonwebtoken";
export const isAuthenticated = async (req,res,next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            res.status(404).json({
                success: false,
                message: "Login First"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userinfo = await users.findById(decoded._id);
        req.user = userinfo;
        next();
    }
    catch (error)
    {
        res.status(500).json({
            success: false,
            message: error.message  
        })
    }
}