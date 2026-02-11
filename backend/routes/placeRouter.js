import express from 'express';
import { createPlace, getAllPlaces, getPlaceById } from '../controllers/placecontroller.js';
import { isAdmin } from '../controllers/usercontroller.js';

const router = express.Router();

// Public routes - anyone can view places
router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);

// Admin only routes - only admins can create places
router.post('/', isAdmin, createPlace);

export default router;