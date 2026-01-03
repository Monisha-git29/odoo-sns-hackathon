// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        
        if (!user) {
            throw new Error();
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const authorizeTripAccess = async (req, res, next) => {
    try {
        const tripId = req.params.tripId || req.params.id;
        const userId = req.user.id;

        // Check if user is trip owner or collaborator
        const trip = await Trip.findOne({
            where: { id: tripId },
            include: [{
                model: TripCollaborator,
                where: { user_id: userId },
                required: false
            }]
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Allow access if user is owner or collaborator
        if (trip.user_id !== userId && !trip.TripCollaborators.length) {
            return res.status(403).json({ error: 'Access denied' });
        }

        req.trip = trip;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authorization failed' });
    }
};

module.exports = { authenticate, authorizeTripAccess };