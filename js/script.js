/**
 * ============================================================================
 * MOHSINA'S BIRTHDAY EXPERIENCE - DYNAMIC MULTI-SCREEN SPA ARCHITECTURE
 * ============================================================================
 * 
 * Only ONE screen exists in the DOM at any given time.
 * Progression flow:
 * Screen 1 (Birthday) -> Screen 2 (Cake Password) -> Screen 3 (Cake Cutting)
 *   -> Screen 4 (Memories) -> Screen 5 (Letter Password) -> Screen 6 (Secret Letter)
 */

/* ==========================================================================
   1. SINGLE SOURCE OF TRUTH CONFIGURATION
   ========================================================================== */
const birthdayConfig = {
    // Recipient Details
    name: "Dear Bonny Begum",
    heroDateText: "Mosina 's Birthday ✨",

    // Screen 2: Cake Password Gate
    cakePassword: "9334736912",
    cakePasswordHint: "Hint: It's someone phone number you will never forget 💕 ",

    // Screen 5: Secret Letter Password Gate (Separate from cake)
    letterPassword: "Aishwarya",
    letterPasswordHint: "Hint: Only you know this special secret who is your Best friend ❤️",

    // Persistent Audio Assets
    backgroundMusic: "music/MainMus.mp3",
    cakeCutSound: "music/cake-cutting.mp3",
    letterOpenSound: "music/letter-open.mp3",

    // Media
    heroImage: "images/sm.jpeg",
    envelopeBackground: "images/envelope-background.jpg",

    // Screen 4: Exactly 6 Data-Driven Memories
    memories: [
        {
            id: 1,
            number: "01 / 06",
            title: "The Beginning of Our Story",
            images: [
                "images/m4.jpg",
                "images/p4.png"
            ],
            description: "Thankyou to Simmi that she introduce me with you then we are enjoy our friendship together. Because of her, I found a beautiful friendship filled with laughter, warmth, and unforgettable memories."
        },
        {
            id: 2,
            number: "02 / 06",
            title: "Unforgettable Smiles & Laughs",
            images: [
                "images/m3.jpeg",
                "images/Np3.png"
            ],
            description: "You are very close to his heart. He called you  BETICHOD it mean Beautiful Girl and He is your Chinnarr (Good boy)."
        },
        {
            id: 3,
            number: "03 / 06",
            title: "Similar Personality",
            images: [
                "images/af.jpeg",
                "images/aman.png"
            ],
            description: "You two are exactly alike—even your thinking is the same. Both of you are always hitting on girls! 😂  Hindi me usko maha Chinaar bolte hain MAALIKK"
        },
        {
            id: 4,
            number: "04 / 06",
            title: "Favorite person,Ice Cream",
            images: [
                "images/p6.png",
                "images/nanhe (2).png"

            ],
            description: "You liked his story(CHANAAR BAIL WALA) too, and you also liked this Julu Bar ice cream, right? ❤️."
        },
        {
            id: 5,
            number: "05 / 06",
            title: "Pookieee ",
            images: [
                "images/mm5.jpeg",
                "images/p5.png"
            ],
            description: "Everytime calls you by your other name like Maaisaa, mashiaa Bhabhi because he can’t remember your names, but it’s actually quite cute and adorable. ❤️."
        },
        {
            id: 6,
            number: "06 / 06",
            title: "A Bond For A Lifetime Bestfriend",
            images: [
                "images/mm7.jpg",
                "images/nikhil.png"
            ],
            description: "Some people touch your life and stay forever. You are more than a friend; you are truly family, and one of the greatest blessings I'll always cherish. Happy Birthday Maalik"
        }
    ],

    // Screen 6: Secret Letter Content (Handwritten typography)
    secretMessage: `Dear Mosina,

Happy Birthday MARDDD brings so much genuine warmth, grace, and joy into this world! 💖

From the day you became a part of my life, you've held a deeply cherished place in my heart. Through all the smiles, the quiet moments, and the challenges you've faced with such strength, I want you to know how deeply you are loved, valued, and respected.

I wish I could take away any sorrow or heaviness you ever have to bear alone. Please remember that you always have an open door and a listening ear here—anytime, for anything you feel like sharing.

May this new year of your life be filled with gentle peace, vibrant health, endless laughter, and the fulfillment of every dream you whisper into the universe.

Keep shining brightly, Mosina! 🎂✨

With lots of love and best wishes,
Always by your side ❤️`
};

/* ==========================================================================
   2. STATE MACHINE & SCREEN ENUM
   ========================================================================== */
