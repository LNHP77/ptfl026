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

    // 8. Animation texte hero
    initHeroTextAnimation();

    // 9. Filtres projets
    initFilterButtons();

    // 10. Lightbox pour les ai-gcard
    initLightbox();

    // 11. Lightbox PDF
    initPdfLightbox();

    // 12. Barres de progression compétences
    initSkillBars();

    // 13. Timeline apparition au scroll
    initTimeline();

    // 14. Pcards apparition au scroll
    initPcards();

    // 15. Texte about apparition au scroll
    initScrollReveal('.reveal');

    // 12. Fix scroll mobile : style inline sur chaque modal-body
    //     (équivalent à écrire l'attribut style directement dans le HTML)
    document.querySelectorAll('.ai-modal-body').forEach(el => {
        el.style.maxHeight = 'calc(100dvh - 60px)';
        el.style.overflowY = 'scroll';
        el.style.webkitOverflowScrolling = 'touch';
        el.style.overscrollBehavior = 'contain';
    });
});

// ==================== SCROLL REVEAL ====================
function initScrollReveal(selector, threshold = 0.15) {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold });

    items.forEach(item => {
        if (item.getBoundingClientRect().top < window.innerHeight) {
            // Déjà dans le viewport au chargement : visible instantanément, sans animation
            item.style.transition = 'none';
            item.classList.add('visible');
            requestAnimationFrame(() => requestAnimationFrame(() => {
                item.style.transition = '';
            }));
        } else {
            observer.observe(item);
        }
    });
}

function initTimeline() { initScrollReveal('.timeline-item'); }
function initPcards()   { initScrollReveal('.pcard', 0.1); }

// ==================== SKILL CIRCLES ====================
function initSkillBars() {
    const fills = document.querySelectorAll('.skill-fill-circle');
    if (!fills.length) return;

    const circumference = 2 * Math.PI * 42; // 263.9

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const offset = circumference * (1 - parseFloat(el.dataset.width) / 100);
                el.style.strokeDashoffset = offset;
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    fills.forEach(fill => observer.observe(fill));
}

// ==================== LIGHTBOX ====================
function initLightbox() {
    const overlay = document.getElementById('lightbox');
    const img     = document.getElementById('lightbox-img');
    const closeBtn = overlay.querySelector('.lightbox-close');
    if (!overlay || !img) return;

    const cursorEl = document.querySelector('.cursor');

    function open(url) {
        img.src = url;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (cursorEl) cursorEl.style.visibility = 'hidden';
        document.body.style.cursor = 'zoom-out';
    }
    function close() {
        overlay.classList.remove('active');
        img.src = '';
        document.body.style.overflow = '';
        if (cursorEl) cursorEl.style.visibility = 'visible';
        document.body.style.cursor = document.querySelector('.modal.show') ? 'auto' : 'none';
    }

    document.addEventListener('click', e => {
        const card = e.target.closest('.ai-gcard:not(.ai-gcard-stat)');
        if (card) {
            const bg = card.style.backgroundImage;
            const match = bg.match(/url\(["']?(.+?)["']?\)/);
            if (match) open(match[1]);
        }
    });

    closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    document.addEventListener('mouseover', e => {
        if (e.target.closest('.ai-gcard:not(.ai-gcard-stat)')) {
            if (cursorEl) cursorEl.style.visibility = 'hidden';
            document.body.style.cursor = 'zoom-in';
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest('.ai-gcard:not(.ai-gcard-stat)')) {
            if (cursorEl) cursorEl.style.visibility = 'visible';
            document.body.style.cursor = document.querySelector('.modal.show') ? 'auto' : 'none';
        }
    });
}

// ==================== NAVBAR ====================
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
    });
}

