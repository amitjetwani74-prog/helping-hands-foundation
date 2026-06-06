/**
 * HELPING HANDS FOUNDATION — MAIN SCRIPT
 * Features: Navbar, Scroll, Counters, Testimonials,
 *           FAQs, Forms, Particles, Animations
 */

/* ============================
   UTILITY FUNCTIONS
   ============================ */

/**
 * Select DOM element(s)
 */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/**
 * Show a toast notification
 * @param {string} message
 * @param {string} type - 'success' | 'error'
 */
function showToast(message, type = 'success') {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.borderLeftColor = type === 'success' ? '#22c55e' : '#e74c3c';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ============================
   SCROLL PROGRESS BAR
   ============================ */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }, { passive: true });
}

/* ============================
   STICKY NAVBAR
   ============================ */
function initNavbar() {
  const navbar = $('#navbar');
  if (!navbar) return;

  const scrolled = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  scrolled(); // check on load
  window.addEventListener('scroll', scrolled, { passive: true });
}

/* ============================
   HAMBURGER MENU
   ============================ */
function initHamburger() {
  const hamburger = $('#hamburger');
  const navLinks  = $('#nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu when a nav link is clicked
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ============================
   ACTIVE NAV LINK ON SCROLL
   ============================ */
function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks  = $$('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* ============================
   SCROLL REVEAL ANIMATIONS
   ============================ */
function initScrollReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay for siblings inside the same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const index = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 0.08}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

/* ============================
   ANIMATED COUNTERS
   ============================ */
function animateCounter(el, target, duration = 2200) {
  const startTime = performance.now();
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = Math.floor(easedProgress * target);
    el.textContent = current >= 1000
      ? (current >= 10000 ? Math.floor(current / 1000) + ',' + String(current % 1000).padStart(3, '0') : current.toLocaleString('en-IN'))
      : current;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString('en-IN');
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const statNumbers = $$('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  statNumbers.forEach(el => observer.observe(el));
}

/* ============================
   TESTIMONIAL SLIDER
   ============================ */
function initSlider() {
  const track = $('#testimonial-track');
  const dotsContainer = $('#slider-dots');
  const prevBtn = $('#prev-btn');
  const nextBtn = $('#next-btn');
  if (!track) return;

  const slides = $$('.testimonial-slide');
  let current = 0;
  let autoplayInterval;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    $$('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
  }

  function goNext() { goTo(current + 1); }
  function goPrev() { goTo(current - 1); }

  nextBtn.addEventListener('click', () => { goNext(); resetAutoplay(); });
  prevBtn.addEventListener('click', () => { goPrev(); resetAutoplay(); });

  // Autoplay
  function startAutoplay() {
    autoplayInterval = setInterval(goNext, 5500);
  }
  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    resetAutoplay();
  }, { passive: true });

  startAutoplay();
}

/* ============================
   FAQ ACCORDION
   ============================ */
function initFAQ() {
  const faqItems = $$('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });
}

/* ============================
   FORM VALIDATION
   ============================ */

/**
 * Validate a single field
 * @returns {boolean} isValid
 */
function validateField(input) {
  const errEl = input.parentElement.querySelector('.error-msg');
  const val = input.value.trim();
  let msg = '';

  if (input.required && !val) {
    msg = 'This field is required.';
  } else if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    msg = 'Please enter a valid email address.';
  } else if (input.type === 'tel' && val && !/^[\d\s+\-()]{7,15}$/.test(val)) {
    msg = 'Please enter a valid phone number.';
  } else if (input.tagName === 'SELECT' && input.required && !val) {
    msg = 'Please select an option.';
  }

  if (errEl) errEl.textContent = msg;
  input.classList.toggle('error', !!msg);
  return !msg;
}

/**
 * Validate all fields in a form
 * @returns {boolean} allValid
 */
function validateForm(form) {
  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  let valid = true;
  fields.forEach(field => {
    if (!validateField(field)) valid = false;
  });
  return valid;
}

function initForms() {
  // Inline validation on blur
  $$('input, select, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  // Volunteer Form
  const volForm = $('#vol-form');
  if (volForm) {
    volForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(volForm)) {
        volForm.reset();
        showToast('🎉 Registration submitted! We\'ll contact you within 48 hours.');
      } else {
        showToast('Please fill in all required fields.', 'error');
      }
    });
  }

  // Contact Form
  const contactForm = $('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(contactForm)) {
        contactForm.reset();
        showToast('✉️ Message sent! We\'ll get back to you shortly.');
      } else {
        showToast('Please fill in all required fields.', 'error');
      }
    });
  }

  // Newsletter Form
  const nlForm = $('#newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = $('#nl-email');
      if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        emailInput.value = '';
        showToast('📬 Subscribed! Thank you for joining our community.');
      } else {
        showToast('Please enter a valid email address.', 'error');
      }
    });
  }
}