const APP_STATES = {
    BIRTHDAY: "birthday",
    CAKE_PASSWORD: "cake-password",
    CAKE: "cake",
    MEMORIES: "memories",
    LETTER_PASSWORD: "letter-password",
    LETTER: "letter"
};

let currentState = null;
let isTransitioning = false;

/* ==========================================================================
   3. PERSISTENT AUDIO ARCHITECTURE
   ========================================================================== */
let backgroundMusic = null;
let cakeCutSound = null;
let letterOpenSound = null;
let hasStartedMusic = false;
let userManuallyMuted = false;

function initAudio() {
    if (backgroundMusic) return;

    try {
        backgroundMusic = new Audio(birthdayConfig.backgroundMusic);
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.5;

        cakeCutSound = new Audio(birthdayConfig.cakeCutSound);
        cakeCutSound.volume = 0.65;

        letterOpenSound = new Audio(birthdayConfig.letterOpenSound);
        letterOpenSound.volume = 0.65;

        backgroundMusic.addEventListener("play", () => updateMusicButtonUI(true));
        backgroundMusic.addEventListener("pause", () => {
            if (currentState !== APP_STATES.CAKE) {
                updateMusicButtonUI(false);
            }
        });
        backgroundMusic.addEventListener("error", () => {
            console.info("Notice: Background music loading handled gracefully.");
        });
    } catch (e) {
        console.warn("Audio initialization notice:", e);
    }
}

function startMusic() {
    if (hasStartedMusic || userManuallyMuted) return;
    initAudio();

    if (backgroundMusic) {
        backgroundMusic.play().then(() => {
            hasStartedMusic = true;
            updateMusicButtonUI(true);
        }).catch(() => {
            // If browser blocks unprompted autoplay, keep UI active and play on first touch/click
            updateMusicButtonUI(true);
        });
    }
}

function updateMusicButtonUI(isPlaying) {
    const musicBtn = document.getElementById("music-toggle-btn");
    const musicIcon = document.getElementById("music-icon");
    const musicLabel = document.getElementById("music-label");
    if (!musicBtn || !musicIcon) return;

    if (isPlaying) {
        musicBtn.classList.add("playing");
        musicBtn.setAttribute("aria-label", "Pause background music");
        musicIcon.className = "fa-solid fa-volume-high";
        if (musicLabel) musicLabel.textContent = "Music On";
    } else {
        musicBtn.classList.remove("playing");
        musicBtn.setAttribute("aria-label", "Play background music");
        musicIcon.className = "fa-solid fa-volume-xmark";
        if (musicLabel) musicLabel.textContent = "Music Muted";
    }
}

function toggleMusicPlayback() {
    initAudio();
    if (!backgroundMusic) return;

    if (backgroundMusic.paused) {
        userManuallyMuted = false;
        backgroundMusic.play().then(() => {
            hasStartedMusic = true;
            updateMusicButtonUI(true);
        }).catch(() => {});
    } else {
        userManuallyMuted = true;
        backgroundMusic.pause();
        updateMusicButtonUI(false);
    }
}

/* ==========================================================================
   4. CENTRAL SCREEN TRANSITION SYSTEM
   ========================================================================== */
function transitionTo(nextState, pushHistory = true) {
    if (isTransitioning) return;
    if (currentState === nextState) return;

    isTransitioning = true;
    const app = document.getElementById("app");
    const currentScreen = app.firstElementChild;

    // Phase 1: Animate & Unmount Current Screen
    if (currentScreen) {
        currentScreen.classList.remove("screen-enter-active");
        currentScreen.classList.add("screen-exit");

        setTimeout(() => {
            app.innerHTML = "";
            mountNewScreen(nextState);
        }, 380);
    } else {
        mountNewScreen(nextState);
    }

    if (pushHistory) {
        history.pushState({ screen: nextState }, "", "#" + nextState);
    }
}

function mountNewScreen(nextState) {
    const app = document.getElementById("app");
    currentState = nextState;
    document.body.setAttribute("data-state", currentState);

    // Render screen element
    let screenElement;
    switch (nextState) {
        case APP_STATES.BIRTHDAY:
            screenElement = createBirthdayScreen();
            break;
        case APP_STATES.CAKE_PASSWORD:
            screenElement = createCakePasswordScreen();
            break;
        case APP_STATES.CAKE:
            screenElement = createCakeScreen();
            break;
        case APP_STATES.MEMORIES:
            screenElement = createMemoriesScreen();
            break;
        case APP_STATES.LETTER_PASSWORD:
            screenElement = createLetterPasswordScreen();
            break;
        case APP_STATES.LETTER:
            screenElement = createLetterScreen();
            break;
        default:
            screenElement = createBirthdayScreen();
    }

    app.appendChild(screenElement);

    // Phase 2: Enter Transition
    requestAnimationFrame(() => {
        screenElement.classList.add("screen-enter-active");
        isTransitioning = false;
    });

    // Scroll to top of viewport cleanly
    window.scrollTo({ top: 0, behavior: "instant" });
}

