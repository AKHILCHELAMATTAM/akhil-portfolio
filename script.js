// ==========================================================================
// 1. Smooth Scroll for Navigation Anchors
// ==========================================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// ==========================================================================
// 2. Web Audio API Sound Synthesizer (Pull Chain + Christmas Chimes)
// ==========================================================================
function playLampSound(targetTheme) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // 1. Metallic chain catch snap (high-frequency pop)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1600, now);
    snapOsc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
    snapGain.gain.setValueAtTime(0.35, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.05);

    // 2. Mechanical spring latch release (low-frequency clack)
    const latchOsc = ctx.createOscillator();
    const latchGain = ctx.createGain();
    latchOsc.type = 'sine';
    latchOsc.frequency.setValueAtTime(580, now + 0.035);
    latchOsc.frequency.exponentialRampToValueAtTime(160, now + 0.11);
    latchGain.gain.setValueAtTime(0, now);
    latchGain.gain.setValueAtTime(0.25, now + 0.035);
    latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    latchOsc.connect(latchGain);
    latchGain.connect(ctx.destination);
    latchOsc.start(now + 0.035);
    latchOsc.stop(now + 0.12);

    // 3. Magical Christmas chime when switching to Xmas mode
    if (targetTheme === 'xmas') {
      const bellPitches = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
      bellPitches.forEach((freq, i) => {
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(freq, now + 0.08 + i * 0.06);

        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.setValueAtTime(0.16, now + 0.08 + i * 0.06);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45 + i * 0.06);

        bellOsc.connect(bellGain);
        bellGain.connect(ctx.destination);

        bellOsc.start(now + 0.08 + i * 0.06);
        bellOsc.stop(now + 0.5 + i * 0.06);
      });
    }
  } catch (err) {
    // Graceful fallback if browser policies block audio
  }
}

// ==========================================================================
// 3. Christmas Falling Snow Animation Engine
// ==========================================================================
const snowCanvas = document.getElementById('snow-canvas');
let snowCtx = null;
let snowAnimationId = null;
let snowflakes = [];
const SNOWFLAKE_COUNT = 50;

function initSnowCanvas() {
  if (!snowCanvas) return;
  snowCtx = snowCanvas.getContext('2d');
  resizeSnowCanvas();
  window.addEventListener('resize', resizeSnowCanvas);

  snowflakes = [];
  for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
    snowflakes.push({
      x: Math.random() * snowCanvas.width,
      y: Math.random() * snowCanvas.height,
      radius: Math.random() * 2.8 + 1.2,
      density: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.02 + 0.01
    });
  }
}

function resizeSnowCanvas() {
  if (!snowCanvas) return;
  snowCanvas.width = window.innerWidth;
  snowCanvas.height = window.innerHeight;
}

function renderSnow() {
  if (!snowCtx || !snowCanvas) return;
  snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

  for (let i = 0; i < snowflakes.length; i++) {
    const flake = snowflakes[i];
    flake.swing += flake.swingSpeed;
    flake.y += flake.density * 1.2;
    flake.x += Math.sin(flake.swing) * 0.8;

    // Reset when off bottom or sides
    if (flake.y > snowCanvas.height + 10) {
      flake.y = -10;
      flake.x = Math.random() * snowCanvas.width;
    }
    if (flake.x > snowCanvas.width + 10) {
      flake.x = -10;
    } else if (flake.x < -10) {
      flake.x = snowCanvas.width + 10;
    }

    // Draw glowing snowflake particle
    snowCtx.beginPath();
    snowCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    snowCtx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
    snowCtx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    snowCtx.shadowBlur = 6;
    snowCtx.fill();
    snowCtx.shadowBlur = 0;
  }

  snowAnimationId = requestAnimationFrame(renderSnow);
}

function startSnow() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  if (!snowCtx) {
    initSnowCanvas();
  }
  if (!snowAnimationId) {
    renderSnow();
  }
}

function stopSnow() {
  if (snowAnimationId) {
    cancelAnimationFrame(snowAnimationId);
    snowAnimationId = null;
  }
  if (snowCtx && snowCanvas) {
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
  }
}

// ==========================================================================
// 4. Lamp Theme Switcher Controller
// ==========================================================================
const THEMES = ['dark', 'light', 'xmas'];

const THEME_INFO = {
  dark: {
    name: 'Dark Mode',
    icon: '🌙',
    hint: 'Pull thread for Light ☀️',
    colorScheme: 'dark',
    ariaLabel: 'Pull lamp cord to change theme. Current theme: Dark Mode.'
  },
  light: {
    name: 'Light Mode',
    icon: '☀️',
    hint: 'Pull thread for Xmas 🎄',
    colorScheme: 'light',
    ariaLabel: 'Pull lamp cord to change theme. Current theme: Light Mode.'
  },
  xmas: {
    name: 'Xmas Beauty',
    icon: '🎄',
    hint: 'Pull thread for Dark 🌙',
    colorScheme: 'dark',
    ariaLabel: 'Pull lamp cord to change theme. Current theme: Xmas Beauty Theme.'
  }
};

