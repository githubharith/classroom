import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false,
            message: "Access Denied: No token provided" 
        });
    }

    // Check if header is in the format "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({ 
            success: false,
            message: "Invalid authorization header format" 
        });
    }

    const token = parts[1];
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        
        let message = "Invalid Token";
        if (error.name === 'TokenExpiredError') {
            message = "Token Expired";
        } else if (error.name === 'JsonWebTokenError') {
            message = "Malformed Token";
        }
        
        return res.status(401).json({ 
            success: false,
            message 
        });
    }
};

export default authMiddleware