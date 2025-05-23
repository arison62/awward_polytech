import models from "../models/index.js";
import bcrypt from "bcrypt";
import { isEmailValid, generateToken } from "../utils.js";



export const createAdmin = async (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" })
    }
    if (!isEmailValid(email)) {
        return res.status(400).json({ message: "Invalid email" })
    }
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" })
    }
    const hash_password = bcrypt.hashSync(password, 10)
    const count = await models.Admin.count({})
    console.log("count: ", count)
    models.Admin.create({ email, password: hash_password, is_verified: count === 0 })
        .then((admin) => {
            const payload = { id: admin.id, role: "admin" }
            res.status(201).json({ message: "Admin created successfully", access_token: generateToken(payload) })
        })
        .catch((error) => {
            console.log(error)
            res.status(500).json({ message: "Error creating admin", error })
        })

}

export const signInAdmin = (req, res) => {

    const {email, password} = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" })
    }
    models.Admin.findOne({ where: { email } })
        .then((admin) => {
            if (!admin) {
                return res.status(401).json({ message: "Admin not found" })
            }
            if (!bcrypt.compareSync(password, admin.password)) {
                return res.status(401).json({ message: "Invalid password" })
            }
            const payload = { id: admin.id, role: "admin" }
            const isVerified = admin.is_verified
            if (!isVerified) {
                return res.status(401).json({ message: "Admin not verified" })
            }
            res.status(200).json({ message: "Admin logged in successfully", access_token: generateToken(payload) })
        })
        .catch((error) => {
            res.status(500).json({ message: "Error logging in admin", error })
        });
}