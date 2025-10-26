<<<<<<< HEAD
// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if(targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 90,
                behavior: 'smooth'
            });
        }
    });
});

// Sticky header on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if(header) {
        if(window.scrollY > 100) {
            header.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    }
});

// Carousel functionality
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        let currentIndex = 0;
        const totalImages = 6;
        const intervalTime = 3000; // 3 seconds

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalImages;
            const translateX = - (currentIndex * (100 / totalImages));
            carousel.style.transform = `translateX(${translateX}%)`;
        }

        // Auto-scroll every 3 seconds
        setInterval(nextSlide, intervalTime);

        // Optional: Pause on hover
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => {
                carousel.style.animationPlayState = 'paused';
            });
            carouselContainer.addEventListener('mouseleave', () => {
                carousel.style.animationPlayState = 'running';
            });
        }
    }
});
=======
// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if(targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 90,
                behavior: 'smooth'
            });
        }
    });
});

// Sticky header on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if(header) {
        if(window.scrollY > 100) {
            header.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
    }
});

// Carousel functionality
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        let currentIndex = 0;
        const totalImages = 6;
        const intervalTime = 3000; // 3 seconds

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalImages;
            const translateX = - (currentIndex * (100 / totalImages));
            carousel.style.transform = `translateX(${translateX}%)`;
        }

        // Auto-scroll every 3 seconds
        setInterval(nextSlide, intervalTime);

        // Optional: Pause on hover
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => {
                carousel.style.animationPlayState = 'paused';
            });
            carouselContainer.addEventListener('mouseleave', () => {
                carousel.style.animationPlayState = 'running';
            });
        }
    }
});
>>>>>>> aec2d52f7339ec075ae7ba471a021102c74306b1
