import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function buildUserPayload(user) {
    return {
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
    };
}

function signUserToken(user) {
    return jwt.sign(buildUserPayload(user), process.env.JWT_SECRET, { expiresIn: '1h' });
}

function splitGoogleName(name = '') {
    const trimmedName = name.trim();
    if (!trimmedName) {
        return { firstname: 'Google', lastname: 'User' };
    }

    const parts = trimmedName.split(/\s+/);
    return {
        firstname: parts[0],
        lastname: parts.slice(1).join(' ') || 'User'
    };
}

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

            const token = signUserToken(user);

            res.status(200).send({
                message: "Login successful",
                token: token,
                user: buildUserPayload(user)
            });
        })
        .catch((error) => res.status(500).send({ error: error.message }));
}

export async function googleLoginUser(req, res) {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: "Google access token is required" });
        }

        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!googleResponse.ok) {
            return res.status(401).json({ error: "Invalid Google token" });
        }

        const googleUser = await googleResponse.json();

        if (!googleUser.email || !googleUser.email_verified) {
            return res.status(400).json({ error: "Google account email is not verified" });
        }

        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            const { firstname, lastname } = splitGoogleName(googleUser.name);
            const passwordHash = bcrypt.hashSync(`google-${googleUser.sub}-${Date.now()}`, 10);

            user = await User.create({
                firstname,
                lastname,
                email: googleUser.email,
                password: passwordHash,
                phone: 'Not provided',
                address: 'Not provided',
                city: 'Not provided',
                image: googleUser.picture || '',
                role: 'user',
                isemailverified: true,
                location: {},
                preferences: {}
            });
        } else if (!user.image && googleUser.picture) {
            user.image = googleUser.picture;
            if (!user.isemailverified) {
                user.isemailverified = true;
            }
            await user.save();
        }

        if (user.isblocked) {
            return res.status(403).json({ error: "Account is blocked" });
        }

        const token = signUserToken(user);

        return res.status(200).json({
            message: "Google login successful",
            token,
            user: buildUserPayload(user)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Google login failed" });
    }
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

// Get user profile
export function getUserProfile(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    User.findById(req.user.id).select('-password')
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user);
        })
        .catch((error) => res.status(500).json({ error: error.message }));
}

// Update user profile
export function updateUserProfile(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    const { firstname, lastname, email, phone, address, city } = req.body;

    // Validation
    if (!firstname || !lastname || !email || !phone || !address || !city) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
    }

    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        return res.status(400).json({ error: "Please enter a valid phone number (at least 10 digits)" });
    }

    User.findByIdAndUpdate(
        req.user.id,
        {
            firstname,
            lastname,
            email,
            phone,
            address,
            city
        },
        {
            new: true,
            runValidators: true
        }
    ).select('-password')
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json({ message: "Profile updated successfully", user });
        })
        .catch((error) => {
            if (error.code === 11000) {
                return res.status(400).json({ error: "Email already exists" });
            }
            res.status(400).json({ error: error.message });
        });
}

// Helper functions for checking roles
export function checkVendor(user) {
    return user != null && user.role === 'vendor';
}

export function checkAdmin(user) {
    return user != null && user.role === 'admin';
}