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
// 3. Christmas Falling Stars & Snow Animation Engine
// ==========================================================================
const snowCanvas = document.getElementById('snow-canvas');
let snowCtx = null;
let snowAnimationId = null;
let particles = [];
let backgroundStars = [];
let shootingStar = null;
let nextShootingStarTime = 0;

const FALLING_STAR_COUNT = 40;
const SNOWFLAKE_COUNT = 25;
const BG_TWINKLE_COUNT = 25;

function drawStarPolygon(ctx, cx, cy, spikes, outerRadius, innerRadius, angleOffset) {
  let rot = (Math.PI / 2 * 3) + angleOffset;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.closePath();
}

function initSnowCanvas() {
  if (!snowCanvas) return;
  snowCtx = snowCanvas.getContext('2d');
  resizeSnowCanvas();
  window.addEventListener('resize', resizeSnowCanvas);

  particles = [];
  backgroundStars = [];

  // 1. Falling Stars (Sparkling 4-point diamonds & 5-point Christmas stars)
  for (let i = 0; i < FALLING_STAR_COUNT; i++) {
    const isFivePoint = Math.random() > 0.6;
    particles.push({
      type: isFivePoint ? 'star5' : 'star4',
      x: Math.random() * snowCanvas.width,
      y: Math.random() * snowCanvas.height,
      radius: Math.random() * 4 + 3.5, // 3.5px to 7.5px outer radius
      innerRadiusRatio: isFivePoint ? 0.42 : 0.28,
      speedY: Math.random() * 1.3 + 0.7,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.025 + 0.015,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.035,
      baseOpacity: Math.random() * 0.4 + 0.6,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.06 + 0.03,
      // Golden, warm amber, and champagne hues
      hue: Math.random() > 0.35 ? 'gold' : (Math.random() > 0.5 ? 'white' : 'rose')
    });
  }

  // 2. Soft Falling Snowflakes for layered depth
  for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
    particles.push({
      type: 'snow',
      x: Math.random() * snowCanvas.width,
      y: Math.random() * snowCanvas.height,
      radius: Math.random() * 2.2 + 1.2,
      speedY: Math.random() * 1.2 + 0.6,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.02 + 0.01,
      baseOpacity: Math.random() * 0.5 + 0.4,
      twinklePhase: 0,
      twinkleSpeed: 0,
      rotation: 0,
      rotationSpeed: 0,
      hue: 'white'
    });
  }

  // 3. Static Twinkling Constellation Stars in the background
  for (let i = 0; i < BG_TWINKLE_COUNT; i++) {
    backgroundStars.push({
      x: Math.random() * snowCanvas.width,
      y: Math.random() * snowCanvas.height,
      radius: Math.random() * 1.6 + 0.8,
      baseOpacity: Math.random() * 0.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.04 + 0.02
    });
  }

  nextShootingStarTime = Date.now() + 1500;
}

function resizeSnowCanvas() {
  if (!snowCanvas) return;
  snowCanvas.width = window.innerWidth;
  snowCanvas.height = window.innerHeight;
}