// ==================== FILTRES PROJETS ====================
function initFilterButtons() {
    const buttons = document.querySelectorAll('.btn-filter[data-filter]');
    const items = document.querySelectorAll('.project-filter-item');

    function applyFilter(filter) {
        items.forEach(item => {
            if (item.dataset.category === filter) {
                item.classList.remove('filter-hidden');
                item.classList.add('filter-appear');
                item.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
                item.addEventListener('animationend', () => item.classList.remove('filter-appear'), { once: true });
            } else {
                item.classList.add('filter-hidden');
            }
        });
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.dataset.filter);
        });
    });

    const activeBtn = document.querySelector('.btn-filter.active');
    if (activeBtn) applyFilter(activeBtn.dataset.filter);
}

// ==================== ANIMATIONS AU SCROLL ====================
function initScrollAnimations() {
    const selectors = [
        '.card-custom',
        '.timeline-item',
        '.pcard',
        '.hero .col-lg-6',
        '.divider',
    ];

    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            el.classList.add('reveal');
        });
    });

    // Stagger les éléments dans un même .row
    document.querySelectorAll('.row').forEach(row => {
        row.querySelectorAll('.reveal').forEach((el, i) => {
            el.style.transitionDelay = `${i * 0.12}s`;
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ==================== ANIMATION TEXTE HERO ====================
function initHeroTextAnimation() {
    const title = document.querySelector('.video-hero h1');
    const subtitle = document.querySelector('.video-hero h6');

    if (title) {
        const text = title.textContent.trim();
        const charCount = text.length;
        title.innerHTML = text.split('').map((ch, i) =>
            `<span class="hero-letter" style="animation-delay:${(i * 0.07).toFixed(2)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
        ).join('');

        if (subtitle) {
            const delay = (charCount * 0.07 + 0.2).toFixed(2);
            subtitle.style.opacity = '0';
            subtitle.style.animation = `heroFadeIn 0.7s ease ${delay}s forwards`;
        }
    }
}

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
    
    let savedScrollY = 0;

    // Bloque le scroll du fond : autorisé uniquement dans .modal-body
    function lockBodyTouch(e) {
        if (!e.target.closest('.modal-body')) e.preventDefault();
    }

    modals.forEach(modal => {
        observer.observe(modal, { attributes: true });

        modal.addEventListener('show.bs.modal', () => {
            savedScrollY = window.scrollY;
            setCursorVisibility(false);
        });

        modal.addEventListener('shown.bs.modal', () => {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${savedScrollY}px`;
            document.body.style.width = '100%';
            document.addEventListener('touchmove', lockBodyTouch, { passive: false });
        });

        modal.addEventListener('hidden.bs.modal', () => {
            document.documentElement.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.removeEventListener('touchmove', lockBodyTouch);
            window.scrollTo({ top: savedScrollY, behavior: 'instant' });
            setCursorVisibility(true);
        });
    });
}



const modalConfigs = [
    { modalId: 'modalProjet1', prevId: 'prevProject',  nextId: 'nextProject',  imageId: 'modalImage',  contentId: 'modalContent',  minIdx: 0, maxIdx: 2  }, // EXPRIMER (ROLL UP IUT → BLOK → COMPRENDRE)
    { modalId: 'modalProjet2', prevId: 'prevProject2', nextId: 'nextProject2', imageId: 'modalImage2', contentId: 'modalContent2', minIdx: 8, maxIdx: 9   }, // ENTREPRENDRE (PPP → BMC)
    { modalId: 'modalProjet3', prevId: 'prevProject3', nextId: 'nextProject3', imageId: 'modalImage3', contentId: 'modalContent3', minIdx: 3, maxIdx: 4   }, // COMPRENDRE (COART → MME CROWDFUNDING)
    { modalId: 'modalProjet4', prevId: 'prevProject4', nextId: 'nextProject4', imageId: 'modalImage4', contentId: 'modalContent4', minIdx: 5, maxIdx: 6   }, // CONCEVOIR (CARATUNE → PUB CHANEL)
    { modalId: 'modalProjet5', prevId: 'prevProject5', nextId: 'nextProject5', imageId: 'modalImage5', contentId: 'modalContent5', minIdx: 10, maxIdx: 11 }, // DÉVELOPPER (SAE 4 CREA.02 → PORTFOLIO)
];

const modalState = {};

function initProjectSlider() {
    modalConfigs.forEach(cfg => {
        const modal = document.getElementById(cfg.modalId);
        if (!modal) return;

        modalState[cfg.modalId] = cfg.minIdx;
        modalState[cfg.modalId + '_min'] = cfg.minIdx;
        modalState[cfg.modalId + '_max'] = cfg.maxIdx;

        const prevBtn = document.getElementById(cfg.prevId);
        const nextBtn = document.getElementById(cfg.nextId);

        if (prevBtn) prevBtn.addEventListener('click', () => {
            const min = modalState[cfg.modalId + '_min'];
            if (modalState[cfg.modalId] > min) {
                modalState[cfg.modalId]--;
                displayProject(modalState[cfg.modalId], cfg);
            }
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            const max = modalState[cfg.modalId + '_max'];
            if (modalState[cfg.modalId] < max) {
                modalState[cfg.modalId]++;
                displayProject(modalState[cfg.modalId], cfg);
            }
        });

        modal.addEventListener('show.bs.modal', (event) => {
            const trigger = event.relatedTarget;
            const index = trigger ? parseInt(trigger.dataset.projectIndex ?? cfg.minIdx) : cfg.minIdx;
            const min = trigger?.dataset.modalMin !== undefined ? parseInt(trigger.dataset.modalMin) : cfg.minIdx;
            const max = trigger?.dataset.modalMax !== undefined ? parseInt(trigger.dataset.modalMax) : cfg.maxIdx;

            modalState[cfg.modalId] = index;
            modalState[cfg.modalId + '_min'] = min;
            modalState[cfg.modalId + '_max'] = max;

            displayProject(index, cfg);
        });
    });
}

function displayProject(index, cfg) {
    const project = projectsData[index];
    if (!project) return;

    const min = modalState[cfg.modalId + '_min'] ?? cfg.minIdx;
    const max = modalState[cfg.modalId + '_max'] ?? cfg.maxIdx;

    const modalImage = document.getElementById(cfg.imageId);
    if (modalImage) modalImage.style.backgroundImage = `url('${project.image}')`;

    const modalContent = document.getElementById(cfg.contentId);
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

    const prevBtn = document.getElementById(cfg.prevId);
    const nextBtn = document.getElementById(cfg.nextId);
    if (prevBtn) {
        prevBtn.style.opacity = index === min ? '0.3' : '1';
        prevBtn.style.cursor = index === min ? 'not-allowed' : 'pointer';
    }
    if (nextBtn) {
        nextBtn.style.opacity = index === max ? '0.3' : '1';
        nextBtn.style.cursor = index === max ? 'not-allowed' : 'pointer';
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


// ==================== PDF LIGHTBOX ====================
function initPdfLightbox() {
    const overlay = document.getElementById('pdf-lightbox');
    if (!overlay) return;

    const frame    = overlay.querySelector('.pdf-lightbox-frame');
    const closeBtn = overlay.querySelector('.pdf-lightbox-close');
    const cursorEl = document.querySelector('.cursor');

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches || navigator.maxTouchPoints > 1;

    function openPdf(url) {
        if (isMobile()) {
            window.open(url, '_blank');
            return;
        }
        frame.src = url;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (cursorEl) cursorEl.style.visibility = 'hidden';
        document.body.style.cursor = 'auto';
    }

    function closePdf() {
        overlay.classList.remove('active');
        frame.src = '';
        document.body.style.overflow = '';
        if (cursorEl) cursorEl.style.visibility = 'visible';
        document.body.style.cursor = 'none';
    }

    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-pdf]');
        if (btn) {
            e.preventDefault();
            openPdf(btn.dataset.pdf);
        }
    });

    closeBtn.addEventListener('click', closePdf);
    overlay.addEventListener('click', e => { if (e.target === overlay) closePdf(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closePdf(); });
}

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
