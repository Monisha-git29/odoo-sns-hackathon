// backend/src/routes/tripRoutes.js
const express = require('express');
const router = express.Router();
const {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    addTripStop,
    updateTripStop,
    reorderTripStops,
    addItineraryDay,
    addActivity,
    updateActivity,
    deleteActivity,
    getTripCollaborators,
    addCollaborator,
    removeCollaborator
} = require('../controllers/tripController');
const { auth, validate } = require('../middleware');

// Trip management
router.post('/', auth, validate.tripCreate, createTrip);
router.get('/', auth, getTrips);
router.get('/:id', auth, getTripById);
router.put('/:id', auth, validate.tripUpdate, updateTrip);
router.delete('/:id', auth, deleteTrip);

// Trip stops management
router.post('/:tripId/stops', auth, validate.tripStopCreate, addTripStop);
router.put('/stops/:stopId', auth, validate.tripStopUpdate, updateTripStop);
router.patch('/:tripId/stops/reorder', auth, reorderTripStops);

// Itinerary management
router.post('/stops/:stopId/days', auth, validate.dayCreate, addItineraryDay);

// Activity management
router.post('/days/:dayId/activities', auth, validate.activityCreate, addActivity);
router.put('/activities/:activityId', auth, validate.activityUpdate, updateActivity);
router.delete('/activities/:activityId', auth, deleteActivity);

// Collaboration
router.get('/:tripId/collaborators', auth, getTripCollaborators);
router.post('/:tripId/collaborators', auth, addCollaborator);
router.delete('/:tripId/collaborators/:userId', auth, removeCollaborator);

module.exports = router;