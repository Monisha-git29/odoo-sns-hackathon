// frontend/src/components/itinerary/ItineraryBuilder.jsx
import React, { useState, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    IconButton,
    TextField,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SortableTripStop from './SortableTripStop';
import ActivityCard from './ActivityCard';
import { itineraryService } from '../../services/api';

const ItineraryBuilder = ({ trip, socket, onActivityUpdate }) => {
    const [tripStops, setTripStops] = useState(trip.stops || []);
    const [editingStop, setEditingStop] = useState(null);
    const [newCity, setNewCity] = useState('');
    const [expandedStop, setExpandedStop] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        
        if (active.id !== over.id) {
            setTripStops((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                
                // Update order in backend
                updateStopOrder(newOrder);
                return newOrder;
            });
        }
    };

    const updateStopOrder = async (stops) => {
        try {
            await itineraryService.reorderStops(trip.id, stops.map((stop, index) => ({
                id: stop.id,
                order_index: index
            })));
        } catch (error) {
            console.error('Failed to update stop order:', error);
        }
    };

    const handleAddStop = async () => {
        if (!newCity.trim()) return;

        try {
            const stopData = {
                city_name: newCity,
                arrival_date: new Date().toISOString().split('T')[0],
                departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                order_index: tripStops.length
            };

            const response = await itineraryService.addTripStop(trip.id, stopData);
            setTripStops([...tripStops, response.data]);
            setNewCity('');
        } catch (error) {
            console.error('Failed to add trip stop:', error);
        }
    };

    const handleAddActivity = async (dayId) => {
        try {
            const activityData = {
                title: 'New Activity',
                activity_type: 'other',
                start_time: '09:00',
                end_time: '10:00'
            };

            const response = await itineraryService.addActivity(dayId, activityData);
            
            // Update local state
            const updatedStops = tripStops.map(stop => {
                const updatedDays = stop.days?.map(day => 
                    day.id === dayId 
                        ? { ...day, activities: [...day.activities, response.data] }
                        : day
                );
                return { ...stop, days: updatedDays };
            });
            
            setTripStops(updatedStops);
            
            // Real-time update
            socket.emit('activity-added', {
                tripId: trip.id,
                dayId,
                activity: response.data
            });
        } catch (error) {
            console.error('Failed to add activity:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Itinerary Builder
            </Typography>
            
            {/* Add New City Section */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Add City"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            placeholder="Enter city name"
                            variant="outlined"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddStop}
                        >
                            Add Stop
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="textSecondary">
                            Drag and drop cities to reorder your trip itinerary
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* DnD Context for Trip Stops */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tripStops.map(stop => stop.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tripStops.map((stop, index) => (
                        <SortableTripStop
                            key={stop.id}
                            stop={stop}
                            index={index}
                            isExpanded={expandedStop === stop.id}
                            onExpand={() => setExpandedStop(
                                expandedStop === stop.id ? null : stop.id
                            )}
                            onAddActivity={handleAddActivity}
                            onActivityUpdate={onActivityUpdate}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            {/* Total Trip Summary */}
            {tripStops.length > 0 && (
                <Paper sx={{ p: 2, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Trip Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                                Total Stops
                            </Typography>
                            <Typography variant="h6">
                                {tripStops.length}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                                Total Days
                            </Typography>
                            <Typography variant="h6">
                                {tripStops.reduce((total, stop) => {
                                    const days = Math.ceil(
                                        (new Date(stop.departure_date) - new Date(stop.arrival_date)) 
                                        / (1000 * 60 * 60 * 24)
                                    ) + 1;
                                    return total + days;
                                }, 0)}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                                Activities
                            </Typography>
                            <Typography variant="h6">
                                {tripStops.reduce((total, stop) => {
                                    return total + (stop.days?.reduce((dayTotal, day) => 
                                        dayTotal + day.activities.length, 0) || 0);
                                }, 0)}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                                Estimated Budget
                            </Typography>
                            <Typography variant="h6">
                                ${trip.budget?.toLocaleString() || '0'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Box>
    );
};

export default ItineraryBuilder;