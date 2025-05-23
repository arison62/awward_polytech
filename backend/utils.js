import jwt from "jsonwebtoken";

export const isEmailValid = (email) =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);  
}

export const generateToken = (user) => {
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    return token;
}

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}