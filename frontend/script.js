// ===== AETERNA WATCH BRAND - MAIN SCRIPT =====
const API_BASE_URL = 'http://localhost:3001';

// ===== LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
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
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
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
  }, { threshold: 0.15 });

  document.querySelectorAll('.feature-card, .watch-card, .stat').forEach(el => {
    observer.observe(el);
  });
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
function initHeroParallax() {
  const watch = document.getElementById('heroWatch');
  if (!watch) return;

  document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 30;
    const y = (window.innerHeight / 2 - e.clientY) / 30;
    watch.style.transform = `translateY(${y}px) translateX(${x}px)`;
  });
}

// ===== SMOOTH SCROLL =====
function scrollToCollection() {
  document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
}

// ===== TESTIMONIALS SLIDER =====
function initTestimonials() {
  const testimonials = document.querySelectorAll('.testimonial');
  const dotsContainer = document.getElementById('testimonialDots');
  if (!dotsContainer || testimonials.length === 0) return;

  testimonials.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => showTestimonial(i);
    dotsContainer.appendChild(dot);
  });

  let current = 0;

  function showTestimonial(index) {
    testimonials.forEach((t, i) => {
      t.classList.remove('active');
      dotsContainer.children[i].classList.remove('active');
    });
    testimonials[index].classList.add('active');
    dotsContainer.children[index].classList.add('active');
    current = index;
  }

  setInterval(() => {
    current = (current + 1) % testimonials.length;
    showTestimonial(current);
  }, 5000);
}

// ===== AI CHAT WIDGET =====
function openChat() {
  document.getElementById('chatWidget').classList.add('open');
  document.getElementById('chatToggle').classList.add('hidden');
  document.getElementById('chatInput').focus();
}

function closeChat() {
  document.getElementById('chatWidget').classList.remove('open');
  document.getElementById('chatToggle').classList.remove('hidden');
}

function handleKeyPress(event) {
  if (event.key === 'Enter') sendMessage();
}

function addMessage(text, sender) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  msgDiv.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chatMessages');
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
  if (typing) typing.remove();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  const model = document.getElementById('modelSelect').value;

  if (!message) return;

  addMessage(message, 'user');
  input.value = '';
  showTyping();

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, model })
    });

    hideTyping();

    if (!response.ok) {
      const error = await response.json();
      addMessage(`Sorry, I couldn't connect: ${error.error || 'Service unavailable'}`, 'bot');
      return;
    }

    const data = await response.json();
    addMessage(data.reply, 'bot');

  } catch (error) {
    hideTyping();
    addMessage("I'm having trouble connecting to the AI service. Please make sure the backend is running on port 3001, or try again later.", 'bot');
  }
}

function sendQuick(text) {
  document.getElementById('chatInput').value = text;
  sendMessage();
}

function askAboutWatch(watchName) {
  openChat();
  document.getElementById('chatInput').value = `Tell me everything about the ${watchName}. What are its key features and who is it best for?`;
  sendMessage();
}

function quickBuy(watchName, price) {
  showToast(`${watchName} added to cart! ($${price})`);
}

// ===== CONTACT FORM =====
function handleContact(e) {
  e.preventDefault();

  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value;

  // In production, send this to your backend
  console.log('Contact form:', { name, email, subject, message });

  showToast('Message sent! We will reply to Aeternapk.gmail.com shortly.');
  document.getElementById('contactForm').reset();
}

// ===== TOAST =====
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
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
