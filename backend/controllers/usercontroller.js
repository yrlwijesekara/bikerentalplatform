import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function createUser(req, res) {
    // Check if trying to create admin and ensure only admin can do it
    if (req.body.role === 'admin') {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: "Only admins can create admin users" });
        }
    }

    const passwordHash = bcrypt.hashSync(req.body.password, 10);

    const userData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: passwordHash,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        location: req.body.location || {},
        image: req.body.image || '',
        role: req.body.role || 'user',
        vendorDetails: req.body.role === 'vendor' ? {
            shopName: req.body.shopName,
            shopLicenseNo: req.body.shopLicenseNo,
            description: req.body.description,
            rating: req.body.rating || 0,
            totalReviews: req.body.totalReviews || 0,
            isApproved: req.body.isApproved || false
        } : undefined,
        preferences: {
            preferredBikeType: req.body.preferredBikeType,
            travelStyle: req.body.travelStyle,
            budgetRange: req.body.budgetRange
        }
    }
    const newUser = new User(userData);
    newUser.save()
        .then(() => {
            // Remove password from response
            const { password, ...userResponse } = newUser.toObject();
            res.status(201).json(
                { message: "User created successfully", user: userResponse }
            );
        })
        .catch((error) => res.status(400).send({ error: error.message }));
}

export function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ error: "User not found" });
            }

            if (user.isblocked) {
                return res.status(403).send({ error: "Account is blocked" });
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).send({ error: "Invalid password" });
            }

            const token = jwt.sign({ 
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                address: user.address,
                city: user.city,
                location: user.location,
                image: user.image,
                role: user.role,
                isemailverified: user.isemailverified,
                isblocked: user.isblocked,
                vendorDetails: user.vendorDetails,
                preferences: user.preferences
            }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).send({
                message: "Login successful",
                token: token,
                user: {
                    id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    location: user.location,
                    image: user.image,
                    role: user.role,
                    isemailverified: user.isemailverified,
                    isblocked: user.isblocked,
                    vendorDetails: user.vendorDetails,
                    preferences: user.preferences
                }
            });
        })
        .catch((error) => res.status(500).send({ error: error.message }));
}

export function getuser(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "user not found" });
    }else {
        res.status(200).json({ user: req.user });
    }
}


export function isVendor(req, res, next) {
    if(req.user == null || req.user.role !== 'vendor') {
        return res.status(403).json({ error: "Vendor access required" });
    } else {
        next();
    }
}

export function isAdmin(req, res, next) {
    if(req.user == null || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
    } else {
        next();
    }
}

// Helper functions for checking roles
export function checkVendor(user) {
    return user != null && user.role === 'vendor';
}

export function checkAdmin(user) {
    return user != null && user.role === 'admin';
}