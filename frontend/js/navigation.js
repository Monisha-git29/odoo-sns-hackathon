// Navigation Module
class NavigationService {
    constructor() {
        this.initializeNavigation();
    }

    initializeNavigation() {
        // Highlight active page
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });

        // Responsive menu toggle (for mobile)
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        // Add mobile menu button if needed
        if (window.innerWidth <= 768) {
            const navbar = document.querySelector('.navbar');
            if (navbar && !document.querySelector('.menu-toggle')) {
                const menuToggle = document.createElement('button');
                menuToggle.className = 'menu-toggle';
                menuToggle.innerHTML = '☰';
                navbar.insertBefore(menuToggle, navbar.querySelector('.nav-links'));
                
                const navLinks = navbar.querySelector('.nav-links');
                menuToggle.addEventListener('click', () => {
                    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
                });
            }
        }
    }

    navigateTo(page) {
        window.location.href = page;
    }

    showLoading() {
        // Add loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="spinner"></div>
        `;
        document.body.appendChild(overlay);
    }

    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Initialize navigation
const navigation = new NavigationService();

// Export for use in other modules
window.navigationService = navigation;