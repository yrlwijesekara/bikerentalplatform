import user from "../model/user.js";

export function createUser(req, res) {
    const user = new user(req.body);
    user.save()
        .then(() => res.status(201).send(user))
        .catch((error) => res.status(400).send({ error: error.message }));
}