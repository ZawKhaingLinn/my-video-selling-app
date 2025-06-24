const jwt = require('jsonwebtoken');

// This middleware will check if the user is authenticated via JWT
module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // We will send the token in a custom header called 'x-auth-token'

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' }); // 401 means Unauthorized
    }

    // Verify token
    try {
        // jwt.verify() will decode the token using our secret and return the payload (which contains user.id)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user object (containing user id) to the request for access in routes
        req.user = decoded.user;
        next(); // Move to the next middleware or route handler
    } catch (err) {
        // If token is not valid (e.g., expired, malformed)
        res.status(401).json({ msg: 'Token is not valid' });
    }
};