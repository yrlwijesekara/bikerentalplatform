import User from "../model/user.js";

export function createUser(req, res) {
    const newUser = new User(req.body);
    newUser.save()
        .then(() => res.status(201).send(newUser))
        .catch((error) => res.status(400).send({ error: error.message }));
}