import express from 'express';
import { createPlace, getAllPlaces, getPlaceById, deletePlace } from '../controllers/placecontroller.js';
import { isAdmin } from '../controllers/usercontroller.js';

const router = express.Router();

// Public routes - anyone can view places
router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);

// Admin only routes - only admins can create/delete places
router.post('/', isAdmin, createPlace);
router.delete('/:id', isAdmin, deletePlace);

export default router;