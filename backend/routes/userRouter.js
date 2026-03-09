import express from "express";
import { createUser } from "../controllers/usercontroller.js";
import { loginUser } from "../controllers/usercontroller.js";
import { getuser } from "../controllers/usercontroller.js";
import { getUserProfile, updateUserProfile } from "../controllers/usercontroller.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to authenticate user
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", getuser);
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);

export default router;