import express from "express";
import { createUser } from "../controllers/usercontroller.js";
import { loginUser } from "../controllers/usercontroller.js";
import { getuser } from "../controllers/usercontroller.js";

const router = express.Router();

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", getuser);

export default router;