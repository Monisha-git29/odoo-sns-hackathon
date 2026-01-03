// backend/src/services/socketService.js
const socketIO = require('socket.io');

class SocketService {
    constructor(server) {
        this.io = socketIO(server, {
            cors: {
                origin: process.env.FRONTEND_URL,
                methods: ["GET", "POST"]
            }
        });
        this.tripRooms = new Map();
        this.setupSocketEvents();
    }

    setupSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            // Join trip room
            socket.on('join-trip', (tripId) => {
                socket.join(`trip:${tripId}`);
                this.tripRooms.set(socket.id, tripId);
            });

            // Real-time itinerary updates
            socket.on('activity-update', (data) => {
                const { tripId, activityId, updates } = data;
                socket.to(`trip:${tripId}`).emit('activity-updated', {
                    activityId,
                    updates,
                    updatedBy: socket.userId,
                    timestamp: new Date()
                });
            });

            // Live collaboration cursor
            socket.on('cursor-move', (data) => {
                const { tripId, position } = data;
                socket.to(`trip:${tripId}`).emit('user-cursor', {
                    userId: socket.userId,
                    position,
                    socketId: socket.id
                });
            });

            socket.on('disconnect', () => {
                const tripId = this.tripRooms.get(socket.id);
                if (tripId) {
                    socket.to(`trip:${tripId}`).emit('user-left', {
                        userId: socket.userId,
                        socketId: socket.id
                    });
                }
                this.tripRooms.delete(socket.id);
            });
        });
    }
}

module.exports = SocketService;