/* ==========================================================================
   5. SCREEN 1: BIRTHDAY INTRODUCTION
   ========================================================================== */
function createBirthdayScreen() {
    const container = document.createElement("section");
    container.className = "screen-container screen-birthday";

    container.innerHTML = `
        <div class="flag__birthday">
            <img src="./images/1.png" alt="Birthday Garland" width="350" class="flag__left">
            <img src="./images/1.png" alt="Birthday Garland" width="350" class="flag__right">
        </div>

        <div class="content">
            <div class="left">
                <div class="title">
                    <h1 class="happy">
                        <span style="--t: 0.2s;">H</span>
                        <span style="--t: 0.3s;">a</span>
                        <span style="--t: 0.4s;">p</span>
                        <span style="--t: 0.5s;">p</span>
                        <span style="--t: 0.6s;">y</span>
                    </h1>
                    <h1 class="birthday">
                        <span style="--t: 0.7s;">B</span>
                        <span style="--t: 0.8s;">i</span>
                        <span style="--t: 0.9s;">r</span>
                        <span style="--t: 1.0s;">t</span>
                        <span style="--t: 1.1s;">h</span>
                        <span style="--t: 1.2s;">d</span>
                        <span style="--t: 1.3s;">a</span>
                        <span style="--t: 1.4s;">y</span>
                    </h1>
                    <div class="hat">
                        <img src="./images/hat.png" alt="Birthday Hat" width="130">
                    </div>
                </div>

                <div class="date__of__birth">
                    <span></span>
                </div>

                <p class="hero-intro-msg">
                    Today is all about celebrating you, your smile, and all the happiness you bring into our lives. 💕
                </p>

                <div class="hero-cta-wrapper">
                    <button type="button" id="btn-start-journey" class="premium-btn start-journey-btn">
                        <span>Begin the Celebration</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            <div class="right">
                <div class="box__account">
                    <div class="image">
                        <img id="hero-main-photo" src="${birthdayConfig.heroImage}" alt="${birthdayConfig.name}">
                    </div>
                    <div class="name">
                        <i class="fa-solid fa-heart"></i>
                        <span>${birthdayConfig.name} 💖</span>
                        <i class="fa-solid fa-heart"></i>
                    </div>
                    <div class="balloon_one">
                        <img width="100px" src="./images/balloon1.png" alt="Balloon">
                    </div>
                    <div class="balloon_two">
                        <img width="100px" src="./images/balloon2.png" alt="Balloon">
                    </div>
                </div>

                <div class="cricle">
                    <div class="text__cricle">
                        <span style="--i: 1;">h</span>
                        <span style="--i: 2;">a</span>
                        <span style="--i: 3;">p</span>
                        <span style="--i: 4;">p</span>
                        <span style="--i: 5;">y</span>
                        <span style="--i: 6;">-</span>
                        <span style="--i: 7;">b</span>
                        <span style="--i: 8;">i</span>
                        <span style="--i: 9;">r</span>
                        <span style="--i: 10;">t</span>
                        <span style="--i: 11;">h</span>
                        <span style="--i: 12;">d</span>
                        <span style="--i: 13;">a</span>
                        <span style="--i: 14;">y</span>
                        <span style="--i: 15;">-</span>
                    </div>
                    <i class="fa-solid fa-heart"></i>
                </div>
            </div>
        </div>

        <div class="decorate_star star1" style="--t: 1.0s;"></div>
        <div class="decorate_star star2" style="--t: 1.2s;"></div>
        <div class="decorate_star star3" style="--t: 1.4s;"></div>
        <div class="decorate_star star4" style="--t: 1.6s;"></div>
        <div class="decorate_star star5" style="--t: 1.8s;"></div>
        <div class="decorate_flower--one" style="--t: 1.2s;">
            <img width="20" src="./images/decorate_flower.png" alt="Flower">
        </div>
        <div class="decorate_flower--two" style="--t: 1.5s;">
            <img width="20" src="./images/decorate_flower.png" alt="Flower">
        </div>
        <div class="decorate_flower--three" style="--t: 1.8s;">
            <img width="20" src="./images/decorate_flower.png" alt="Flower">
        </div>
        <div class="decorate_bottom">
            <img src="./images/decorate.png" alt="Banner" width="100">
        </div>
        <div class="smiley__icon">
            <img src="./images/smiley_icon.png" alt="Smiley" width="100">
        </div>
    `;

    // Type date text
    const dateSpan = container.querySelector(".date__of__birth span");
    if (dateSpan) {
        const textToType = birthdayConfig.heroDateText || "Mosina's Birthday";
        let charIndex = 0;
        setTimeout(() => {
            const typer = setInterval(() => {
                if (charIndex < textToType.length) {
                    dateSpan.textContent += textToType[charIndex];
                    charIndex++;
                } else {
                    clearInterval(typer);
                    const s1 = document.createElement("i");
                    s1.className = "fa-solid fa-star";
                    const s2 = s1.cloneNode(true);
                    const box = container.querySelector(".date__of__birth");
                    if (box) {
                        box.prepend(s1);
                        box.appendChild(s2);
                    }
                }
            }, 75);
        }, 1000);
    }

    // CTA Event: Transition to Screen 2
    const startBtn = container.querySelector("#btn-start-journey");
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            startMusic();
            transitionTo(APP_STATES.CAKE_PASSWORD);
        });
    }

    return container;
}

