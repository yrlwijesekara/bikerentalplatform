import Place from "../model/places.js";

export async function createPlace(req, res) {
    try{
        const newPlace = new Place(req.body);
        try{
            const savedPlace = await newPlace.save();
            res.status(201).json({
                message: "Place created successfully",
                place: savedPlace
            });
        } catch (error) {
            res.status(500).json({ message: "Error creating place", error });
        }
    } catch (error) {
        res.status(500).json({ message: "Error creating place", error });
    }
}

export async function getAllPlaces(req, res) {
    try {
        let places;
        
        // Admins can see all places, others see only active places
        if (req.user && req.user.role === 'admin') {
            places = await Place.find();
        } else {
            places = await Place.find({ status: 'active' });
        }
        
        res.status(200).json(places);
    } catch (error) {
        res.status(500).json({ message: "Error fetching places", error });
    }
}

export async function getPlaceById(req, res) {
    try {
        let place;
        
        // Admins can see any place, others see only active places
        if (req.user && req.user.role === 'admin') {
            place = await Place.findById(req.params.id);
        } else {
            place = await Place.findOne({ _id: req.params.id, status: 'active' });
        }
        
        if (!place) {
            return res.status(404).json({ message: "Place not found" });
        }
        res.status(200).json(place);
    } catch (error) {
        res.status(500).json({ message: "Error fetching place", error });
    }
}

export async function deletePlace(req, res) {
    try {
        const placeId = req.params.id;
        const result = await Place.deleteOne({ _id: placeId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Place not found",
                error: "Not found"
            });
        }
        
        res.status(200).json({
            message: "Place deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting place:", error);
        res.status(500).json({
            message: "Error deleting place",
            error: "Internal server error"
        });
    }
}

export async function updatePlace(req, res) {
    const data = req.body;
    const placeId = req.params.id;
    data.placeId = placeId;
    try {
        await Place.updateOne({ _id: placeId }, data);
        res.status(200).json({
            message: "Place updated successfully"
        });
    } catch (error) {
        console.error("Error updating place:", error);
        res.status(500).json({
            message: "Error updating place",
            error: "Internal server error"
        });
    }
}

// Admin-specific functions for Places Admin Page
export async function updatePlaceStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate status
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be 'active' or 'inactive'"
            });
        }
        
        const place = await Place.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );
        
        if (!place) {
            return res.status(404).json({
                message: "Place not found"
            });
        }
        
        res.status(200).json({
            message: "Place status updated successfully",
            place
        });
    } catch (error) {
        console.error("Error updating place status:", error);
        res.status(500).json({
            message: "Error updating place status",
            error: "Internal server error"
        });
    }
}

export async function updatePlaceFeatured(req, res) {
    try {
        const { id } = req.params;
        const { isFeatured } = req.body;
        
        // Validate isFeatured
        if (typeof isFeatured !== 'boolean') {
            return res.status(400).json({
                message: "Invalid featured status. Must be true or false"
            });
        }
        
        const place = await Place.findByIdAndUpdate(
            id, 
            { isFeatured }, 
            { new: true }
        );
        
        if (!place) {
            return res.status(404).json({
                message: "Place not found"
            });
        }
        
        res.status(200).json({
            message: "Place featured status updated successfully",
            place
        });
    } catch (error) {
        console.error("Error updating place featured status:", error);
        res.status(500).json({
            message: "Error updating place featured status",
            error: "Internal server error"
        });
    }
}

export async function updatePlaceNote(req, res) {
    try {
        const { id } = req.params;
        const { note } = req.body;
        
        // Validate note length
        if (note && note.length > 50) {
            return res.status(400).json({
                message: "Note must be 50 characters or less"
            });
        }
        
        const place = await Place.findByIdAndUpdate(
            id, 
            { note: note || "" }, 
            { new: true }
        );
        
        if (!place) {
            return res.status(404).json({
                message: "Place not found"
            });
        }
        
        res.status(200).json({
            message: "Place note updated successfully",
            place
        });
    } catch (error) {
        console.error("Error updating place note:", error);
        res.status(500).json({
            message: "Error updating place note",
            error: "Internal server error"
        });
    }
}
