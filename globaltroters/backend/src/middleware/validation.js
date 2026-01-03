// backend/src/middleware/validation.js
const { z } = require('zod');

const tripCreateSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    budget: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    is_public: z.boolean().optional()
}).refine(data => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date must be after start date"
});

const tripStopCreateSchema = z.object({
    city_name: z.string().min(1).max(255),
    country_code: z.string().length(2).optional(),
    arrival_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
});

const activityCreateSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(500).optional(),
    activity_type: z.enum(['sightseeing', 'dining', 'transport', 'accommodation', 'shopping', 'other']),
    start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    location_name: z.string().max(255).optional(),
    cost: z.number().positive().optional()
}).refine(data => !data.end_time || !data.start_time || data.end_time >= data.start_time, {
    message: "End time must be after start time"
});