const lampCordWrapper = document.getElementById('lamp-cord-wrapper');
const lampCordLine = document.getElementById('lamp-cord-line');
const lampPullHandle = document.getElementById('lamp-pull-handle');
const lampShadeWrapper = document.querySelector('.lamp-shade-wrapper');
const lampTooltip = document.getElementById('lamp-tooltip');
const themeIconEl = document.getElementById('theme-icon');
const themeNameEl = document.getElementById('theme-name');
const themeHintEl = document.getElementById('theme-hint');

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function getNextTheme(current) {
  const idx = THEMES.indexOf(current);
  return THEMES[(idx + 1) % THEMES.length];
}

function updateThemeUI(theme) {
  const info = THEME_INFO[theme] || THEME_INFO.dark;

  document.documentElement.setAttribute('data-theme', theme);

  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) {
    metaColorScheme.content = info.colorScheme;
  }

  if (themeIconEl) themeIconEl.textContent = info.icon;
  if (themeNameEl) themeNameEl.textContent = info.name;
  if (themeHintEl) themeHintEl.textContent = info.hint;
  if (lampPullHandle) lampPullHandle.setAttribute('aria-label', info.ariaLabel);

  if (theme === 'xmas') {
    startSnow();
  } else {
    stopSnow();
  }
}

function applyTheme(targetTheme, withSound = true) {
  try {
    localStorage.setItem('portfolio-theme', targetTheme);
  } catch (e) {}

  updateThemeUI(targetTheme);

  if (withSound) {
    playLampSound(targetTheme);
  }
}

// Mechanical Pull Action with Spring Animation
let isPullAnimating = false;

function triggerCordPull() {
  if (isPullAnimating) return;
  isPullAnimating = true;

  const currentTheme = getCurrentTheme();
  const nextTheme = getNextTheme(currentTheme);

  // 1. Pull down animation
  if (lampCordWrapper) {
    lampCordWrapper.classList.remove('pulled-release');
    lampCordWrapper.classList.add('pulling');
  }
  if (lampShadeWrapper) {
    lampShadeWrapper.classList.add('lamp-tug');
  }

  // 2. Play sound immediately on tension
  playLampSound(nextTheme);

  // 3. Switch theme and release bounce
  setTimeout(() => {
    applyTheme(nextTheme, false);

    if (lampCordWrapper) {
      lampCordWrapper.classList.remove('pulling');
      lampCordWrapper.classList.add('pulled-release');
    }
  }, 140);

  // 4. Reset animation lock after elastic bounce completes
  setTimeout(() => {
    if (lampCordWrapper) {
      lampCordWrapper.classList.remove('pulled-release');
    }
    if (lampShadeWrapper) {
      lampShadeWrapper.classList.remove('lamp-tug');
    }
    isPullAnimating = false;
  }, 750);
}

// ==========================================================================
// 5. Interactive Touch / Mouse Drag Physics on Pull Cord
// ==========================================================================
let startY = 0;
let isDragging = false;
let currentPullDelta = 0;
let dragStartTime = 0;

if (lampPullHandle) {
  // Click & Keyboard (Enter / Space) support
  lampPullHandle.addEventListener('click', e => {
    e.preventDefault();
    triggerCordPull();
  });

  lampPullHandle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerCordPull();
    }
  });

  // Pointer Drag Interaction
  lampPullHandle.addEventListener('pointerdown', e => {
    if (isPullAnimating) return;
    isDragging = true;
    startY = e.clientY;
    currentPullDelta = 0;
    dragStartTime = Date.now();
    lampPullHandle.setPointerCapture(e.pointerId);
    if (lampCordWrapper) {
      lampCordWrapper.style.transition = 'none';
    }
  });

  lampPullHandle.addEventListener('pointermove', e => {
    if (!isDragging || !lampCordWrapper) return;
    const dy = e.clientY - startY;
    if (dy > 0) {
      currentPullDelta = Math.min(dy * 0.75, 45); // Elastic damping limit
      lampCordWrapper.style.transform = `translateY(${currentPullDelta}px)`;
      if (lampCordLine) {
        const scale = 1 + (currentPullDelta / 85) * 0.4;
        lampCordLine.style.transform = `scaleY(${scale})`;
      }
    }
  });

  const finishDrag = e => {
    if (!isDragging) return;
    isDragging = false;
    try {
      lampPullHandle.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (lampCordWrapper) {
      lampCordWrapper.style.transition = '';
      lampCordWrapper.style.transform = '';
    }
    if (lampCordLine) {
      lampCordLine.style.transform = '';
    }

    const elapsed = Date.now() - dragStartTime;
    // Trigger if dragged downwards > 18px or quick tap
    if (currentPullDelta > 18 || (currentPullDelta < 4 && elapsed < 350)) {
      triggerCordPull();
    }
    currentPullDelta = 0;
  };

  lampPullHandle.addEventListener('pointerup', finishDrag);
  lampPullHandle.addEventListener('pointercancel', finishDrag);
}

// Click on Tooltip also triggers pull
if (lampTooltip) {
  lampTooltip.addEventListener('click', e => {
    e.preventDefault();
    triggerCordPull();
  });
}

// ==========================================================================
// 6. Initialize Theme State on Page Load
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const initialTheme = getCurrentTheme();
  updateThemeUI(initialTheme);
});