/* ==========================================================================
   6. SCREEN 2: CAKE PASSWORD GATE
   ========================================================================== */
function createCakePasswordScreen() {
    const container = document.createElement("section");
    container.className = "screen-container screen-gate";

    container.innerHTML = `
        <div class="section-card gate-card">
            <div class="gate-icon-badge">
                <i class="fa-solid fa-cake-candles"></i>
            </div>
            <span class="section-badge"><i class="fa-solid fa-lock"></i> Stage 01 of 03</span>
            <h2 class="gate-title">Special  Cake is Waiting for you...</h2>
            <p class="gate-subtitle">Enter the secret password to reveal your birthday cake</p>

            <form id="cake-password-form" class="gate-form" onsubmit="return false;">
                <div class="input-group">
                    <span class="input-icon"><i class="fa-solid fa-key"></i></span>
                    <input type="password" id="cake-password-input" class="gate-input" placeholder="Enter cake password..." autocomplete="off" aria-label="Cake Password">
                </div>
                <button type="submit" id="cake-unlock-btn" class="premium-btn unlock-btn">
                    <span>Open the Cake Box</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>

            <p class="gate-hint">${birthdayConfig.cakePasswordHint}</p>
            <div id="cake-password-message" class="password-feedback" aria-live="polite"></div>
        </div>
    `;

    const form = container.querySelector("#cake-password-form");
    const input = container.querySelector("#cake-password-input");
    const msg = container.querySelector("#cake-password-message");
    const btn = container.querySelector("#cake-unlock-btn");

    function validate() {
        const val = input.value.trim();
        if (val.toLowerCase() === birthdayConfig.cakePassword.toLowerCase()) {
            input.classList.remove("input-error");
            input.classList.add("input-success");
            input.disabled = true;
            btn.disabled = true;

            msg.className = "password-feedback success-msg";
            msg.innerHTML = '<i class="fa-solid fa-circle-check"></i> Password Correct ✓ Revealing Cake...';
            triggerSparkles(btn);

            setTimeout(() => {
                transitionTo(APP_STATES.CAKE);
            }, 600);
        } else {
            input.classList.remove("input-error");
            void input.offsetWidth;
            input.classList.add("input-error");

            msg.className = "password-feedback error-msg";
            msg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Incorrect Password 💔 Try again.';
            msg.setAttribute("aria-live", "assertive");
        }
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        validate();
    });

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        validate();
    });

    // Auto-focus input after entrance
    setTimeout(() => {
        if (input) input.focus();
    }, 450);

    return container;
}

/* ==========================================================================
   7. SCREEN 3: CAKE CUTTING EXPERIENCE
   ========================================================================== */
