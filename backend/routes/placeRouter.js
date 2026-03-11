import express from 'express';
import { 
    createPlace, 
    getAllPlaces, 
    getPlaceById, 
    deletePlace, 
    updatePlace,
    updatePlaceStatus,
    updatePlaceFeatured,
    updatePlaceNote
} from '../controllers/placecontroller.js';
import { isAdmin } from '../controllers/usercontroller.js';

const router = express.Router();

// Public routes - anyone can view places
router.get('/', getAllPlaces);
router.get('/:id', getPlaceById);

// Admin only routes - only admins can create/delete/update places
router.post('/', isAdmin, createPlace);
router.delete('/:id', isAdmin, deletePlace);
router.put('/:id', isAdmin, updatePlace);

// Admin-specific routes for place management
router.put('/admin/:id/status', isAdmin, updatePlaceStatus);
router.put('/admin/:id/featured', isAdmin, updatePlaceFeatured);
router.put('/admin/:id/note', isAdmin, updatePlaceNote);

export default router;