function renderShootingStar() {
  const now = Date.now();
  if (!shootingStar && now >= nextShootingStarTime) {
    const startX = Math.random() * (snowCanvas.width * 0.7);
    const startY = Math.random() * (snowCanvas.height * 0.35);
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25; // ~45 deg diagonal
    const speed = Math.random() * 9 + 8;
    shootingStar = {
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: Math.random() * 80 + 75,
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 25 + 28
    };
  }

  if (shootingStar) {
    shootingStar.x += shootingStar.vx;
    shootingStar.y += shootingStar.vy;
    shootingStar.life++;
    shootingStar.opacity = Math.max(0, 1 - (shootingStar.life / shootingStar.maxLife));

    const tailX = shootingStar.x - (shootingStar.vx / 10) * shootingStar.length;
    const tailY = shootingStar.y - (shootingStar.vy / 10) * shootingStar.length;

    const grad = snowCtx.createLinearGradient(
      shootingStar.x, shootingStar.y,
      tailX, tailY
    );
    grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
    grad.addColorStop(0.25, `rgba(251, 191, 36, ${shootingStar.opacity * 0.85})`);
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)');

    snowCtx.save();
    snowCtx.strokeStyle = grad;
    snowCtx.lineWidth = 2.5;
    snowCtx.beginPath();
    snowCtx.moveTo(shootingStar.x, shootingStar.y);
    snowCtx.lineTo(tailX, tailY);
    snowCtx.stroke();

    // Glowing Star Head
    snowCtx.beginPath();
    snowCtx.arc(shootingStar.x, shootingStar.y, 2.5, 0, Math.PI * 2);
    snowCtx.fillStyle = `rgba(255, 255, 255, ${shootingStar.opacity})`;
    snowCtx.shadowColor = 'rgba(251, 191, 36, 1)';
    snowCtx.shadowBlur = 12;
    snowCtx.fill();
    snowCtx.restore();

    if (
      shootingStar.life >= shootingStar.maxLife ||
      shootingStar.x > snowCanvas.width + 60 ||
      shootingStar.y > snowCanvas.height + 60
    ) {
      shootingStar = null;
      nextShootingStarTime = Date.now() + Math.random() * 3200 + 2200;
    }
  }
}

function renderSnow() {
  if (!snowCtx || !snowCanvas) return;
  snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

  // 1. Draw static background twinkling stars
  for (let i = 0; i < backgroundStars.length; i++) {
    const bgStar = backgroundStars[i];
    bgStar.phase += bgStar.speed;
    const op = Math.max(0.1, bgStar.baseOpacity + Math.sin(bgStar.phase) * 0.35);

    snowCtx.save();
    drawStarPolygon(snowCtx, bgStar.x, bgStar.y, 4, bgStar.radius * 2, bgStar.radius * 0.5, 0);
    snowCtx.fillStyle = `rgba(254, 240, 138, ${op})`;
    snowCtx.shadowColor = 'rgba(251, 191, 36, 0.6)';
    snowCtx.shadowBlur = 6;
    snowCtx.fill();
    snowCtx.restore();
  }

  // 2. Draw shooting / wishing star if active
  renderShootingStar();

  // 3. Draw falling stars and snowflakes
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.swing += p.swingSpeed;
    p.y += p.speedY;
    p.x += Math.sin(p.swing) * 0.75;
    p.rotation += p.rotationSpeed;
    p.twinklePhase += p.twinkleSpeed;

    // Reset when off bottom or sides
    if (p.y > snowCanvas.height + 20) {
      p.y = -20;
      p.x = Math.random() * snowCanvas.width;
    }
    if (p.x > snowCanvas.width + 20) {
      p.x = -20;
    } else if (p.x < -20) {
      p.x = snowCanvas.width + 20;
    }

    const currentOpacity = Math.max(
      0.2,
      Math.min(1.0, p.baseOpacity + Math.sin(p.twinklePhase) * 0.35)
    );

    snowCtx.save();

    if (p.type === 'snow') {
      // Soft round snowflake
      snowCtx.beginPath();
      snowCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      snowCtx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
      snowCtx.shadowColor = 'rgba(255, 255, 255, 0.7)';
      snowCtx.shadowBlur = 5;
      snowCtx.fill();
    } else {
      // Falling Sparkling Star (4-point or 5-point)
      const spikes = p.type === 'star5' ? 5 : 4;
      const innerR = p.radius * p.innerRadiusRatio;

      drawStarPolygon(snowCtx, p.x, p.y, spikes, p.radius, innerR, p.rotation);

      if (p.hue === 'gold') {
        snowCtx.fillStyle = `rgba(251, 191, 36, ${currentOpacity})`;
        snowCtx.shadowColor = 'rgba(245, 158, 11, 0.9)';
      } else if (p.hue === 'rose') {
        snowCtx.fillStyle = `rgba(254, 205, 211, ${currentOpacity})`;
        snowCtx.shadowColor = 'rgba(239, 68, 68, 0.75)';
      } else {
        snowCtx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        snowCtx.shadowColor = 'rgba(254, 240, 138, 0.85)';
      }

      snowCtx.shadowBlur = 8;
      snowCtx.fill();
    }

    snowCtx.restore();
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
  shootingStar = null;
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
