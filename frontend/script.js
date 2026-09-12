// ============================================================
// AETERNA WATCHES - MAIN SCRIPT
// ============================================================

// Production backend deployed on Render
const API_BASE_URL = "https://aeterna-watches.onrender.com";


// ============================================================
// LOADER
// ============================================================

window.addEventListener("load", () => {
    setTimeout(() => {
        const loader = document.getElementById("loader");

        if (loader) {
            loader.classList.add("hidden");
        }
    }, 1500);
});


// ============================================================
// PARTICLES
// ============================================================

function initParticles() {
    const container = document.getElementById("particles");

    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");

        particle.className = "particle";

        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 15 + "s";
        particle.style.animationDuration =
            10 + Math.random() * 10 + "s";

        container.appendChild(particle);
    }
}


// ============================================================
// NAVBAR
// ============================================================

function initNavbar() {
    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    window.addEventListener("scroll", () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}


// ============================================================
// MOBILE MENU
// ============================================================

function toggleMobileMenu() {
    const menu = document.getElementById("mobileMenu");

    if (!menu) return;

    menu.classList.toggle("open");
}


// ============================================================
// SCROLL ANIMATIONS
// ============================================================

function initScrollAnimations() {
    if (!("IntersectionObserver" in window)) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");

                    if (
                        entry.target.classList.contains("stat")
                    ) {
                        const counter =
                            entry.target.querySelector(
                                ".stat-number"
                            );

                        animateCounter(counter);
                    }

                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15
        }
    );

    document
        .querySelectorAll(
            ".feature-card, .watch-card, .stat"
        )
        .forEach((element) => {
            observer.observe(element);
        });
}


// ============================================================
// COUNTER ANIMATION
// ============================================================

function animateCounter(element) {
    if (!element || element.dataset.animated) {
        return;
    }

    element.dataset.animated = "true";

    const target = parseInt(
        element.dataset.target,
        10
    );

    if (isNaN(target)) {
        return;
    }

    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;

        const progress = Math.min(
            elapsed / duration,
            1
        );

        const easeOut =
            1 - Math.pow(1 - progress, 3);

        const current = Math.floor(
            easeOut * target
        );

        element.textContent =
            current +
            (target === 99 ? "" : "+");

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}


// ============================================================
// HERO PARALLAX
// ============================================================

function initHeroParallax() {
    const watch =
        document.getElementById("heroWatch");

    // Hero watch was removed from the HTML.
    if (!watch) return;

    document.addEventListener("mousemove", (event) => {
        const x =
            (window.innerWidth / 2 - event.clientX) / 30;

        const y =
            (window.innerHeight / 2 - event.clientY) / 30;

        watch.style.transform =
            `translateY(${y}px) translateX(${x}px)`;
    });
}


// ============================================================
// SMOOTH SCROLL
// ============================================================

function scrollToCollection() {
    const collection =
        document.getElementById("collection");

    if (!collection) return;

    collection.scrollIntoView({
        behavior: "smooth"
    });
}


// ============================================================
// TESTIMONIALS
// ============================================================

function initTestimonials() {
    const testimonials =
        document.querySelectorAll(".testimonial");

    const dotsContainer =
        document.getElementById("testimonialDots");

    if (
        !dotsContainer ||
        testimonials.length === 0
    ) {
        return;
    }

    testimonials.forEach((_, index) => {
        const dot =
            document.createElement("div");

        dot.className =
            "testimonial-dot" +
            (index === 0 ? " active" : "");

        dot.addEventListener("click", () => {
            showTestimonial(index);
        });

        dotsContainer.appendChild(dot);
    });

    let current = 0;

    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.classList.remove("active");

            if (dotsContainer.children[i]) {
                dotsContainer.children[i]
                    .classList.remove("active");
            }
        });

        if (testimonials[index]) {
            testimonials[index]
                .classList.add("active");
        }

        if (dotsContainer.children[index]) {
            dotsContainer.children[index]
                .classList.add("active");
        }

        current = index;
    }

    setInterval(() => {
        current =
            (current + 1) %
            testimonials.length;

        showTestimonial(current);
    }, 5000);
}


// ============================================================
// AI CHAT - OPEN
// ============================================================

function openChat() {
    const widget =
        document.getElementById("chatWidget");

    const toggle =
        document.getElementById("chatToggle");

    const input =
        document.getElementById("chatInput");

    if (widget) {
        widget.classList.add("open");
    }

    if (toggle) {
        toggle.classList.add("hidden");
    }

    if (input) {
        setTimeout(() => {
            input.focus();
        }, 100);
    }
}


// ============================================================
// AI CHAT - CLOSE
// ============================================================