function createCakeScreen() {
    const container = document.createElement("section");
    container.className = "screen-container screen-cake-arena";

    container.innerHTML = `
        <div class="section-card cake-arena-card">
            <div class="cake-sparkles-container"></div>

            <div class="cake-header-info">
                <span class="section-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> Celebration Time</span>
                <h2 class="gate-title">Birthday Cake 🎂</h2>
                <p class="gate-subtitle">Let's Cut the cake and make a special wish</p>
            </div>

            <div class="cinematic-cake-wrapper">
                <div class="cake-knife">
                    <div class="knife-blade"></div>
                    <div class="knife-handle"></div>
                </div>
                <div class="cake-stand">
                    <div class="stand-plate"></div>
                    <div class="stand-base"></div>
                </div>
                <div class="cake-tiers">
                    <div class="candle-wrapper">
                        <div class="candle-stick"></div>
                        <div class="candle-flame"></div>
                    </div>
                    <div class="cake-tier top-tier">
                        <div class="tier-frosting"></div>
                        <div class="cake-berries">
                            <span>🍓</span><span>🍒</span><span>🍓</span>
                        </div>
                    </div>
                    <div class="cake-tier bottom-tier">
                        <div class="tier-drips"></div>
                        <div class="cake-pearls">
                            <span></span><span></span><span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div id="cake-celebration-message" class="celebration-message">
                <h3>Make a Wish, Maalik! 🎂💖</h3>
                <p class="celebration-sub">May all your sweetest dreams come true!</p>
            </div>

            <div class="cake-action-wrap">
                <button type="button" id="btn-cut-cake" class="premium-btn cta-cut-btn">
                    <span class="btn-sparkle">✨</span>
                    <span>🎂 Shall be Cut the Cake</span>
                    <span class="btn-sparkle">✨</span>
                </button>
            </div>
        </div>
    `;

    const cutBtn = container.querySelector("#btn-cut-cake");
    const knife = container.querySelector(".cake-knife");
    const cakeTiers = container.querySelector(".cake-tiers");
    const flame = container.querySelector(".candle-flame");
    const celebMsg = container.querySelector("#cake-celebration-message");
    const sparklesLayer = container.querySelector(".cake-sparkles-container");

    cutBtn.addEventListener("click", () => {
        cutBtn.disabled = true;
        cutBtn.style.opacity = "0";
        cutBtn.style.pointerEvents = "none";

        // 1. Immediately pause background music without resetting currentTime!
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
        updateMusicButtonUI(false);

        // 2. Play cake cutting sound independently
        if (cakeCutSound) {
            try {
                cakeCutSound.currentTime = 0;
                cakeCutSound.play().catch(() => {});
            } catch (e) {}
        }

        // 3. Cinematic animation sequence
        if (flame) flame.classList.add("flame-glow");

        setTimeout(() => {
            if (knife) knife.classList.add("knife-enter");
        }, 800);

        setTimeout(() => {
            if (knife) knife.classList.add("knife-cut");
        }, 1800);

        setTimeout(() => {
            if (cakeTiers) cakeTiers.classList.add("cake-split");
            if (sparklesLayer) {
                sparklesLayer.classList.add("sparkles-active");
                triggerCakeConfetti();
            }
        }, 2600);

        setTimeout(() => {
            if (celebMsg) celebMsg.classList.add("message-visible");
        }, 3200);

        // 4. Cake Completion: Resume background music & transition to Memories
        setTimeout(() => {
            if (backgroundMusic && !userManuallyMuted) {
                backgroundMusic.play().then(() => {
                    updateMusicButtonUI(true);
                }).catch(() => {});
            }

            setTimeout(() => {
                transitionTo(APP_STATES.MEMORIES);
            }, 1200);
        }, 4400);
    });

    return container;
}

/* ==========================================================================
   8. SCREEN 4: 6 MEMORY EXPERIENCE
   ========================================================================== */
let memoryScreenIndex = 0;
const memoryVisits = new Set([0]);

