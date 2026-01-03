// Authentication Module - Complete Implementation
class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.currentUser = null;
        this.initializeAuth();
    }

    initializeAuth() {
        // Check for existing session
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            this.currentUser = JSON.parse(userData);
            this.setupAuthHeader(token);
            this.updateUIForLoggedInUser();
        }
    }

    setupAuthHeader(token) {
        // This would be used for API calls
        this.authToken = token;
    }

    async signup(userData) {
        try {
            this.validateSignupData(userData);
            
            // Simulated API call - Replace with actual fetch
            const response = await this.mockApiCall('/signup', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (response.success) {
                this.handleLoginSuccess(response.token, response.user);
                return { success: true };
            } else {
                throw new Error(response.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: error.message };
        }
    }

    async login(credentials) {
        try {
            this.validateLoginData(credentials);
            
            // Simulated API call - Replace with actual fetch
            const response = await this.mockApiCall('/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            if (response.success) {
                this.handleLoginSuccess(response.token, response.user);
                return { success: true };
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this.currentUser = null;
        this.authToken = null;
        
        // Redirect to login page
        window.location.href = '/pages/login.html';
    }

    handleLoginSuccess(token, user) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        this.currentUser = user;
        this.setupAuthHeader(token);
        
        // Redirect to dashboard
        window.location.href = '/pages/dashboard.html';
    }

    validateSignupData(data) {
        const errors = [];

        // Email validation
        if (!this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        // Password validation
        if (!this.isValidPassword(data.password)) {
            errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
        }

        // Confirm password
        if (data.password !== data.confirmPassword) {
            errors.push('Passwords do not match');
        }

        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }

    validateLoginData(data) {
        const errors = [];

        if (!this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!data.password || data.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Mock API call for demonstration
    async mockApiCall(endpoint, options) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (endpoint === '/signup') {
            const data = JSON.parse(options.body);
            
            // Check if user already exists
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            if (existingUsers.find(u => u.email === data.email)) {
                return {
                    success: false,
                    message: 'Email already registered'
                };
            }

            // Add new user
            existingUsers.push({
                id: Date.now(),
                name: data.name,
                email: data.email,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('users', JSON.stringify(existingUsers));

            return {
                success: true,
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                    id: Date.now(),
                    name: data.name,
                    email: data.email
                }
            };
        }

        if (endpoint === '/login') {
            const data = JSON.parse(options.body);
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === data.email);

            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // In real app, verify password hash
            return {
                success: true,
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            };
        }

        return { success: false, message: 'Endpoint not found' };
    }

    updateUIForLoggedInUser() {
        // Update navigation for logged in user
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && this.currentUser) {
            navLinks.innerHTML = `
                <span>Welcome, ${this.currentUser.name}</span>
                <a href="/pages/dashboard.html">Dashboard</a>
                <a href="#" id="logoutBtn">Logout</a>
            `;
            
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
}

// Initialize Auth Service
const authService = new AuthService();

// DOM Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('loginBtn');
            const errorDiv = document.getElementById('loginError');
            const successDiv = document.getElementById('loginSuccess');

            // Reset messages
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            submitBtn.classList.add('loading');

            const result = await authService.login({ email, password });

            submitBtn.classList.remove('loading');

            if (result.success) {
                successDiv.textContent = 'Login successful! Redirecting...';
                successDiv.style.display = 'block';
            } else {
                errorDiv.textContent = result.message;
                errorDiv.style.display = 'block';
            }
        });
    }

    // Signup Form Handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const strengthBar = document.getElementById('passwordStrength');
        
        // Real-time password strength
        passwordInput.addEventListener('input', function() {
            const strength = calculatePasswordStrength(this.value);
            strengthBar.style.width = strength + '%';
            strengthBar.style.backgroundColor = getStrengthColor(strength);
        });

        // Real-time password matching
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirm = this.value;
            
            if (password && confirm) {
                if (password === confirm) {
                    this.style.borderColor = 'var(--success-color)';
                } else {
                    this.style.borderColor = 'var(--error-color)';
                }
            }
        });

        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = document.getElementById('signupBtn');
            const errorDiv = document.getElementById('signupError');
            const successDiv = document.getElementById('signupSuccess');

            // Reset messages
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            submitBtn.classList.add('loading');

            const result = await authService.signup({
                name,
                email,
                password,
                confirmPassword
            });

            submitBtn.classList.remove('loading');

            if (result.success) {
                successDiv.textContent = 'Account created successfully! Redirecting...';
                successDiv.style.display = 'block';
            } else {
                errorDiv.textContent = result.message;
                errorDiv.style.display = 'block';
            }
        });
    }

    // Password toggle visibility
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    });

    // Initialize dashboard if on dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        initializeDashboard();
    }
});

// Helper Functions
function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    return Math.min(strength, 100);
}

function getStrengthColor(strength) {
    if (strength < 50) return 'var(--error-color)';
    if (strength < 75) return 'var(--warning-color)';
    return 'var(--success-color)';
}

async function initializeDashboard() {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    const user = authService.getCurrentUser();
    document.getElementById('userName').textContent = user.name;

    // Load user's trips
    await loadUserTrips();
}

async function loadUserTrips() {
    // Mock trips data
    const mockTrips = [
        {
            id: 1,
            name: 'Paris Adventure',
            startDate: '2024-06-15',
            endDate: '2024-06-22',
            description: 'Romantic getaway to the city of love',
            budget: 2500
        },
        {
            id: 2,
            name: 'Japan Exploration',
            startDate: '2024-09-01',
            endDate: '2024-09-15',
            description: 'Cultural journey through Tokyo, Kyoto, and Osaka',
            budget: 5000
        }
    ];

    const tripsContainer = document.getElementById('tripsContainer');
    
    if (mockTrips.length === 0) {
        tripsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No trips yet</h3>
                <p>Start planning your next adventure!</p>
                <a href="/pages/create-trip.html" class="btn" style="margin-top: 20px;">Create Your First Trip</a>
            </div>
        `;
    } else {
        tripsContainer.innerHTML = mockTrips.map(trip => `
            <div class="trip-card">
                <h3>${trip.name}</h3>
                <p class="trip-dates">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>
                <p class="trip-description">${trip.description}</p>
                <div class="trip-budget">
                    <strong>Budget:</strong> $${trip.budget}
                </div>
                <div class="trip-actions" style="margin-top: 15px;">
                    <a href="/pages/itinerary.html?trip=${trip.id}" class="btn">View Details</a>
                </div>
            </div>
        `).join('');
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}