import { verifyToken } from "./utils.js";
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decodedToken;
    next();
};

export default authMiddleware;