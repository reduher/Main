/**
 * ===================================
 * BESORAH YESHUA MINISTRY - NAVIGATION SYSTEM
 * Complete JavaScript for Header Nav & Breadcrumbs
 * Integrated & Optimized Version
 * ===================================
 */

'use strict';

// ===================================
// CONFIGURATION
// ===================================

const NAV_CONFIG = {
    scrollThreshold: 50,
    hideOnScrollDown: false,
    breadcrumbEnabled: true,
    
    // Page titles mapping for breadcrumbs
    pageTitles: {
        'index.html': 'Home',
        'about.html': 'About Us',
        'events.html': 'Events',
        'partnership.html': 'Partnership',
        'contact.html': 'Contact',
        'donate.html': 'Donate',
        'resources.html': 'Resources',
        'sermons.html': 'Sermons',
        'books.html': 'Books',
        'prayer.html': 'Prayer Request'
    },
    
    // Parent pages for hierarchical breadcrumbs
    pageHierarchy: {
        'events.html': ['index.html'],
        'partnership.html': ['index.html'],
        'donate.html': ['index.html'],
        'about.html': ['index.html'],
        'contact.html': ['index.html'],
        'resources.html': ['index.html'],
        'sermons.html': ['index.html', 'resources.html'],
        'books.html': ['index.html', 'resources.html'],
        'prayer.html': ['index.html']
    }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get current page filename
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page === '' ? 'index.html' : page;
}

/**
 * Check if current page is homepage
 */
function isHomePage() {
    const currentPage = getCurrentPage();
    return currentPage === 'index.html' || currentPage === '';
}

/**
 * Get page title from config or filename
 */
function getPageTitle(filename) {
    if (NAV_CONFIG.pageTitles[filename]) {
        return NAV_CONFIG.pageTitles[filename];
    }
    
    // Convert filename to title (e.g., 'about-us.html' -> 'About Us')
    return filename
        .replace('.html', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ===================================
// INTEGRATED MOBILE NAVIGATION
// ===================================

class MobileNavigation {
    constructor() {
        this.hamburger = document.querySelector('.hamburger, .menu-toggle, .nav-toggle');
        this.navMenu = document.querySelector('.nav-menu, .mobile-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isOpen = false;
        this.touchStartY = 0;
        this.backdrop = null;
        
        // Bind methods for event listeners
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        this.boundHandleResize = this.throttle(this.handleResize.bind(this), 250);
        
        if (!this.hamburger || !this.navMenu) {
            console.warn('Navigation elements not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.addTransitionStyles();
        
        // Single unified event handler for toggle
        this.hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });
        
        // Prevent default touch behavior on hamburger
        this.hamburger.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, { passive: true });
        
        // Close on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen && window.innerWidth <= 768) {
                    this.close();
                }
            });
        });
        
        // Close on outside click
        document.addEventListener('click', this.boundHandleClick);
        
        // Close on escape
        document.addEventListener('keydown', this.boundHandleKeydown);
        
        // Swipe to close
        this.initSwipeToClose();
        
        // Handle resize
        window.addEventListener('resize', this.boundHandleResize);
        
        // Initialize ARIA
        this.updateARIA();
        
        // Set active page
        this.setActivePage();
    }
    
    addTransitionStyles() {
        // Ensure smooth transitions
        this.navMenu.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        
        // Initial state for slide animation
        if (window.innerWidth <= 768) {
            this.navMenu.style.transform = 'translateX(-100%)';
        }
    }
    
    handleClick(e) {
        if (this.isOpen && 
            !this.navMenu.contains(e.target) && 
            !this.hamburger.contains(e.target)) {
            this.close();
        }
    }
    
    handleKeydown(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.close();
            this.hamburger.focus();
        }
    }
    
    handleResize() {
        if (window.innerWidth > 768 && this.isOpen) {
            this.close();
        }
    }
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    
    open() {
        this.isOpen = true;
        
        this.hamburger.classList.add('active');
        this.navMenu.classList.add('active');
        this.navMenu.style.transform = 'translateX(0)';
        this.updateARIA();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        // Add backdrop
        this.addBackdrop();
        
        // Focus first link
        setTimeout(() => {
            const firstLink = this.navMenu.querySelector('.nav-link');
            firstLink?.focus();
        }, 100);
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.navMenu.style.transform = 'translateX(-100%)';
        this.updateARIA();
        
        // Restore body scroll
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('width');
        
        // Remove backdrop
        this.removeBackdrop();
    }
    
    updateARIA() {
        this.hamburger.setAttribute('aria-expanded', this.isOpen.toString());
        this.navMenu.setAttribute('aria-hidden', (!this.isOpen).toString());
    }
    
    addBackdrop() {
        if (document.querySelector('.nav-backdrop')) return;
        
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'nav-backdrop';
        this.backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(this.backdrop);
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.backdrop.style.opacity = '1';
        });
        
        this.backdrop.addEventListener('click', () => this.close());
    }
    
    removeBackdrop() {
        if (!this.backdrop) return;
        
        this.backdrop.style.opacity = '0';
        setTimeout(() => {
            if (this.backdrop && this.backdrop.parentNode) {
                this.backdrop.remove();
                this.backdrop = null;
            }
        }, 300);
    }
    
    initSwipeToClose() {
        let touchStartY = 0;
        let touchStartX = 0;
        
        this.navMenu.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        this.navMenu.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const diffY = touchStartY - touchEndY;
            const diffX = Math.abs(touchStartX - touchEndX);
            
            // Swipe down to close
            if (diffY < -100 && diffX < 50) {
                this.close();
            }
        }, { passive: true });
        
        // Enhanced edge swipe detection
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isOpen) return;
            
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            const diffX = touchStartX - touchX;
            const diffY = Math.abs(touchStartY - touchY);
            
            // Swipe from left edge to close
            if (touchStartX < 50 && diffX > 100 && diffY < 50) {
                this.close();
            }
        }, { passive: true });
    }
    
    /**
     * Set active page in navigation
     */
    setActivePage() {
        const currentPage = getCurrentPage();
        
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (href === currentPage || 
                (currentPage === 'index.html' && href === '/') ||
                (currentPage === '' && href === '/')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Cleanup method for single page applications
    destroy() {
        window.removeEventListener('resize', this.boundHandleResize);
        document.removeEventListener('click', this.boundHandleClick);
        document.removeEventListener('keydown', this.boundHandleKeydown);
        this.close();
    }
}

// ===================================
// HEADER SCROLL EFFECT
// ===================================

class HeaderScroll {
    constructor() {
        this.header = document.querySelector('header');
        this.lastScroll = 0;
        
        if (this.header) {
            this.init();
        }
    }
    
    init() {
        window.addEventListener('scroll', this.throttle(() => {
            const currentScroll = window.pageYOffset;
            
            // Add scrolled class for styling
            if (currentScroll > NAV_CONFIG.scrollThreshold) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
            
            // Optional: Hide/show header on scroll
            if (NAV_CONFIG.hideOnScrollDown) {
                if (currentScroll > this.lastScroll && currentScroll > 100) {
                    // Scrolling down
                    this.header.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    this.header.style.transform = 'translateY(0)';
                }
            }
            
            this.lastScroll = currentScroll;
        }, 100));
        
        // Mark header as loaded (removes will-change)
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.header.classList.add('loaded');
            }, 300);
        });
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ===================================
// BREADCRUMB NAVIGATION
// ===================================

