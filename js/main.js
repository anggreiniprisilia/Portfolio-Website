(function () {
  'use strict';

  // ---- DOM references ----
  const navbar       = document.getElementById('navbar');
  const exploreBtn   = document.getElementById('exploreBtn');
  const navHamburger = document.getElementById('navHamburger');
  const navLinks     = document.getElementById('navLinks');
  const modalOverlay = document.getElementById('modalOverlay');
  const articleModal = document.getElementById('articleModal');
  const modalClose   = document.getElementById('modalClose');
  const modalInner   = document.getElementById('modalInner');
  const welcomeSection = document.getElementById('welcome');

  // ============================================================
  // 1. EXPLORE BUTTON → smooth scroll past welcome
  // ============================================================
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const portfolioSection = document.getElementById('portfolio');
      if (portfolioSection) {
        portfolioSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ============================================================
  // 2. NAVBAR — show/hide based on scroll position & section
  // ============================================================
  function updateNavbar() {
    const scrollY = window.scrollY;
    const welcomeBottom = welcomeSection
      ? welcomeSection.offsetTop + welcomeSection.offsetHeight - 80
      : 0;

    // Show navbar only when scrolled past the welcome section
    if (scrollY > welcomeBottom) {
      navbar.classList.add('visible');
    } else {
      navbar.classList.remove('visible');
      navLinks.classList.remove('open'); // close mobile menu when back on welcome
    }

    // Add shadow on scroll
    if (scrollY > welcomeBottom + 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // ---- Active nav link highlight ----
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('.page[id]');
    const navLinkEls = document.querySelectorAll('.nav-link');
    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinkEls.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', () => {
    updateNavbar();
    updateActiveNavLink();
    handleParallax();
    handleReveal();
  }, { passive: true });

  updateNavbar(); // initial call

  // ============================================================
  // 3. HAMBURGER MENU (mobile)
  // ============================================================
  if (navHamburger) {
    navHamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  // ============================================================
  // 4. PARALLAX EFFECT
  // ============================================================
  const parallaxPages = document.querySelectorAll('.parallax-page');

  function handleParallax() {
    const scrollY = window.scrollY;

    parallaxPages.forEach(page => {
      const speed  = parseFloat(page.dataset.speed) || 0.2;
      const bg     = page.querySelector('.parallax-bg');
      if (!bg) return;

      const rect   = page.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (window.innerHeight / 2 - center) * speed;

      bg.style.transform = `translateY(${offset}px)`;
    });
  }

  handleParallax(); // initial

  // ============================================================
  // 5. SCROLL REVEAL (IntersectionObserver)
  // ============================================================
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay based on sibling index within parent
          const siblings = Array.from(entry.target.parentElement.children);
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 0.08}s`;
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target); // only animate once
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  // ============================================================
  // 6. BLOG CARD → ARTICLE MODAL
  // ============================================================
  function openArticle(articleId) {
    const article = ARTICLES[articleId];
    if (!article) return;

    // Build modal content
    modalInner.innerHTML = `
      <h2>${article.title}</h2>
      <p class="modal-author">${article.author}</p>
      <div class="modal-hero">
        <img src="${article.heroImage}" alt="${article.title}"
          onerror="this.parentElement.style.background='rgba(178,14,25,0.07)'; this.style.display='none'"/>
      </div>
      ${article.content}
    `;

    modalOverlay.classList.add('open');
    articleModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    articleModal.scrollTop = 0;
  }

  function closeArticle() {
    modalOverlay.classList.remove('open');
    articleModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Attach click to each blog card
  document.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.article, 10);
      openArticle(id);
    });
  });

  if (modalClose)   modalClose.addEventListener('click', closeArticle);
  if (modalOverlay) modalOverlay.addEventListener('click', closeArticle);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeArticle();
  });

  // ============================================================
  // 7. STAR SPARKLE ANIMATION (welcome page)
  // ============================================================
  const stars = document.querySelectorAll('.welcome-stars .star');
  stars.forEach((star, i) => {
    star.style.animation = `starPulse ${2 + i * 0.6}s ease-in-out ${i * 0.3}s infinite alternate`;
  });

  // Inject keyframes dynamically (so no extra CSS file needed)
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes starPulse {
      0%   { opacity: 0.3; transform: scale(0.9) rotate(0deg); }
      100% { opacity: 0.75; transform: scale(1.1) rotate(15deg); }
    }
  `;
  document.head.appendChild(styleTag);

  // ============================================================
  // 8. SMOOTH SCROLL for nav links
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.classList.contains('visible') ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ============================================================
  // 9. INITIAL REVEAL PASS (elements already visible on load)
  // ============================================================
  function handleReveal() {
    // Handled by IntersectionObserver above
  }

})();