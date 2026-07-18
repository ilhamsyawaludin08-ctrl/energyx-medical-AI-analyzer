const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err && err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: true,
                    statusCode: 401,
                    message: 'Token Expired' 
                });
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: role tidak diizinkan' });
        }
        next();
    };
};
