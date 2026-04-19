import express from "express";
import {
	subscribeNewsletter,
	getNewsletterSubscribersAdmin,
	exportNewsletterSubscribersAdmin,
} from "../controllers/newsletterController.js";

const router = express.Router();

router.post("/subscribe", subscribeNewsletter);
router.get("/admin/subscribers", getNewsletterSubscribersAdmin);
router.get("/admin/export", exportNewsletterSubscribersAdmin);

export default router;