class BreadcrumbNavigation {
    constructor() {
        this.wrapper = null;
        this.init();
    }
    
    init() {
        if (!NAV_CONFIG.breadcrumbEnabled) return;
        
        // Don't show breadcrumb on homepage
        if (isHomePage()) {
            document.body.classList.add('home-page');
            return;
        }
        
        this.createBreadcrumb();
    }
    
    /**
     * Create breadcrumb navigation
     */
    createBreadcrumb() {
        const currentPage = getCurrentPage();
        const breadcrumbItems = this.buildBreadcrumbPath(currentPage);
        
        // Create breadcrumb wrapper
        this.wrapper = document.createElement('nav');
        this.wrapper.className = 'breadcrumb-wrapper';
        this.wrapper.setAttribute('aria-label', 'Breadcrumb');
        
        // Create container
        const container = document.createElement('div');
        container.className = 'breadcrumb-container';
        
        // Create breadcrumb list
        const breadcrumbList = document.createElement('ol');
        breadcrumbList.className = 'breadcrumb';
        breadcrumbList.setAttribute('itemscope', '');
        breadcrumbList.setAttribute('itemtype', 'https://schema.org/BreadcrumbList');
        
        // Build breadcrumb items
        breadcrumbItems.forEach((item, index) => {
            const listItem = this.createBreadcrumbItem(item, index, breadcrumbItems.length);
            breadcrumbList.appendChild(listItem);
        });
        
        container.appendChild(breadcrumbList);
        this.wrapper.appendChild(container);
        
        // Insert after header
        const header = document.querySelector('header');
        if (header && header.parentNode) {
            header.parentNode.insertBefore(this.wrapper, header.nextSibling);
        }
        
        // Animate in
        setTimeout(() => {
            this.wrapper.style.opacity = '1';
        }, 100);
    }
    
    /**
     * Build breadcrumb path based on page hierarchy
     */
    buildBreadcrumbPath(currentPage) {
        const path = [];
        
        // Always start with home
        path.push({
            title: 'Home',
            url: 'index.html',
            isHome: true
        });
        
        // Add parent pages if they exist
        if (NAV_CONFIG.pageHierarchy[currentPage]) {
            NAV_CONFIG.pageHierarchy[currentPage].forEach(parentPage => {
                if (parentPage !== 'index.html') { // Skip home, already added
                    path.push({
                        title: getPageTitle(parentPage),
                        url: parentPage,
                        isHome: false
                    });
                }
            });
        }
        
        // Add current page
        path.push({
            title: getPageTitle(currentPage),
            url: currentPage,
            isHome: false,
            isCurrent: true
        });
        
        return path;
    }
    