function createMemoriesScreen() {
    const container = document.createElement("section");
    container.className = "screen-container screen-memories";

    container.innerHTML = `
        <div class="section-card memories-card">
            <div class="memories-header">
                <span class="section-badge"><i class="fa-solid fa-heart"></i> Stage 02 of 03</span>
                <h2 class="memories-main-title">Your Beautiful Memories</h2>
                <p class="memories-subtitle">Some moments become memories, and some memories become forever. ❤️</p>
            </div>

            <div class="memory-progress-wrapper">
                <div class="memory-progress-bar">
                    <div id="memory-progress-fill" class="progress-fill" style="width: 16.66%;"></div>
                </div>
                <div class="memory-header-info">
                    <span id="memory-counter" class="memory-counter">01 / 06</span>
                    <div id="memory-indicators" class="memory-dots" role="tablist"></div>
                </div>
            </div>

            <div class="memory-showcase">
                <div id="memory-gallery" class="memory-gallery gallery-count-2"></div>
                <div class="memory-content-box">
                    <h3 id="memory-title" class="memory-card-title"></h3>
                    <p id="memory-desc" class="memory-card-desc"></p>
                </div>
            </div>

            <div class="memory-nav-controls">
                <button type="button" id="memory-prev-btn" class="nav-btn prev-btn" aria-label="Previous Memory" disabled>
                    <i class="fa-solid fa-arrow-left"></i> Previous
                </button>
                <button type="button" id="memory-next-btn" class="nav-btn next-btn" aria-label="Next Memory">
                    Next Memory <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>

            <div id="memories-completion-banner" class="completion-banner hidden">
                <div class="banner-content">
                    <div class="banner-icon">💌</div>
                    <div class="banner-text">
                        <h4>All 6 Memories Experienced!</h4>
                        <p>You've unlocked one final surprise... 💌</p>
                    </div>
                </div>
                <button type="button" id="btn-proceed-letter" class="premium-btn letter-cta-btn">
                    <span>Unlock Secret Letter</span>
                    <i class="fa-solid fa-envelope-open-text"></i>
                </button>
            </div>
        </div>
    `;

    const counterEl = container.querySelector("#memory-counter");
    const titleEl = container.querySelector("#memory-title");
    const descEl = container.querySelector("#memory-desc");
    const galleryEl = container.querySelector("#memory-gallery");
    const progressFill = container.querySelector("#memory-progress-fill");
    const dotsWrap = container.querySelector("#memory-indicators");
    const prevBtn = container.querySelector("#memory-prev-btn");
    const nextBtn = container.querySelector("#memory-next-btn");
    const completionBanner = container.querySelector("#memories-completion-banner");
    const proceedBtn = container.querySelector("#btn-proceed-letter");

    // Build indicator dots
    birthdayConfig.memories.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `indicator-dot ${idx === 0 ? "active" : ""}`;
        dot.setAttribute("aria-label", `View memory ${idx + 1}`);
        dot.addEventListener("click", () => updateActiveMemory(idx));
        dotsWrap.appendChild(dot);
    });

    function updateActiveMemory(idx) {
        if (idx < 0 || idx >= birthdayConfig.memories.length) return;
        memoryScreenIndex = idx;
        memoryVisits.add(idx);

        const memory = birthdayConfig.memories[memoryScreenIndex];

        // Animate showcase transition
        galleryEl.style.opacity = "0";
        titleEl.style.opacity = "0";
        descEl.style.opacity = "0";

        setTimeout(() => {
            counterEl.textContent = memory.number;
            titleEl.textContent = memory.title;
            descEl.textContent = memory.description;

            galleryEl.innerHTML = "";
            galleryEl.className = `memory-gallery gallery-count-${memory.images.length}`;

            memory.images.forEach((src, imgIdx) => {
                const box = document.createElement("div");
                box.className = "memory-img-box";

                const img = document.createElement("img");
                img.src = src;
                img.alt = `${memory.title} photo ${imgIdx + 1}`;
                img.loading = "lazy";
                img.onerror = function() {
                    this.src = birthdayConfig.heroImage;
                };

                box.appendChild(img);
                galleryEl.appendChild(box);
            });

            // Smooth fade-in
            galleryEl.style.opacity = "1";
            titleEl.style.opacity = "1";
            descEl.style.opacity = "1";
        }, 180);

        // Progress
        const percent = (memoryVisits.size / birthdayConfig.memories.length) * 100;
        progressFill.style.width = `${percent}%`;

        // Update dots
        dotsWrap.querySelectorAll(".indicator-dot").forEach((dot, dotIdx) => {
            dot.classList.toggle("active", dotIdx === memoryScreenIndex);
            dot.classList.toggle("completed", memoryVisits.has(dotIdx));
        });

        // Prev/Next buttons
        prevBtn.disabled = (memoryScreenIndex === 0);
        if (memoryScreenIndex === birthdayConfig.memories.length - 1) {
            nextBtn.innerHTML = 'All Completed <i class="fa-solid fa-check"></i>';
        } else {
            nextBtn.innerHTML = 'Next Memory <i class="fa-solid fa-arrow-right"></i>';
        }

        // Check if all 6 memories have been experienced
        if (memoryVisits.size === birthdayConfig.memories.length) {
            if (completionBanner.classList.contains("hidden")) {
                completionBanner.classList.remove("hidden");
                completionBanner.classList.add("revealed");
            }
        }
    }

    prevBtn.addEventListener("click", () => {
        if (memoryScreenIndex > 0) updateActiveMemory(memoryScreenIndex - 1);
    });

    nextBtn.addEventListener("click", () => {
        if (memoryScreenIndex < birthdayConfig.memories.length - 1) {
            updateActiveMemory(memoryScreenIndex + 1);
        }
    });

    proceedBtn.addEventListener("click", () => {
        transitionTo(APP_STATES.LETTER_PASSWORD);
    });

    // Mount initial memory
    updateActiveMemory(memoryScreenIndex);

    return container;
}

