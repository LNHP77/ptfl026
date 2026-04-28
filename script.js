// ==================== INITIALISATION PRINCIPALE ====================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Thème (checkbox)
    const checkbox = document.getElementById("checkbox");
    if (checkbox) {
        const toggleTheme = () => {
            if (checkbox.checked) {
                document.body.classList.add("light-mode");
                localStorage.setItem("theme", "light");
            } else {
                document.body.classList.remove("light-mode");
                localStorage.setItem("theme", "dark");
            }
        };
        checkbox.addEventListener("change", toggleTheme);
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            checkbox.checked = true;
            document.body.classList.add("light-mode");
        }
    }

    // 2. Scroll progress
    calcScrollValue();
    window.onscroll = calcScrollValue;

    // 3. Curseur personnalisé
    initCustomCursor();
    
    // 4. Gestion modale pour le curseur
    handleCursorOnModal();
    
    // 5. Slider projets
    initProjectSlider();
    
    // 6. Animations au scroll
    initScrollAnimations();
    
    // 7. Navbar
    initNavbar();
});

// ==================== SCROLL PROGRESS ====================
let calcScrollValue = () => {
    let scrollProgress = document.getElementById("progress");
    if (!scrollProgress) return;
    
    let pos = document.documentElement.scrollTop;
    let calcHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrollValue = Math.round((pos * 100) / calcHeight);
    
    if (pos > 100) {
        scrollProgress.style.display = "grid";
    } else {
        scrollProgress.style.display = "none";
    }
    
    scrollProgress.addEventListener("click", () => {
        document.documentElement.scrollTop = 0;
    });
    
    scrollProgress.style.background = `conic-gradient(#ff4500 ${scrollValue}%, #d7d7d7 ${scrollValue}%)`;
};

// ==================== CURSEUR PERSONNALISÉ ====================
const coords = { x: 0, y: 0 };
let circles = [];
let animationId = null;

function initCustomCursor() {
    circles = document.querySelectorAll(".circle");
    if (circles.length === 0) return;
    
    const colors = ["orangered"];
    
    circles.forEach(function (circle, index) {
        circle.x = 0;
        circle.y = 0;
        circle.style.backgroundColor = colors[index % colors.length];
    });
    
    window.addEventListener("mousemove", function (e) {
        coords.x = e.clientX;
        coords.y = e.clientY;
    });
    
    // Arrêter l'ancienne animation si elle existe
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    animateCircles();
}

function animateCircles() {
    if (circles.length === 0) return;
    
    let x = coords.x;
    let y = coords.y;
    
    circles.forEach(function (circle, index) {
        circle.style.left = x - 12 + "px";
        circle.style.top = y - 12 + "px";
        circle.style.scale = (circles.length - index) / circles.length;
        
        circle.x = x;
        circle.y = y;
        
        const nextCircle = circles[index + 1] || circles[0];
        x += (nextCircle.x - x) * 0.3;
        y += (nextCircle.y - y) * 0.3;
    });
    
    animationId = requestAnimationFrame(animateCircles);
}

// ==================== GESTION CURSEUR SUR MODALE ====================
function handleCursorOnModal() {
    const cursor = document.querySelector('.cursor');
    const modals = document.querySelectorAll('.modal');
    
    function setCursorVisibility(isVisible) {
        if (cursor) {
            cursor.style.display = isVisible ? 'block' : 'none';
            document.body.style.cursor = isVisible ? 'none' : 'auto';
        }
    }
    
    function checkModalVisibility() {
        let isModalOpen = false;
        modals.forEach(modal => {
            if (modal.classList.contains('show')) {
                isModalOpen = true;
            }
        });
        setCursorVisibility(!isModalOpen);
    }
    
    // Vérifier au chargement
    checkModalVisibility();
    
    // Observer les changements de classe sur les modales
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                checkModalVisibility();
            }
        });
    });
    
    modals.forEach(modal => {
        observer.observe(modal, { attributes: true });
        
        // Écouter les événements Bootstrap
        modal.addEventListener('show.bs.modal', () => setCursorVisibility(false));
        modal.addEventListener('hidden.bs.modal', () => setCursorVisibility(true));
    });
}

// ==================== SLIDER PROJETS ====================
// Données des projets
const projectsData = [
    {
        id: 1,
        title: "EXPRIMER",
        image: "https://picsum.photos/id/26/800/600",
        tags: ["PHP", "JAVASCRIPT", "MYSQL"],
        date: "Mars 2026 (2 semaines)",
        contexte: "Conception et développement complet d'un réseau social dédié à la musique.",
        features: [
            "Fil d'actualité personnalisé",
            "Système de messagerie instantanée",
            "Gestion de contenu multimédia"
        ],
        link: "cv.pdf"
    },
    {
        id: 2,
        title: "ENTREPRENDRE",
        image: "https://picsum.photos/id/13/800/600",
        tags: ["Node.JS", "WebAssembly", "Socket.io"],
        date: "Janvier 2026 (3 semaines)",
        contexte: "Jeu multijoueur asymétrique avec des mécaniques innovantes.",
        features: [
            "Matchmaking en temps réel",
            "Chat vocal intégré",
            "Système de classement"
        ],
        link: "cv.pdf"
    },
    {
        id: 3,
        title: "COMPRENDRE",
        image: "https://picsum.photos/id/0/800/600",
        tags: ["React", "Firebase", "Tailwind"],
        date: "Novembre 2025 (4 semaines)",
        contexte: "Application éducative interactive pour l'apprentissage des maths.",
        features: [
            "Exercices personnalisés",
            "Suivi de progression",
            "Mode hors ligne"
        ],
        link: "cv.pdf"
    },
    {
        id: 4,
        title: "CONCEVOIR",
        image: "https://picsum.photos/id/29/800/600",
        tags: ["Figma", "Adobe XD", "UI/UX"],
        date: "Septembre 2025 (2 semaines)",
        contexte: "Design UI/UX professionnel pour une application bancaire.",
        features: [
            "Design system complet",
            "Prototypage interactif",
            "Tests utilisateurs"
        ],
        link: "cv.pdf"
    }
];