    /**
     * Create individual breadcrumb item
     */
    createBreadcrumbItem(item, index, totalItems) {
        const listItem = document.createElement('li');
        listItem.className = 'breadcrumb-item';
        listItem.setAttribute('itemprop', 'itemListElement');
        listItem.setAttribute('itemscope', '');
        listItem.setAttribute('itemtype', 'https://schema.org/ListItem');
        
        // Create link or text
        if (item.isCurrent) {
            // Current page - no link
            const span = document.createElement('span');
            span.textContent = item.title;
            span.setAttribute('itemprop', 'name');
            span.setAttribute('aria-current', 'page');
            listItem.appendChild(span);
        } else {
            // Link to page
            const link = document.createElement('a');
            link.href = item.url;
            link.setAttribute('itemprop', 'item');
            
            if (item.isHome) {
                // Home icon
                const icon = document.createElement('i');
                icon.className = 'fas fa-home breadcrumb-home';
                link.appendChild(icon);
                
                const span = document.createElement('span');
                span.className = 'sr-only';
                span.textContent = item.title;
                link.appendChild(span);
            } else {
                const span = document.createElement('span');
                span.setAttribute('itemprop', 'name');
                span.textContent = item.title;
                link.appendChild(span);
            }
            
            listItem.appendChild(link);
        }
        
        // Add position for schema.org
        const positionMeta = document.createElement('meta');
        positionMeta.setAttribute('itemprop', 'position');
        positionMeta.content = (index + 1).toString();
        listItem.appendChild(positionMeta);
        
        // Add separator (except for last item)
        if (index < totalItems - 1) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '/';
            separator.setAttribute('aria-hidden', 'true');
            listItem.appendChild(separator);
        }
        
        return listItem;
    }
}

// ===================================
// SCROLL TO TOP
// ===================================

class ScrollToTop {
    constructor() {
        this.button = this.createButton();
        if (this.button) {
            this.init();
        }
    }
    
    createButton() {
        // Check if button already exists
        let btn = document.getElementById('scrollTopBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'scrollTopBtn';
            btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            btn.setAttribute('aria-label', 'Scroll to top');
            btn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #205782, #2d6fa0);
                color: white;
                border: none;
                cursor: pointer;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                opacity: 0;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(btn);
        }
        return btn;
    }
    
    init() {
        window.addEventListener('scroll', this.throttle(() => {
            if (window.pageYOffset > 300) {
                this.show();
            } else {
                this.hide();
            }
        }, 200));
        
        this.button.addEventListener('click', () => this.scrollToTop());
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
    }
    
    show() {
        this.button.style.display = 'flex';
        setTimeout(() => this.button.style.opacity = '1', 10);
    }
    
    hide() {
        this.button.style.opacity = '0';
        setTimeout(() => {
            if (window.pageYOffset <= 300) {
                this.button.style.display = 'none';
            }
        }, 300);
    }
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Return focus to top of page
        setTimeout(() => {
            const firstFocusable = document.querySelector('header [tabindex], header a, header button');
            firstFocusable?.focus();
        }, 500);
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation systems
    new MobileNavigation();
    new HeaderScroll();
    new BreadcrumbNavigation();
    new ScrollToTop();
    
    console.log('✅ Besorah Yeshua Ministry - Navigation System Initialized');
});

// ===================================
// ADD REQUIRED CSS ANIMATIONS
// ===================================

const navigationStyles = document.createElement('style');
navigationStyles.textContent = `
    /* Navigation Animations */
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    /* Breadcrumb Styles */
    .breadcrumb-wrapper {
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        padding: 1rem 0;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .breadcrumb-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }
    
    .breadcrumb {
        display: flex;
        flex-wrap: wrap;
        list-style: none;
        margin: 0;
        padding: 0;
        font-size: 0.9rem;
    }
    
    .breadcrumb-item {
        display: flex;
        align-items: center;
    }
    
    .breadcrumb-item a {
        color: #6c757d;
        text-decoration: none;
        transition: color 0.2s ease;
    }
    
    .breadcrumb-item a:hover {
        color: #205782;
    }
    
    .breadcrumb-separator {
        margin: 0 0.5rem;
        color: #6c757d;
    }
    
    .breadcrumb-home {
        margin-right: 0.25rem;
    }
    
    /* Mobile Navigation Backdrop */
    .nav-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 998;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .breadcrumb-wrapper {
            padding: 0.75rem 0;
        }
        
        .breadcrumb {
            font-size: 0.8rem;
        }
    }
    
    /* Home page specific */
    .home-page .breadcrumb-wrapper {
        display: none;
    }
    
    /* Screen reader only */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }
    
    /* Header scroll transitions */
    header {
        transition: all 0.3s ease;
    }
    
    header.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }
    
    /* Scroll to top button animations */
    #scrollTopBtn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
`;
document.head.appendChild(navigationStyles);

// ===================================
// EXPORT FOR MODULE USE (OPTIONAL)
// ===================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MobileNavigation,
        HeaderScroll,
        BreadcrumbNavigation,
        ScrollToTop,
        NAV_CONFIG
    };
}

console.log('🙏 Besorah Yeshua Ministry - Navigation.js loaded successfully');