/* ==========================================================================
   9. SCREEN 5: SECRET LETTER PASSWORD GATE
   ========================================================================== */
function createLetterPasswordScreen() {
    const container = document.createElement("section");
    container.className = "screen-container screen-gate";

    container.innerHTML = `
        <div class="section-card gate-card">
            <div class="gate-icon-badge">
                <i class="fa-solid fa-envelope"></i>
            </div>
            <span class="section-badge"><i class="fa-solid fa-key"></i> Final Stage 03</span>
            <h2 class="gate-title">A Secret Letter For You</h2>
            <p class="gate-subtitle">This letter is only for you. Enter the secret password to open it.</p>

            <form id="letter-password-form" class="gate-form" onsubmit="return false;">
                <div class="input-group">
                    <span class="input-icon"><i class="fa-solid fa-key"></i></span>
                    <input type="password" id="letter-password-input" class="gate-input" placeholder="Enter secret password..." autocomplete="off" aria-label="Secret Letter Password">
                </div>
                <button type="submit" id="letter-unlock-btn" class="premium-btn unlock-btn">
                    <span>Unlock Letter</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>

            <p class="gate-hint">${birthdayConfig.letterPasswordHint}</p>
            <div id="letter-password-message" class="password-feedback" aria-live="polite"></div>
        </div>
    `;

    const form = container.querySelector("#letter-password-form");
    const input = container.querySelector("#letter-password-input");
    const msg = container.querySelector("#letter-password-message");
    const btn = container.querySelector("#letter-unlock-btn");

    function validate() {
        const val = input.value.trim();
        if (val.toLowerCase() === birthdayConfig.letterPassword.toLowerCase()) {
            input.classList.remove("input-error");
            input.classList.add("input-success");
            input.disabled = true;
            btn.disabled = true;

            msg.className = "password-feedback success-msg";
            msg.innerHTML = '<i class="fa-solid fa-heart"></i> Secret Unlocked 💕 Opening letter...';
            triggerSparkles(btn);

            setTimeout(() => {
                transitionTo(APP_STATES.LETTER);
            }, 600);
        } else {
            input.classList.remove("input-error");
            void input.offsetWidth;
            input.classList.add("input-error");

            msg.className = "password-feedback error-msg";
            msg.innerHTML = '<i class="fa-solid fa-heart-crack"></i> Incorrect Password 💔 Try again.';
            msg.setAttribute("aria-live", "assertive");
        }
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        validate();
    });

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        validate();
    });

    setTimeout(() => {
        if (input) input.focus();
    }, 450);

    return container;
}

/* ==========================================================================
   10. SCREEN 6: SECRET LETTER & 3D ENVELOPE
   ========================================================================== */
