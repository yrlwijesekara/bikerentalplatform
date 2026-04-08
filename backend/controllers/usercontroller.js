import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import OTP from "../model/otp.js";

function getEmailTransporter() {
        const emailUser = process.env.EMAIL_USER;
        const emailPassword = process.env.EMAIL_PASSWORD;

        if (!emailUser || !emailPassword) {
                throw new Error("Email service is not configured. Set EMAIL_USER and EMAIL_PASSWORD in backend/.env.");
        }

        return nodemailer.createTransport({
                service: "gmail",
                auth: {
                        user: emailUser,
                        pass: emailPassword
                }
        });
}

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
        const { accessToken, role } = req.body;
        const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : '';
        const requestedRole = normalizedRole === 'vendor' || normalizedRole === 'user' ? normalizedRole : null;

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
            if (!requestedRole) {
                return res.status(400).json({
                    error: "Select a role before using Google login for the first time",
                    code: "ROLE_REQUIRED"
                });
            }

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
                role: requestedRole,
                isemailverified: true,
                location: {},
                preferences: {},
                vendorDetails: requestedRole === 'vendor'
                    ? {
                        shopName: '',
                        shopLicenseNo: '',
                        description: '',
                        rating: 0,
                        totalReviews: 0,
                        isApproved: false
                    }
                    : undefined
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

    const { firstname, lastname, email, phone, address, city, shopName, shopLicenseNo, description, image } = req.body;

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

    const updateData = {
        firstname,
        lastname,
        email,
        phone,
        address,
        city
    };

    if (typeof image === 'string') {
        updateData.image = image;
    }

    if (req.user.role === 'vendor') {
        updateData.vendorDetails = {
            shopName: shopName || '',
            shopLicenseNo: shopLicenseNo || '',
            description: description || '',
            rating: req.user.vendorDetails?.rating || 0,
            totalReviews: req.user.vendorDetails?.totalReviews || 0,
            isApproved: req.user.vendorDetails?.isApproved || false
        };
    }

    User.findByIdAndUpdate(
        req.user.id,
        updateData,
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

// Get all users (admin only)
export async function getAllUsers(req, res) {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }

        const users = await User.find({})
            .select('firstname lastname email phone role address city location image isemailverified isblocked vendorDetails preferences')
            .sort({ createdAt: -1 });

        const formattedUsers = users.map((user) => ({
            id: user._id,
            name: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
            email: user.email,
            phone: user.phone,
            address: user.address,
            city: user.city,
            role: user.role,
            image: user.image,
            location: user.location,
            isemailverified: user.isemailverified,
            isblocked: user.isblocked,
            vendorDetails: user.vendorDetails,
            preferences: user.preferences,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));

        return res.status(200).json({
            total: formattedUsers.length,
            users: formattedUsers
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
}

export async function updateVendorApproval(req, res) {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }

        const { id } = req.params;
        const { isApproved } = req.body;

        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({ error: "isApproved must be a boolean value" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        if (user.role !== 'vendor') {
            return res.status(400).json({ error: "Only vendor accounts can be approved" });
        }

        user.vendorDetails = {
            ...(user.vendorDetails || {}),
            isApproved
        };

        await user.save();

        return res.status(200).json({
            message: `Vendor ${isApproved ? 'approved' : 'unapproved'} successfully`,
            user: buildUserPayload(user)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to update vendor approval' });
    }
}

export async function verifyOTP(req, res) {
  const { email, otp } = req.body;

  try {
    // Find OTP entry
    const otpEntry = await OTP.findOne({ email });

    if (!otpEntry) {
      return res.status(404).json({ message: "OTP not found or expired" });
    }

    // Check if OTP matches
    if (otpEntry.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (new Date() > otpEntry.expireAt) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ message: "OTP has expired" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
}
export async function sendResetPasswordOTP(req, res) {
  const email = req.body.email;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: email });

    // Create new OTP entry
    const otpEntry = new OTP({
      email: email,
      otp: otp,
      expireAt: new Date(Date.now() + 10 * 60 * 1000) // OTP valid for 10 minutes
    });
    await otpEntry.save();

    // Send email with OTP
        const transporter = getEmailTransporter();

        const mailOptions = {
            from: `${process.env.EMAIL_USER}`,
      to: email,
      subject: 'Password Reset OTP - ridelanka',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Use the OTP below to reset your password:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1F2937; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p><strong>This OTP will expire in 10 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
          <p style="color: #6B7280; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('Error sending OTP:', error);

        if (error.message.includes('Email service is not configured')) {
            return res.status(500).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
}

export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;

  try {
    // Verify OTP one more time
    const otpEntry = await OTP.findOne({ email });

    if (!otpEntry) {
      return res.status(404).json({ message: "OTP not found or expired" });
    }

    if (otpEntry.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > otpEntry.expireAt) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Hash new password
    const passwordHash = bcrypt.hashSync(newPassword, 10);

    // Update user password
    const user = await User.findOneAndUpdate(
      { email },
      { password: passwordHash },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete OTP entry after successful password reset
    await OTP.deleteOne({ email });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
}

// Helper functions for checking roles
export function checkVendor(user) {
    return user != null && user.role === 'vendor';
}

export function checkAdmin(user) {
    return user != null && user.role === 'admin';
}