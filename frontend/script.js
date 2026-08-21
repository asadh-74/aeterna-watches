```javascript
// ===== AETERNA WATCH BRAND - MAIN SCRIPT =====

// Production backend deployed on Render
const API_BASE_URL = 'https://aeterna-watches.onrender.com';

// ===== LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }, 1500);
});

// ===== PARTICLES =====
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 15 + 's';
    p.style.animationDuration = (10 + Math.random() * 10) + 's';
    container.appendChild(p);
  }
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('open');
  }
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Animate stat counters
        if (entry.target.classList.contains('stat')) {
          animateCounter(entry.target.querySelector('.stat-number'));
        }
      }
    });
  }, {
    threshold: 0.15
  });

  document
    .querySelectorAll('.feature-card, .watch-card, .stat')
    .forEach(el => observer.observe(el));
}

function animateCounter(el) {
  if (!el || el.dataset.animated) return;

  el.dataset.animated = 'true';

  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(easeOut * target);

    el.textContent = current + (target === 99 ? '' : '+');

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ===== HERO PARALLAX =====
// Hero watch has been removed from index.html.
// This function safely does nothing if the element is absent.
function initHeroParallax() {
  const watch = document.getElementById('heroWatch');
  if (!watch) return;

  document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 30;
    const y = (window.innerHeight / 2 - e.clientY) / 30;

    watch.style.transform =
      `translateY(${y}px) translateX(${x}px)`;
  });
}

// ===== SMOOTH SCROLL =====
function scrollToCollection() {
  const collection = document.getElementById('collection');

  if (collection) {
    collection.scrollIntoView({
      behavior: 'smooth'
    });
  }
}

// ===== TESTIMONIALS SLIDER =====
function initTestimonials() {
  const testimonials = document.querySelectorAll('.testimonial');
  const dotsContainer = document.getElementById('testimonialDots');

  if (!dotsContainer || testimonials.length === 0) return;

  testimonials.forEach((_, i) => {
    const dot = document.createElement('div');

    dot.className =
      'testimonial-dot' + (i === 0 ? ' active' : '');

    dot.onclick = () => showTestimonial(i);

    dotsContainer.appendChild(dot);
  });

  let current = 0;

  function showTestimonial(index) {
    testimonials.forEach((t, i) => {
      t.classList.remove('active');

      if (dotsContainer.children[i]) {
        dotsContainer.children[i].classList.remove('active');
      }
    });

    testimonials[index].classList.add('active');

    if (dotsContainer.children[index]) {
      dotsContainer.children[index].classList.add('active');
    }

    current = index;
  }

  setInterval(() => {
    current = (current + 1) % testimonials.length;
    showTestimonial(current);
  }, 5000);
}

// ===== AI CHAT WIDGET =====
function openChat() {
  const widget = document.getElementById('chatWidget');
  const toggle = document.getElementById('chatToggle');
  const input = document.getElementById('chatInput');

  if (widget) widget.classList.add('open');
  if (toggle) toggle.classList.add('hidden');

  if (input) {
    input.focus();
  }
}

function closeChat() {
  const widget = document.getElementById('chatWidget');
  const toggle = document.getElementById('chatToggle');

  if (widget) widget.classList.remove('open');
  if (toggle) toggle.classList.remove('hidden');
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

function addMessage(text, sender) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;

  msgDiv.innerHTML = `
    <div class="message-bubble">
      ${escapeHtml(text)}
    </div>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const typingDiv = document.createElement('div');

  typingDiv.className = 'message bot typing';
  typingDiv.id = 'typingIndicator';

  typingDiv.innerHTML = `
    <div class="message-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById('typingIndicator');

  if (typing) {
    typing.remove();
  }
}

// Safely escape user/API text before displaying it
function escapeHtml(text) {
  const div = document.createElement('div');

  div.textContent = text ?? '';

  return div.innerHTML.replace(/\n/g, '<br>');
}

// ===== SEND AI MESSAGE =====
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const modelSelect = document.getElementById('modelSelect');

  if (!input) return;

  const message = input.value.trim();
  const model = modelSelect ? modelSelect.value : 'gemini';

  if (!message) return;

  addMessage(message, 'user');

  input.value = '';
  showTyping();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          model: model
        })
      }
    );

    hideTyping();

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      addMessage(
        `Sorry, I couldn't connect to the AI service. ${
          data.error || `Server returned ${response.status}.`
        }`,
        'bot'
      );

      return;
    }

    if (data.reply) {
      addMessage(data.reply, 'bot');
    } else {
      addMessage(
        'The AI service responded, but no reply was received.',
        'bot'
      );
    }

  } catch (error) {
    console.error('AI API error:', error);

    hideTyping();

    addMessage(
      'I’m having trouble connecting to the Aeterna AI service. Please try again in a moment.',
      'bot'
    );
  }
}

// ===== QUICK CHAT =====
function sendQuick(text) {
  const input = document.getElementById('chatInput');

  if (!input) return;

  input.value = text;
  sendMessage();
}

// ===== WATCH AI QUESTIONS =====
function askAboutWatch(watchName) {
  openChat();

  const input = document.getElementById('chatInput');

  if (!input) return;

  input.value =
    `Tell me everything about the ${watchName}. What are its key features and who is it best for?`;

  sendMessage();
}

// ===== QUICK BUY =====
function quickBuy(watchName, price) {
  showToast(
    `${watchName} added to cart! ($${price})`
  );
}

// ===== CONTACT FORM =====
function handleContact(e) {
  e.preventDefault();

  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value;

  console.log('Contact form:', {
    name,
    email,
    subject,
    message
  });

  showToast(
    'Message sent! We will get back to you shortly.'
  );

  document.getElementById('contactForm').reset();
}

// ===== TOAST =====
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavbar();
  initScrollAnimations();
  initHeroParallax();
  initTestimonials();
});
```