function closeChat() {
    const widget =
        document.getElementById("chatWidget");

    const toggle =
        document.getElementById("chatToggle");

    if (widget) {
        widget.classList.remove("open");
    }

    if (toggle) {
        toggle.classList.remove("hidden");
    }
}


// ============================================================
// ENTER KEY
// ============================================================

function handleKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(text) {
    const div =
        document.createElement("div");

    div.textContent = text ?? "";

    return div.innerHTML.replace(
        /\n/g,
        "<br>"
    );
}


// ============================================================
// ADD CHAT MESSAGE
// ============================================================

function addMessage(text, sender) {
    const container =
        document.getElementById("chatMessages");

    if (!container) return;

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        `message ${sender}`;

    messageDiv.innerHTML = `
        <div class="message-bubble">
            ${escapeHtml(text)}
        </div>
    `;

    container.appendChild(messageDiv);

    container.scrollTop =
        container.scrollHeight;
}


// ============================================================
// TYPING INDICATOR
// ============================================================

function showTyping() {
    const container =
        document.getElementById("chatMessages");

    if (!container) return;

    hideTyping();

    const typingDiv =
        document.createElement("div");

    typingDiv.className =
        "message bot typing";

    typingDiv.id =
        "typingIndicator";

    typingDiv.innerHTML = `
        <div class="message-bubble">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

    container.appendChild(typingDiv);

    container.scrollTop =
        container.scrollHeight;
}


// ============================================================
// HIDE TYPING
// ============================================================

function hideTyping() {
    const typing =
        document.getElementById(
            "typingIndicator"
        );

    if (typing) {
        typing.remove();
    }
}


// ============================================================
// SEND AI MESSAGE
// ============================================================

async function sendMessage() {
    const input =
        document.getElementById("chatInput");

    const modelSelect =
        document.getElementById("modelSelect");

    if (!input) return;

    const message =
        input.value.trim();

    // Normalize the dropdown's value so "Gemini"/"Groq"/stray spaces
    // still match the backend's exact 'gemini' / 'groq' checks.
    const model =
        modelSelect
            ? modelSelect.value.trim().toLowerCase()
            : "gemini";

    if (!message) return;

    // Display user's message
    addMessage(message, "user");

    // Clear input
    input.value = "";

    // Show loading
    showTyping();

    try {
        const response =
            await fetch(
                `${API_BASE_URL}/api/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
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
        } catch (jsonError) {
            data = {};
        }

        if (!response.ok) {
            addMessage(
                `Sorry, I couldn't connect to the AI service. ${
                    data.error ||
                    `Server returned ${response.status}.`
                }`,
                "bot"
            );

            return;
        }

        if (data.reply) {
            addMessage(
                data.reply,
                "bot"
            );
        } else {
            addMessage(
                "The AI service responded, but no reply was received.",
                "bot"
            );
        }

    } catch (error) {
        console.error(
            "AI API error:",
            error
        );

        hideTyping();

        addMessage(
            "I'm having trouble connecting to the Aeterna AI service. Please try again in a moment.",
            "bot"
        );
    }
}


// ============================================================
// QUICK CHAT
// ============================================================

function sendQuick(text) {
    const input =
        document.getElementById("chatInput");

    if (!input) return;

    input.value = text;

    sendMessage();
}


// ============================================================
// ASK ABOUT WATCH
// ============================================================

function askAboutWatch(watchName) {
    openChat();

    const input =
        document.getElementById("chatInput");

    if (!input) return;

    input.value =
        `Tell me everything about the ${watchName}. What are its key features and who is it best for?`;

    sendMessage();
}


// ============================================================
// QUICK BUY
// ============================================================

function quickBuy(watchName, price) {
    showToast(
        `${watchName} added to cart! ($${price})`
    );
}


// ============================================================
// CONTACT FORM
// ============================================================

function handleContact(event) {
    event.preventDefault();

    const name =
        document.getElementById(
            "contactName"
        )?.value || "";

    const email =
        document.getElementById(
            "contactEmail"
        )?.value || "";

    const subject =
        document.getElementById(
            "contactSubject"
        )?.value || "";

    const message =
        document.getElementById(
            "contactMessage"
        )?.value || "";

    console.log("Contact form:", {
        name,
        email,
        subject,
        message
    });

    showToast(
        "Message sent! We will get back to you shortly."
    );

    const form =
        document.getElementById(
            "contactForm"
        );

    if (form) {
        form.reset();
    }
}


// ============================================================
// TOAST
// ============================================================

function showToast(message) {
    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent =
        message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initParticles();
        initNavbar();
        initScrollAnimations();
        initHeroParallax();
        initTestimonials();

        console.log(
            "Aeterna frontend initialized successfully."
        );
    }
);
