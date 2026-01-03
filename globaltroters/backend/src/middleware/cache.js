// backend/src/middleware/cache.js
const redis = require('redis');
const { promisify } = require('util');

class CacheService {
    constructor() {
        this.client = redis.createClient({
            url: process.env.REDIS_URL
        });
        this.client.on('error', (err) => console.log('Redis Client Error', err));
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
    }

    async getOrSet(key, fetchFn, ttl = 3600) {
        const cached = await this.getAsync(key);
        if (cached) {
            return JSON.parse(cached);
        }

        const freshData = await fetchFn();
        await this.setAsync(key, JSON.stringify(freshData), 'EX', ttl);
        return freshData;
    }
}

// Database query optimization
const getTripWithOptimizedQuery = async (tripId) => {
    return await Trip.findOne({
        where: { id: tripId },
        include: [
            {
                model: TripStop,
                include: [{
                    model: ItineraryDay,
                    include: [{
                        model: TripActivity,
                        separate: true, // Separate query for better performance
                        order: [['start_time', 'ASC']]
                    }],
                    order: [['date', 'ASC']]
                }],
                order: [['order_index', 'ASC']]
            }
        ],
        attributes: {
            include: [
                [
                    sequelize.literal(`(
                        SELECT COUNT(*) FROM trip_stops 
                        WHERE trip_stops.trip_id = Trip.id
                    )`),
                    'total_stops'
                ]
            ]
        }
    });
};