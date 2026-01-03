// backend/tests/trip.test.js
const request = require('supertest');
const app = require('../src/app');
const { Trip, User } = require('../src/models');

describe('Trip API Endpoints', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
        // Setup test user
        testUser = await User.create({
            email: 'test@example.com',
            username: 'testuser',
            full_name: 'Test User',
            password_hash: 'hashedpassword'
        });

        // Get auth token
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        authToken = res.body.token;
    });

    describe('POST /api/trips', () => {
        it('should create a new trip', async () => {
            const tripData = {
                name: 'Europe Tour 2024',
                description: 'Summer trip across Europe',
                start_date: '2024-06-01',
                end_date: '2024-06-15',
                budget: 5000,
                currency: 'USD'
            };

            const res = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${authToken}`)
                .send(tripData);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe(tripData.name);
        });

        it('should validate trip dates', async () => {
            const invalidTripData = {
                name: 'Invalid Trip',
                start_date: '2024-06-15',
                end_date: '2024-06-01', // End before start
            };

            const res = await request(app)
                .post('/api/trips')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidTripData);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('GET /api/trips', () => {
        it('should get user trips', async () => {
            const res = await request(app)
                .get('/api/trips')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });
    });
});

// frontend/src/tests/ItineraryBuilder.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TripContext } from '../contexts/TripContext';
import ItineraryBuilder from '../components/itinerary/ItineraryBuilder';

const mockTrip = {
    id: 1,
    name: 'Test Trip',
    stops: [
        {
            id: 1,
            city_name: 'Paris',
            arrival_date: '2024-06-01',
            departure_date: '2024-06-03',
            days: []
        }
    ]
};

describe('ItineraryBuilder Component', () => {
    test('renders itinerary builder with trip stops', () => {
        render(
            <TripContext.Provider value={{ currentTrip: mockTrip }}>
                <ItineraryBuilder trip={mockTrip} />
            </TripContext.Provider>
        );

        expect(screen.getByText('Itinerary Builder')).toBeInTheDocument();
        expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    test('allows adding new city', () => {
        render(
            <TripContext.Provider value={{ currentTrip: mockTrip }}>
                <ItineraryBuilder trip={mockTrip} />
            </TripContext.Provider>
        );

        const input = screen.getByLabelText('Add City');
        fireEvent.change(input, { target: { value: 'London' } });
        
        expect(input.value).toBe('London');
    });
});