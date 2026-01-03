// frontend/src/pages/TripPlanningDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography,
    Box,
    Tabs,
    Tab
} from '@mui/material';
import { TripContext } from '../contexts/TripContext';
import CreateTripForm from '../components/trips/CreateTripForm';
import TripList from '../components/trips/TripList';
import ItineraryBuilder from '../components/itinerary/ItineraryBuilder';
import ItineraryView from '../components/itinerary/ItineraryView';
import RealTimeCollaboration from '../components/collaboration/RealTimeCollaboration';
import { useTripSocket } from '../hooks/useTripSocket';
import { tripService } from '../services/api';

const TripPlanningDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [trips, setTrips] = useState([]);
    const [currentTrip, setCurrentTrip] = useState(null);
    const { tripId } = useParams();
    
    // Real-time socket connection
    const socket = useTripSocket(tripId);

    useEffect(() => {
        loadTrips();
        if (tripId) {
            loadTripDetails(tripId);
        }
    }, [tripId]);

    const loadTrips = async () => {
        try {
            const response = await tripService.getUserTrips();
            setTrips(response.data);
        } catch (error) {
            console.error('Failed to load trips:', error);
        }
    };

    const handleTripCreated = (newTrip) => {
        setTrips([...trips, newTrip]);
        setCurrentTrip(newTrip);
        setActiveTab(2); // Switch to itinerary builder
    };

    const handleActivityUpdate = (updatedActivity) => {
        // Real-time update via socket
        socket.emit('activity-update', {
            tripId,
            activityId: updatedActivity.id,
            updates: updatedActivity
        });
    };

    return (
        <TripContext.Provider value={{ currentTrip, setCurrentTrip }}>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {/* Header */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h4" component="h1">
                                Trip Planning Dashboard
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Plan, organize, and manage your travel itineraries
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Navigation Tabs */}
                    <Grid item xs={12}>
                        <Paper sx={{ mb: 3 }}>
                            <Tabs 
                                value={activeTab} 
                                onChange={(e, newValue) => setActiveTab(newValue)}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab label="My Trips" />
                                <Tab label="Create Trip" />
                                <Tab label="Itinerary Builder" />
                                <Tab label="Itinerary View" />
                                <Tab label="Collaboration" />
                            </Tabs>
                        </Paper>
                    </Grid>

                    {/* Content based on active tab */}
                    <Grid item xs={12}>
                        {activeTab === 0 && (
                            <TripList 
                                trips={trips}
                                onTripSelect={(trip) => {
                                    setCurrentTrip(trip);
                                    setActiveTab(2);
                                }}
                                onTripDelete={loadTrips}
                            />
                        )}

                        {activeTab === 1 && (
                            <CreateTripForm onSuccess={handleTripCreated} />
                        )}

                        {activeTab === 2 && currentTrip && (
                            <ItineraryBuilder 
                                trip={currentTrip}
                                onActivityUpdate={handleActivityUpdate}
                                socket={socket}
                            />
                        )}

                        {activeTab === 3 && currentTrip && (
                            <ItineraryView trip={currentTrip} />
                        )}

                        {activeTab === 4 && tripId && (
                            <RealTimeCollaboration 
                                tripId={tripId}
                                socket={socket}
                            />
                        )}
                    </Grid>
                </Grid>
            </Container>
        </TripContext.Provider>
    );
};

export default TripPlanningDashboard;