let currentProjectIndex = 0;

function initProjectSlider() {
    const modal = document.getElementById('modalProjet1');
    if (!modal) return;
    
    createDots();
    displayProject(0);
    
    const nextBtn = document.getElementById('nextProject');
    const prevBtn = document.getElementById('prevProject');
    
    if (nextBtn) nextBtn.addEventListener('click', nextProject);
    if (prevBtn) prevBtn.addEventListener('click', prevProject);
    
    modal.addEventListener('show.bs.modal', () => {
        currentProjectIndex = 0;
        displayProject(0);
    });
}

function displayProject(index) {
    const project = projectsData[index];
    if (!project) return;
    
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.style.backgroundImage = `url('${project.image}')`;
    }
    
    const modalContent = document.getElementById('modalContent');
    if (modalContent) {
        modalContent.innerHTML = `
            <h2 class="project-title dmp">${project.title}</h2>
            <div class="tech-tags">
                ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
            </div>
            <a href="${project.link}" class="btn link-btn px-4 py-2" style="background: linear-gradient(45deg, #ff4500, #e82b2b, #ff6b6b);">
                VOIR LE PROJET 
                <svg class="custom-icon w-5 h-5 ms-2" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>
            <hr>
            <div class="info-section">
                <div class="section-title">DATE & DURÉE</div>
                <div class="section-text info-value">${project.date}</div>
            </div>
            <div class="info-section">
                <div class="section-title">CONTEXTE DÉTAILLÉ</div>
                <div class="section-text">${project.contexte}</div>
            </div>
            <div class="info-section">
                <div class="section-title">SPÉCIFICITÉS FONCTIONNELLES</div>
                <ul class="section-text features-list">
                    ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    updateDots(index);
    
    const prevBtn = document.getElementById('prevProject');
    const nextBtn = document.getElementById('nextProject');
    
    if (prevBtn) {
        prevBtn.style.opacity = index === 0 ? '0.3' : '1';
        prevBtn.style.cursor = index === 0 ? 'not-allowed' : 'pointer';
    }
    
    if (nextBtn) {
        nextBtn.style.opacity = index === projectsData.length - 1 ? '0.3' : '1';
        nextBtn.style.cursor = index === projectsData.length - 1 ? 'not-allowed' : 'pointer';
    }
}

function createDots() {
    const dotsContainer = document.getElementById('sliderDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    projectsData.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (index === currentProjectIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
            currentProjectIndex = index;
            displayProject(currentProjectIndex);
        });
        dotsContainer.appendChild(dot);
    });
}

function updateDots(activeIndex) {
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        if (index === activeIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function nextProject() {
    if (currentProjectIndex < projectsData.length - 1) {
        currentProjectIndex++;
        displayProject(currentProjectIndex);
    }
}

function prevProject() {
    if (currentProjectIndex > 0) {
        currentProjectIndex--;
        displayProject(currentProjectIndex);
    }
}

// ==================== BOUTON FERMER MODALE ====================
const btnFermer = document.getElementById("btn-fermer-manuel");
if (btnFermer) {
    btnFermer.addEventListener("click", function () {
        const maModaleElement = document.getElementById("modalProjet2");
        if (maModaleElement) {
            const modalInstance = bootstrap.Modal.getInstance(maModaleElement);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    });
}

// Animation au scroll pour la section contact
const contactWrapper = document.querySelector(".contact-wrapper");

function isInView(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight - 100 && rect.bottom > 0;
}

function checkContactVisibility() {
    if (contactWrapper && isInView(contactWrapper)) {
        contactWrapper.classList.add("contact-wrapper--visible");
    }
}

window.addEventListener("scroll", checkContactVisibility);
checkContactVisibility(); // Vérification initiale


// Gestion des préférences cookies
document.addEventListener('DOMContentLoaded', function() {
    const cookieModal = document.getElementById('cookiesModal');
    if (cookieModal) {
        const saveBtn = cookieModal.querySelector('.btn-legal-close');
        const checkboxes = cookieModal.querySelectorAll('input[type="checkbox"]');
        
        saveBtn.addEventListener('click', function() {
            const preferences = {};
            checkboxes.forEach(cb => {
                preferences[cb.parentElement.textContent.trim()] = cb.checked;
            });
            localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        });
    }
});