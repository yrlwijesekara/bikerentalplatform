import Place from "../model/places.js";

export async function createPlace(req, res) {
    try{
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Only admins can create places." });
        }
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
  