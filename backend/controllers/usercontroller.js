import User from "../model/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function createUser(req, res) {

    const passwordHash = bcrypt.hashSync(req.body.password, 10);

    const userData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: passwordHash,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city
    }
    const newUser = new User(userData);
    newUser.save()
        .then(() => res.status(201).send(newUser))
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
                role: user.role,
                isemailverified: user.isemailverified,
                isblocked: user.isblocked,
                image: user.image
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
                    role: user.role,
                    isemailverified: user.isemailverified,
                    isblocked: user.isblocked,
                    image: user.image
                }
            });
        })
        .catch((error) => res.status(500).send({ error: error.message }));
}