/* ============================
   DONATION CARD SELECTION
   ============================ */
function selectDonation(amount) {
  const cards = $$('.donate-card');
  cards.forEach(card => {
    const cardAmount = card.dataset.amount;
    const isActive = String(cardAmount) === String(amount);
    card.style.outline = isActive ? '3px solid var(--green-500)' : '';
    card.style.outlineOffset = '2px';
  });

  if (amount === 'custom') {
    const customEl = $('#custom-amount');
    const val = customEl ? parseInt(customEl.value, 10) : 0;
    if (!val || val < 100) {
      showToast('Please enter a minimum amount of ₹100.', 'error');
      return;
    }
    showToast(`❤️ Custom donation of ₹${val.toLocaleString('en-IN')} selected! Thank you.`);
  } else {
    showToast(`❤️ ₹${parseInt(amount, 10).toLocaleString('en-IN')} donation selected! Thank you.`);
  }
}

// Expose globally (called via onclick attributes in HTML)
window.selectDonation = selectDonation;

/* ============================
   BACK TO TOP BUTTON
   ============================ */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================
   FLOATING PARTICLES (Hero)
   ============================ */
function initParticles() {
  const container = $('#hero-particles');
  if (!container) return;

  const COUNT = 18;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${Math.random() * 14 + 10}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${Math.random() * 0.5 + 0.15};
    `;
    container.appendChild(p);
  }
}

/* ============================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = $(targetId);
      if (!target) return;
      e.preventDefault();
      const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'), 10) || 76;
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });
}

/* ============================
   GALLERY LIGHTBOX (Simple)
   ============================ */
function initGallery() {
  const items = $$('.gallery-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const label = item.querySelector('.gallery-overlay span');
      if (!img) return;

      // Create lightbox
      const lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;
        display:flex;align-items:center;justify-content:center;padding:20px;
        cursor:zoom-out;animation:fadeIn 0.3s ease;
      `;

      const style = document.createElement('style');
      style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
      document.head.appendChild(style);

      const imgEl = document.createElement('img');
      imgEl.src = img.src.replace(/w=\d+/, 'w=1200');
      imgEl.alt = img.alt;
      imgEl.style.cssText = 'max-width:90vw;max-height:88vh;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,0.6);';

      const caption = document.createElement('div');
      caption.textContent = label ? label.textContent : '';
      caption.style.cssText = 'position:absolute;bottom:28px;left:50%;transform:translateX(-50%);color:white;font-weight:600;font-size:1rem;letter-spacing:0.04em;';

      const close = document.createElement('button');
      close.textContent = '✕';
      close.style.cssText = 'position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.15);color:white;border:none;width:40px;height:40px;border-radius:50%;font-size:1.1rem;cursor:pointer;';

      lb.appendChild(imgEl);
      lb.appendChild(caption);
      lb.appendChild(close);
      document.body.appendChild(lb);
      document.body.style.overflow = 'hidden';

      const closeLB = () => {
        lb.remove();
        style.remove();
        document.body.style.overflow = '';
      };

      lb.addEventListener('click', e => { if (e.target === lb || e.target === close) closeLB(); });
      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') { closeLB(); document.removeEventListener('keydown', onKey); }
      });
    });
  });
}

/* ============================
   PROGRAM CARD TILT EFFECT
   ============================ */
function initCardTilt() {
  $$('.program-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ============================
   DONATION CUSTOM AMOUNT
   ============================ */
function initCustomDonation() {
  const customInput = $('#custom-amount');
  if (!customInput) return;
  customInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') selectDonation('custom');
  });
}

/* ============================
   STAGGER ANIMATION FOR GRIDS
   ============================ */
function applyStaggerDelays() {
  const grids = [
    '.programs-grid .program-card',
    '.stats-grid .stat-card',
    '.events-grid .event-card',
    '.donate-cards .donate-card',
    '.footer-col'
  ];

  grids.forEach(selector => {
    $$(selector).forEach((el, i) => {
      if (!el.style.transitionDelay) {
        el.style.transitionDelay = `${i * 0.1}s`;
      }
    });
  });
}

/* ============================
   INIT ALL
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initHamburger();
  initActiveNav();
  initScrollReveal();
  initCounters();
  initSlider();
  initFAQ();
  initForms();
  initBackToTop();
  initParticles();
  initSmoothScroll();
  initGallery();
  initCardTilt();
  initCustomDonation();
  applyStaggerDelays();
});