function createLetterScreen() {
    const container = document.createElement("section");
    container.className = "screen-container screen-letter";

    container.innerHTML = `
        <div class="section-card letter-section-card">
            <div class="letter-hearts-particles"></div>

            <div class="letter-screen-header">
                <span class="section-badge"><i class="fa-solid fa-heart"></i> Final Surprise</span>
                <h2 class="gate-title">A Special Letter For you 💖</h2>
                <p class="gate-subtitle">Written with love and warmth on your special day</p>
            </div>

            <!-- Layered 3D Envelope -->
            <div id="interactive-envelope" class="interactive-envelope" style="--envelope-bg-url: url('${birthdayConfig.envelopeBackground}')">
                <div class="envelope-back"></div>
                <div class="letter-paper">
                    <div class="letter-header">
                        <span class="letter-stamp">💌</span>
                        <span class="letter-date">A Special Note for you Maalik</span>
                    </div>
                    <div id="letter-message-body" class="letter-message">${birthdayConfig.secretMessage}</div>
                    <div class="letter-signature-decor">
                        <i class="fa-solid fa-heart"></i>
                    </div>
                </div>
                <div class="envelope-left"></div>
                <div class="envelope-right"></div>
                <div class="envelope-bottom"></div>
                <div class="envelope-top-flap"></div>
                <div class="envelope-seal">
                    <i class="fa-solid fa-heart"></i>
                </div>
            </div>

            <div class="letter-screen-footer">
                <button type="button" id="btn-replay-journey" class="nav-btn replay-btn">
                    <i class="fa-solid fa-rotate-left"></i> Replay Celebration
                </button>
            </div>
        </div>
    `;

    const envelope = container.querySelector("#interactive-envelope");
    const replayBtn = container.querySelector("#btn-replay-journey");

    // Run opening sequence
    setTimeout(() => {
        if (letterOpenSound) {
            try {
                letterOpenSound.currentTime = 0;
                letterOpenSound.play().catch(() => {});
            } catch (e) {}
        }

        // Flap open
        envelope.classList.add("flap-open");

        // Slide upward
        setTimeout(() => {
            envelope.classList.add("letter-sliding");
        }, 700);

        // Expand letter into full readable view
        setTimeout(() => {
            envelope.classList.add("letter-expanded");
            triggerLetterConfetti();
        }, 1600);
    }, 450);

    replayBtn.addEventListener("click", () => {
        memoryVisits.clear();
        memoryVisits.add(0);
        memoryScreenIndex = 0;
        transitionTo(APP_STATES.BIRTHDAY);
    });

    return container;
}

/* ==========================================================================
   11. CONFETTI & SPARKLE MICRO-INTERACTIONS
   ========================================================================== */
function triggerCakeConfetti() {
    const colors = ["#F59E0B", "#D97706", "#EC4899", "#F472B6", "#10B981", "#3B82F6"];
    createFloatingParticles(".cake-sparkles-container", 35, colors);
}

function triggerLetterConfetti() {
    const colors = ["#EC4899", "#F472B6", "#F59E0B", "#D97706", "#EF4444"];
    createFloatingParticles(".letter-hearts-particles", 28, colors, true);
}

function createFloatingParticles(selector, count, colors, isHearts = false) {
    const container = document.querySelector(selector);
    if (!container) return;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement("span");
        particle.className = isHearts ? "floating-particle heart-shape" : "floating-particle star-shape";

        const size = Math.random() * 12 + 8;
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = Math.random() * 2 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
        `;

        if (isHearts) {
            particle.innerHTML = "❤️";
            particle.style.background = "transparent";
            particle.style.fontSize = `${size}px`;
        }

        container.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, (duration + delay) * 1000);
    }
}

function triggerSparkles(targetElement) {
    if (!targetElement) return;
    const colors = ["#F59E0B", "#D97706", "#10B981"];
    const rect = targetElement.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
        const spark = document.createElement("div");
        spark.className = "mini-sparkle";
        spark.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: ${colors[i % colors.length]};
            pointer-events: none;
            z-index: 9999;
            transform: translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 60}px);
            opacity: 0;
            transition: all 0.6s ease-out;
        `;
        document.body.appendChild(spark);
        requestAnimationFrame(() => {
            spark.style.opacity = "1";
            spark.style.transform = `translate(${(Math.random() - 0.5) * 180}px, ${(Math.random() - 0.5) * 120}px) scale(0)`;
        });
        setTimeout(() => spark.remove(), 600);
    }
}

/* ==========================================================================
   12. APPLICATION INITIALIZATION & HISTORY NAVIGATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize audio and start music by default
    initAudio();
    startMusic();
    updateMusicButtonUI(true);

    // 2. Floating music button listener
    const musicBtn = document.getElementById("music-toggle-btn");
    if (musicBtn) {
        musicBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMusicPlayback();
        });
    }

    // 2. First user interaction audio unlock
    const handleFirstGesture = () => {
        startMusic();
        window.removeEventListener("click", handleFirstGesture);
        window.removeEventListener("keydown", handleFirstGesture);
        window.removeEventListener("touchstart", handleFirstGesture);
    };
    window.addEventListener("click", handleFirstGesture, { once: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });

    // 3. Browser Back/Forward navigation with History API
    window.addEventListener("popstate", (e) => {
        if (e.state && e.state.screen) {
            transitionTo(e.state.screen, false);
        } else {
            transitionTo(APP_STATES.BIRTHDAY, false);
        }
    });

    // 4. Initial Mount: Always reset to Screen 1 (Birthday Home Page) at top of page
    if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    transitionTo(APP_STATES.BIRTHDAY, false);
});

// Prevent browser from restoring previous scroll position on refresh
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
});
