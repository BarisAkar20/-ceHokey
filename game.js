const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const wrapper = document.getElementById('game-wrapper');
const menu = document.getElementById('menu');
const hud = document.getElementById('hud');
const countdownEl = document.getElementById('countdown');
const announceEl = document.getElementById('announce');
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const hudName1 = document.getElementById('hud-name1');
const hudName2 = document.getElementById('hud-name2');
const hudLogo1 = document.getElementById('hud-logo1');
const hudLogo2 = document.getElementById('hud-logo2');
const skills1El = document.getElementById('skills1');
const skills2El = document.getElementById('skills2');
const timerFill = document.getElementById('timer-fill');
const timerText = document.getElementById('timer-text');
const ultiFill1 = document.getElementById('ulti-fill1');
const ultiFill2 = document.getElementById('ulti-fill2');
const matchModeLabel = document.getElementById('match-mode-label');
const btnPlay = document.getElementById('btn-play');
const nameP1 = document.getElementById('name-p1');
const nameP2 = document.getElementById('name-p2');
const teamGrid = document.getElementById('team-grid');
const stadiumGrid = document.getElementById('stadium-grid');

const SUBSTEPS = 10;

const STATE = { MENU: 'menu', PLAYING: 'playing', GOAL: 'goal', COUNTDOWN: 'countdown', GAMEOVER: 'gameover' };

let W, H, GOAL_HEIGHT, PADDLE_R, PUCK_R, WALL_MARGIN, POWER_R;
let gameState = STATE.MENU;
let aiEnabled = false;
let scores = [0, 0];
let keys = {};
let lastFrame = 0;

let selectedTeams = [TEAMS[0], TEAMS[1]];
let selectedStadium = STADIUMS[0];
let activeTeamTab = 0;
let gameMode = '2p';
let selectedMatchMode = MATCH_MODES[0];
let playerNames = ['Oyuncu 1', 'Oyuncu 2'];

let matchEndTime = 0;
let matchStartTime = 0;
let matchDurationTotal = MATCH_DURATION_MS;
let lastPuckTouch = [0, 0];

let goalAnim = { scorer: 0, startTime: 0, flash: 0, isWinning: false };
let countdown = { value: 3, nextTick: 0 };
let gameOverInfo = { winner: '', startTime: 0 };

let powerUps = [];
let nextPowerSpawn = 0;
let announce = { text: '', until: 0 };
let fireworks = [];
let logoCache = {};
let stadiumLogoCache = {};
let puckTrail = [];
let ultiCharge = [0, 0];

let puck = { x: 0, y: 0, vx: 0, vy: 0, fireUntil: 0, iceUntil: 0 };
let paddles = [
  { x: 0, y: 0, vx: 0, vy: 0, prevX: 0, prevY: 0, effects: {}, skills: [] },
  { x: 0, y: 0, vx: 0, vy: 0, prevX: 0, prevY: 0, effects: {}, skills: [] },
];

function freshEffects() {
  return {
    powerShot: false, ultiShot: false, speedBoostUntil: 0, slowUntil: 0, giantUntil: 0,
    shield: false, freezeUntil: 0, magnetUntil: 0, doubleGoal: false,
  };
}

function initLogos() {
  TEAMS.forEach((t) => {
    const img = new Image();
    img.src = t.logo;
    logoCache[t.id] = img;
  });
  STADIUMS.forEach((s) => {
    const img = new Image();
    img.src = s.logo;
    stadiumLogoCache[s.id] = img;
  });
}

function buildMenu() {
  teamGrid.innerHTML = '';
  TEAMS.forEach((team, i) => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.dataset.id = team.id;
    card.innerHTML = `<img src="${team.logo}" alt="${team.name}"><span>${team.name}</span>`;
    card.addEventListener('click', () => selectTeam(i));
    teamGrid.appendChild(card);
  });

  stadiumGrid.innerHTML = '';
  STADIUMS.forEach((st, i) => {
    const card = document.createElement('div');
    card.className = 'stadium-card';
    card.dataset.id = st.id;
    card.style.color = st.accent;
    const grad = `linear-gradient(135deg, ${st.colors[0]}, ${st.colors[1]}, ${st.colors[2]})`;
    card.innerHTML = `
      <div class="st-bg" style="background:${grad}"></div>
      <img class="st-logo" src="${st.logo}" alt="${st.name}">
      <span class="st-type">${st.type}</span>
      <span class="st-name">${st.name}</span>
      <span class="st-club">${st.club}</span>
      <span class="st-meta">${st.city}</span>`;
    card.addEventListener('click', () => selectStadium(i));
    stadiumGrid.appendChild(card);
  });

  updateTeamCards();
  updateStadiumCards();

  document.querySelectorAll('.team-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      activeTeamTab = +tab.dataset.player;
      document.querySelectorAll('.team-tab').forEach((t) => t.classList.toggle('active', +t.dataset.player === activeTeamTab));
    });
  });

  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      gameMode = btn.dataset.mode;
      document.querySelectorAll('.mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === gameMode));
    });
  });

  const matchModeGrid = document.getElementById('match-mode-grid');
  matchModeGrid.innerHTML = '';
  MATCH_MODES.forEach((mode, i) => {
    const card = document.createElement('div');
    card.className = 'match-mode-card';
    card.dataset.id = mode.id;
    card.innerHTML = `
      <span class="mm-icon">${mode.icon}</span>
      <span class="mm-name">${mode.name}</span>
      <span class="mm-desc">${mode.desc}</span>`;
    card.addEventListener('click', () => selectMatchMode(i));
    matchModeGrid.appendChild(card);
  });
  updateMatchModeCards();
}

function selectMatchMode(index) {
  selectedMatchMode = MATCH_MODES[index];
  updateMatchModeCards();
}

function updateMatchModeCards() {
  document.querySelectorAll('.match-mode-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.id === selectedMatchMode.id);
  });
}

function selectTeam(index) {
  selectedTeams[activeTeamTab] = TEAMS[index];
  updateTeamCards();
}

function selectStadium(index) {
  selectedStadium = STADIUMS[index];
  updateStadiumCards();
}

function updateTeamCards() {
  document.querySelectorAll('.team-card').forEach((card) => {
    const id = card.dataset.id;
    card.classList.toggle('selected-p1', selectedTeams[0].id === id);
    card.classList.toggle('selected-p2', selectedTeams[1].id === id);
  });
}

function updateStadiumCards() {
  document.querySelectorAll('.stadium-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.id === selectedStadium.id);
  });
}

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  const scale = Math.min(W, H);
  GOAL_HEIGHT = H * 0.22;
  PADDLE_R = scale * 0.036;
  PUCK_R = PADDLE_R * 0.45;
  POWER_R = PADDLE_R * 0.85;
  WALL_MARGIN = 5;
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function getPaddleRadius(i) {
  return paddles[i].effects.giantUntil > performance.now() ? PADDLE_R * 1.4 : PADDLE_R;
}

function paddleBounds(i) {
  const r = getPaddleRadius(i);
  const minY = r + WALL_MARGIN;
  const maxY = H - r - WALL_MARGIN;
  if (i === 0) return { minX: r + 10, maxX: W / 2 - r - 6, minY, maxY };
  return { minX: W / 2 + r + 6, maxX: W - r - 10, minY, maxY };
}

function goalZone() {
  const half = GOAL_HEIGHT / 2;
  return { top: H / 2 - half, bottom: H / 2 + half };
}

function isFrozen(i) {
  return paddles[i].effects.freezeUntil > performance.now();
}

function paddleMaxSpeed(i) {
  if (isFrozen(i)) return 0;
  let s = H * PHYS.PADDLE_MAX_SPEED;
  const now = performance.now();
  if (paddles[i].effects.speedBoostUntil > now) s *= 1.35;
  const opp = 1 - i;
  if (paddles[opp].effects.slowUntil > now) s *= 0.5;
  return s;
}

function puckMaxSpeed() {
  const base = H * PHYS.PUCK_MAX_SPEED;
  return puck.fireUntil > performance.now() ? base * 1.35 : base;
}

function clampPuckSpeed() {
  const max = puckMaxSpeed();
  const sp = Math.hypot(puck.vx, puck.vy);
  if (sp > max) { puck.vx = (puck.vx / sp) * max; puck.vy = (puck.vy / sp) * max; }
}

function puckOverlapsPaddle() {
  for (let i = 0; i < 2; i++) {
    if (dist(puck.x, puck.y, paddles[i].x, paddles[i].y) < PUCK_R + getPaddleRadius(i) - 0.5) return true;
  }
  return false;
}

function resetPuck() {
  puck.x = W / 2; puck.y = H / 2;
  puck.vx = 0; puck.vy = 0;
  puck.fireUntil = 0; puck.iceUntil = 0;
  puckTrail = [];
}

function servePuck(server) {
  puck.x = W / 2;
  puck.y = H / 2 + (Math.random() - 0.5) * H * 0.06;
  const dir = server === 0 ? 1 : -1;
  const angle = (Math.random() - 0.5) * 0.45;
  const sp = H * PHYS.PUCK_MIN_SPEED * 2.8;
  puck.vx = Math.cos(angle) * sp * dir;
  puck.vy = Math.sin(angle) * sp;
  puck.fireUntil = 0; puck.iceUntil = 0;
  puckTrail = [];
}

function resetPaddlesPos() {
  paddles[0].x = W * 0.14; paddles[0].y = H / 2;
  paddles[1].x = W * 0.86; paddles[1].y = H / 2;
  ultiCharge = [0, 0];
  paddles.forEach((p) => {
    p.vx = 0; p.vy = 0;
    p.prevX = p.x; p.prevY = p.y;
    p.effects = freshEffects();
    p.skills = [];
  });
  updateUltiHUD();
}

function resetMatch() {
  scores = [0, 0];
  score1El.textContent = '0';
  score2El.textContent = '0';
  resetPaddlesPos();
  resetPuck();
  powerUps = [];
  fireworks = [];
  const now = performance.now();
  matchStartTime = now;
  matchDurationTotal = MATCH_DURATION_MS;
  matchEndTime = matchStartTime + matchDurationTotal;
  lastPuckTouch = [now, now];
  nextPowerSpawn = matchStartTime + 5000;
  gameState = STATE.PLAYING;
  countdownEl.classList.add('hidden');
  matchModeLabel.textContent = selectedMatchMode.name;
  updateSkillHUD();
  updateUltiHUD();
  updateTimer();
}

function showAnnounce(text, dur = 1500) {
  announce = { text, until: performance.now() + dur };
  announceEl.textContent = text;
  announceEl.classList.remove('hidden');
}

function hideAnnounce() {
  announceEl.classList.add('hidden');
}

function addSkillIcon(player, type) {
  paddles[player].skills.unshift({ id: type.id, icon: type.icon, color: type.color, until: performance.now() + 8000 });
  if (paddles[player].skills.length > 6) paddles[player].skills.pop();
  updateSkillHUD();
}

function updateUltiHUD() {
  [ultiFill1, ultiFill2].forEach((el, i) => {
    const pct = (ultiCharge[i] / PHYS.ULTI_MAX) * 100;
    el.style.width = pct + '%';
    el.classList.toggle('ready', ultiCharge[i] >= PHYS.ULTI_MAX && !paddles[i].effects.ultiShot);
    el.classList.toggle('armed', paddles[i].effects.ultiShot);
  });
}

function addUltiCharge(player, amount) {
  if (gameState !== STATE.PLAYING) return;
  ultiCharge[player] = clamp(ultiCharge[player] + amount, 0, PHYS.ULTI_MAX);
  updateUltiHUD();
}

function tryActivateUlti(player) {
  if (gameState !== STATE.PLAYING && gameState !== STATE.COUNTDOWN) return;
  if (ultiCharge[player] < PHYS.ULTI_MAX) return;
  if (paddles[player].effects.ultiShot) return;

  paddles[player].effects.ultiShot = true;
  ultiCharge[player] = 0;
  updateUltiHUD();
  showAnnounce(`${playerNames[player]}: ULTİ HAZIR!`, 1800);
}

function updateSkillHUD() {
  [skills1El, skills2El].forEach((el, i) => {
    el.innerHTML = '';
    const now = performance.now();
    paddles[i].skills = paddles[i].skills.filter((s) => s.until > now);
    paddles[i].skills.forEach((s) => {
      const d = document.createElement('div');
      d.className = 'skill-icon';
      d.style.borderColor = s.color + '88';
      d.style.background = s.color + '22';
      d.textContent = s.icon;
      d.title = POWER_TYPES.find((p) => p.id === s.id)?.label || '';
      el.appendChild(d);
    });
  });
}

function updateTimer() {
  const now = performance.now();
  const left = Math.max(0, matchEndTime - now);
  const pct = matchDurationTotal > 0 ? (left / matchDurationTotal) * 100 : 0;
  timerFill.style.width = pct + '%';
  timerFill.classList.toggle('low', pct < 20);
  const sec = Math.ceil(left / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  timerText.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  return left;
}

function updateTouchPenalty(now) {
  if (selectedMatchMode.id !== 'freezePenalty') return;
  if (gameState !== STATE.PLAYING) return;

  for (let i = 0; i < 2; i++) {
    if (isFrozen(i)) continue;
    const sinceTouch = now - lastPuckTouch[i];
    if (sinceTouch >= MATCH_RULES.TOUCH_LIMIT_MS) {
      paddles[i].effects.freezeUntil = now + MATCH_RULES.FREEZE_PENALTY_MS;
      lastPuckTouch[i] = now;
      showAnnounce(`${playerNames[i]}: Temas cezası! (${MATCH_RULES.FREEZE_PENALTY_MS / 1000}s)`, 2000);
    }
  }
}

function getGoalPoints(scorer) {
  let pts = 1;
  if (selectedMatchMode.id === 'doubleScore') pts = 2;
  if (paddles[scorer].effects.doubleGoal) {
    pts *= 2;
    paddles[scorer].effects.doubleGoal = false;
  }
  return pts;
}

function onGoalMatchBonus(scorer) {
  if (selectedMatchMode.id === 'overtime') {
    matchEndTime += MATCH_RULES.OVERTIME_BONUS_MS;
    matchDurationTotal += MATCH_RULES.OVERTIME_BONUS_MS;
    showAnnounce(`+${MATCH_RULES.OVERTIME_BONUS_MS / 1000} saniye eklendi!`, 1800);
  }
  const now = performance.now();
  lastPuckTouch[0] = now;
  lastPuckTouch[1] = now;
}

function updatePaddles(dt) {
  paddles.forEach((p, i) => { p.prevX = p.x; p.prevY = p.y; });

  const accel = H * PHYS.PADDLE_ACCEL;
  const damp = Math.exp(-PHYS.PADDLE_DAMPING * dt);

  function movePlayer(i, ax, ay) {
    if (isFrozen(i)) {
      paddles[i].vx *= 0.6;
      paddles[i].vy *= 0.6;
      return;
    }
    const maxSp = paddleMaxSpeed(i);
    paddles[i].vx += ax * accel * dt;
    paddles[i].vy += ay * accel * dt;
    paddles[i].vx *= damp;
    paddles[i].vy *= damp;
    const sp = Math.hypot(paddles[i].vx, paddles[i].vy);
    if (sp > maxSp) {
      paddles[i].vx = (paddles[i].vx / sp) * maxSp;
      paddles[i].vy = (paddles[i].vy / sp) * maxSp;
    }
    paddles[i].x += paddles[i].vx * dt;
    paddles[i].y += paddles[i].vy * dt;
    const b = paddleBounds(i);
    paddles[i].x = clamp(paddles[i].x, b.minX, b.maxX);
    paddles[i].y = clamp(paddles[i].y, b.minY, b.maxY);
    if (paddles[i].x <= b.minX || paddles[i].x >= b.maxX) paddles[i].vx *= -0.25;
    if (paddles[i].y <= b.minY || paddles[i].y >= b.maxY) paddles[i].vy *= -0.25;
  }

  let ax0 = 0, ay0 = 0;
  if (keys['w'] || keys['W']) ay0 -= 1;
  if (keys['s'] || keys['S']) ay0 += 1;
  if (keys['a'] || keys['A']) ax0 -= 1;
  if (keys['d'] || keys['D']) ax0 += 1;
  if (ax0 || ay0) { const l = Math.hypot(ax0, ay0); ax0 /= l; ay0 /= l; }
  movePlayer(0, ax0, ay0);

  if (aiEnabled) {
    const b1 = paddleBounds(1);
    const targetX = puck.x > W * 0.48 ? clamp(puck.x - W * 0.05, b1.minX, b1.maxX) : W * 0.86;
    const targetY = clamp(puck.y + puck.vy * 5, b1.minY, b1.maxY);
    const dx = targetX - paddles[1].x;
    const dy = targetY - paddles[1].y;
    const d = Math.hypot(dx, dy) || 1;
    movePlayer(1, dx / d, dy / d);
  } else {
    let ax1 = 0, ay1 = 0;
    if (keys['ArrowUp']) ay1 -= 1;
    if (keys['ArrowDown']) ay1 += 1;
    if (keys['ArrowLeft']) ax1 -= 1;
    if (keys['ArrowRight']) ax1 += 1;
    if (ax1 || ay1) { const l = Math.hypot(ax1, ay1); ax1 /= l; ay1 /= l; }
    movePlayer(1, ax1, ay1);
  }

  if (aiEnabled && ultiCharge[1] >= PHYS.ULTI_MAX && !paddles[1].effects.ultiShot && puck.x > W * 0.4) {
    tryActivateUlti(1);
  }

  const now = performance.now();
  for (let i = 0; i < 2; i++) {
    if (paddles[i].effects.magnetUntil > now) {
      const dx = paddles[i].x - puck.x;
      const dy = paddles[i].y - puck.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < W * 0.35) {
        const force = (1 - d / (W * 0.35)) * H * 0.55;
        puck.vx += (dx / d) * force * dt;
        puck.vy += (dy / d) * force * dt;
      }
    }
  }
}

function resolvePaddleHit(paddle, index) {
  const pr = getPaddleRadius(index);
  let dx = puck.x - paddle.x;
  let dy = puck.y - paddle.y;
  let d = Math.hypot(dx, dy);
  const minDist = PUCK_R + pr;
  if (d >= minDist) return;

  const pushDir = index === 0 ? 1 : -1;
  if (d < 0.001) { dx = pushDir; dy = 0; d = 1; }

  const nx = dx / d;
  const ny = dy / d;
  const overlap = minDist - d + 3;
  puck.x += nx * overlap;
  puck.y += ny * overlap;

  const pvx = paddle.vx;
  const pvy = paddle.vy;
  const rvx = puck.vx - pvx;
  const rvy = puck.vy - pvy;
  const relVelN = rvx * nx + rvy * ny;

  let restitution = PHYS.RESTITUTION;
  let ultiHit = false;

  if (paddles[index].effects.ultiShot) {
    restitution = PHYS.ULTI_RESTITUTION;
    paddles[index].effects.ultiShot = false;
    ultiHit = true;
    showAnnounce('ULTİ ŞUTU!');
  } else if (paddles[index].effects.powerShot) {
    restitution = PHYS.POWER_SHOT_RESTITUTION;
    paddles[index].effects.powerShot = false;
    showAnnounce('GÜÇ ŞUTU!');
  }
  if (puck.fireUntil > performance.now()) restitution *= 1.15;

  if (relVelN < 0) {
    const m1 = PHYS.PUCK_MASS;
    const m2 = PHYS.PADDLE_MASS;
    const impulse = -(1 + restitution) * relVelN / (1 / m1 + 1 / m2);
    puck.vx += (impulse * nx) / m1;
    puck.vy += (impulse * ny) / m1;
    puck.vx += pvx * 0.35;
    puck.vy += pvy * 0.35;
    if (ultiHit) {
      puck.vx *= 1.2;
      puck.vy *= 1.2;
    }
    const charge = PHYS.ULTI_CHARGE_PER_HIT + Math.min(Math.abs(relVelN) * 0.08, 10);
    addUltiCharge(index, charge);
    lastPuckTouch[index] = performance.now();
  }

  updateUltiHUD();

  const minExit = H * PHYS.PUCK_MIN_SPEED;
  if (puck.vx * pushDir < minExit) puck.vx = pushDir * minExit;
  clampPuckSpeed();
}

function resolveWalls() {
  const { top, bottom } = goalZone();
  const wb = PHYS.WALL_RESTITUTION;

  if (puck.y - PUCK_R < WALL_MARGIN) { puck.y = PUCK_R + WALL_MARGIN; puck.vy = Math.abs(puck.vy) * wb; }
  if (puck.y + PUCK_R > H - WALL_MARGIN) { puck.y = H - PUCK_R - WALL_MARGIN; puck.vy = -Math.abs(puck.vy) * wb; }

  if (puck.x - PUCK_R < 0) {
    if (puck.y > top && puck.y < bottom) return 'goal-right';
    puck.x = PUCK_R; puck.vx = Math.abs(puck.vx) * wb;
  }
  if (puck.x + PUCK_R > W) {
    if (puck.y > top && puck.y < bottom) return 'goal-left';
    puck.x = W - PUCK_R; puck.vx = -Math.abs(puck.vx) * wb;
  }
  return null;
}

function updatePuckPhysics(dt) {
  const step = dt / SUBSTEPS;
  const drag = Math.exp(-PHYS.PUCK_DRAG * step);
  const iceMul = puck.iceUntil > performance.now() ? 0.5 : 1;

  for (let s = 0; s < SUBSTEPS; s++) {
    puck.vx *= drag * iceMul;
    puck.vy *= drag * iceMul;
    puck.x += puck.vx * step;
    puck.y += puck.vy * step;

    const wall = resolveWalls();
    if (wall === 'goal-right') { triggerGoal(1); return; }
    if (wall === 'goal-left') { triggerGoal(0); return; }
    resolvePaddleHit(paddles[0], 0);
    resolvePaddleHit(paddles[1], 1);
  }

  if (!puckOverlapsPaddle()) {
    const sp = Math.hypot(puck.vx, puck.vy);
    const min = H * PHYS.PUCK_MIN_SPEED;
    if (sp > 0.01 && sp < min) { puck.vx = (puck.vx / sp) * min; puck.vy = (puck.vy / sp) * min; }
  }

  const sp = Math.hypot(puck.vx, puck.vy);
  if (sp > H * 0.08) {
    puckTrail.push({ x: puck.x, y: puck.y, alpha: 0.6, size: PUCK_R });
    if (puckTrail.length > 14) puckTrail.shift();
  }
  puckTrail.forEach((t) => { t.alpha *= 0.88; t.size *= 0.95; });
  puckTrail = puckTrail.filter((t) => t.alpha > 0.04);
}

function spawnFireworks(side) {
  const x = side === 0 ? W - 30 : 30;
  const { top, bottom } = goalZone();
  const cy = (top + bottom) / 2;
  const colors = [selectedTeams[side === 0 ? 0 : 1].color, selectedTeams[side === 0 ? 0 : 1].color2, '#ffd700', '#fff'];
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    fireworks.push({
      x, y: cy + (Math.random() - 0.5) * GOAL_HEIGHT * 0.6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      decay: 0.012 + Math.random() * 0.015,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 3,
    });
  }
}

function updateFireworks(dt) {
  fireworks = fireworks.filter((p) => {
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += 0.15 * dt * 60;
    p.life -= p.decay * dt * 60;
    return p.life > 0;
  });
}

function drawFireworks() {
  fireworks.forEach((p) => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function applyPower(player, type) {
  const now = performance.now();
  const opp = 1 - player;
  const name = playerNames[player];
  addSkillIcon(player, type);

  switch (type.id) {
    case 'fireball': puck.fireUntil = now + 6000; showAnnounce(`${name}: Ateş Topu!`); break;
    case 'powerShot': paddles[player].effects.powerShot = true; showAnnounce(`${name}: Güç Şutu!`); break;
    case 'slowEnemy': paddles[opp].effects.slowUntil = now + 5000; showAnnounce(`${name}: Rakip yavaşladı!`); break;
    case 'speedBoost': paddles[player].effects.speedBoostUntil = now + 5000; showAnnounce(`${name}: Hız artışı!`); break;
    case 'giant': paddles[player].effects.giantUntil = now + 6000; showAnnounce(`${name}: Dev raket!`); break;
    case 'shield': paddles[player].effects.shield = true; showAnnounce(`${name}: Kalkan aktif!`); break;
    case 'freeze': paddles[opp].effects.freezeUntil = now + 2500; showAnnounce(`${name}: Rakip dondu!`); break;
    case 'magnet': paddles[player].effects.magnetUntil = now + 4500; showAnnounce(`${name}: Mıknatıs!`); break;
    case 'doubleGoal': paddles[player].effects.doubleGoal = true; showAnnounce(`${name}: Çift gol!`); break;
    case 'icePuck': puck.iceUntil = now + 5000; showAnnounce(`${name}: Buz topu!`); break;
  }
}

function spawnPowerUp(now) {
  if (powerUps.length >= 2) return;
  const type = POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)];
  const margin = POWER_R + 50;
  const x = margin + Math.random() * (W - margin * 2);
  const y = margin + Math.random() * (H - margin * 2);
  powerUps.push({ x, y, type, born: now, bob: Math.random() * 6.28 });
}

function checkPowerCollect() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    let got = false;
    for (let j = 0; j < 2; j++) {
      if (dist(paddles[j].x, paddles[j].y, p.x, p.y) < getPaddleRadius(j) + POWER_R) {
        applyPower(j, p.type); got = true; break;
      }
    }
    if (!got && dist(puck.x, puck.y, p.x, p.y) < PUCK_R + POWER_R) {
      applyPower(puck.vx >= 0 ? 0 : 1, p.type); got = true;
    }
    if (got) powerUps.splice(i, 1);
  }
}

function updatePowerUps(now) {
  if (gameState !== STATE.PLAYING) return;
  if (now >= nextPowerSpawn) { spawnPowerUp(now); nextPowerSpawn = now + 6000 + Math.random() * 5000; }
  powerUps = powerUps.filter((p) => now - p.born < 12000);
  checkPowerCollect();
  updateSkillHUD();
}

function triggerGoal(scorer) {
  if (gameState !== STATE.PLAYING) return;

  const defender = 1 - scorer;
  if (paddles[defender].effects.shield) {
    paddles[defender].effects.shield = false;
    showAnnounce('Kalkan golü engelledi!');
    const touchNow = performance.now();
    lastPuckTouch = [touchNow, touchNow];
    servePuck(scorer);
    return;
  }

  gameState = STATE.GOAL;
  goalAnim.scorer = scorer;
  goalAnim.startTime = performance.now();
  goalAnim.flash = 1;
  powerUps = [];

  const pts = getGoalPoints(scorer);
  scores[scorer] += pts;
  score1El.textContent = scores[0];
  score2El.textContent = scores[1];

  onGoalMatchBonus(scorer);
  spawnFireworks(scorer === 0 ? 1 : 0);
}

function endMatchByTime() {
  gameState = STATE.GAMEOVER;
  let winner;
  if (scores[0] > scores[1]) winner = playerNames[0];
  else if (scores[1] > scores[0]) winner = playerNames[1];
  else winner = 'Berabere';
  gameOverInfo = { winner, startTime: performance.now() };
  setTimeout(() => showMenu(), 4000);
}

function updateGoalAnim(now, dt) {
  const elapsed = now - goalAnim.startTime;
  goalAnim.flash = Math.sin(elapsed * 0.012) * 0.5 + 0.5;
  const dir = goalAnim.scorer === 0 ? 1 : -1;
  puck.vx = dir * H * 0.025;
  puck.vy *= 0.92;
  puck.x += puck.vx * dt;
  puck.y += puck.vy * dt;
  updateFireworks(dt);
  if (elapsed > 2000) startCountdown(now);
}

function startCountdown(now) {
  gameState = STATE.COUNTDOWN;
  countdown.value = 3;
  countdown.nextTick = now;
  countdownEl.textContent = '3';
  countdownEl.classList.remove('hidden');
  resetPuck();
  fireworks = [];
}

function updateCountdown(now) {
  if (now - countdown.nextTick < 1000) return;
  countdown.value--;
  countdown.nextTick = now;
  if (countdown.value > 0) {
    countdownEl.textContent = String(countdown.value);
    countdownEl.style.animation = 'none'; countdownEl.offsetHeight; countdownEl.style.animation = '';
  } else if (countdown.value === 0) {
    countdownEl.textContent = 'BAŞLA!';
    countdownEl.style.animation = 'none'; countdownEl.offsetHeight; countdownEl.style.animation = '';
  } else {
    countdownEl.classList.add('hidden');
    gameState = STATE.PLAYING;
    servePuck(goalAnim.scorer === 0 ? 1 : 0);
    const touchNow = performance.now();
    lastPuckTouch = [touchNow, touchNow];
    nextPowerSpawn = now + 3000;
  }
}

function drawTable() {
  const st = selectedStadium;
  const grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, st.colors[0]);
  grd.addColorStop(0.5, st.colors[1]);
  grd.addColorStop(1, st.colors[2]);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  const crowdH = H * 0.08;
  const crowdGrd = ctx.createLinearGradient(0, 0, 0, crowdH);
  crowdGrd.addColorStop(0, 'rgba(0,0,0,0.55)');
  crowdGrd.addColorStop(1, 'transparent');
  ctx.fillStyle = crowdGrd;
  ctx.fillRect(0, 0, W, crowdH);
  ctx.fillStyle = crowdGrd;
  ctx.save();
  ctx.translate(0, H);
  ctx.scale(1, -1);
  ctx.fillRect(0, 0, W, crowdH);
  ctx.restore();

  ctx.fillStyle = st.line;
  ctx.fillRect(0, crowdH, W / 2, H - crowdH * 2);
  ctx.fillRect(W / 2, crowdH, W / 2, H - crowdH * 2);

  const iceGrd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.6);
  iceGrd.addColorStop(0, 'rgba(255,255,255,0.06)');
  iceGrd.addColorStop(1, 'transparent');
  ctx.fillStyle = iceGrd;
  ctx.fillRect(0, 0, W, H);

  const stLogo = stadiumLogoCache[st.id];
  if (stLogo && stLogo.complete && stLogo.naturalWidth) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    const aspect = stLogo.naturalWidth / stLogo.naturalHeight;
    let dw = W * 0.92;
    let dh = dw / aspect;
    if (dh > H * 0.88) { dh = H * 0.88; dw = dh * aspect; }
    ctx.drawImage(stLogo, (W - dw) / 2, (H - dh) / 2, dw, dh);
    ctx.restore();
  }

  ctx.strokeStyle = st.accent + '40';
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 10]);
  ctx.beginPath(); ctx.moveTo(W / 2, crowdH); ctx.lineTo(W / 2, H - crowdH); ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.055, 0, Math.PI * 2);
  ctx.strokeStyle = st.accent + '50';
  ctx.lineWidth = 2;
  ctx.stroke();

  const { top } = goalZone();
  const bw = Math.max(3, W * 0.004);
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, top, bw * 2.5, GOAL_HEIGHT);
  ctx.fillRect(W - bw * 2.5, top, bw * 2.5, GOAL_HEIGHT);

  if (gameState === STATE.GOAL) {
    const side = goalAnim.scorer === 0 ? W - bw * 2.5 : 0;
    ctx.fillStyle = `rgba(255,215,0,${goalAnim.flash * 0.55})`;
    ctx.fillRect(side, top, bw * 2.5, GOAL_HEIGHT);
  }

  ctx.strokeStyle = st.accent + '90';
  ctx.lineWidth = bw;
  const gb = top + GOAL_HEIGHT;
  [[0,0,0,top],[0,gb,0,H],[W,0,W,top],[W,gb,W,H],[0,0,W,0],[0,H,W,H]].forEach(([a,b,c,d]) => {
    ctx.beginPath(); ctx.moveTo(a,b); ctx.lineTo(c,d); ctx.stroke();
  });

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let i = 0; i < 8; i++) {
    const y = H * 0.15 + i * (H * 0.1);
    ctx.fillRect(W * 0.05, y, W * 0.9, 1);
  }
}

function drawPuckTrail() {
  puckTrail.forEach((t) => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${t.alpha * 0.35})`;
    ctx.fill();
  });
}

function drawPowerUps(now) {
  powerUps.forEach((p) => {
    const bob = Math.sin(now * 0.003 + p.bob) * 5;
    const y = p.y + bob;
    const pulse = 0.75 + Math.sin(now * 0.004 + p.bob) * 0.12;
    const r = POWER_R * pulse;
    ctx.save();
    ctx.beginPath(); ctx.arc(p.x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = p.type.color + '15';
    ctx.strokeStyle = p.type.color + '70';
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();
    ctx.font = `${r * 0.85}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.type.icon, p.x, y);
    ctx.restore();
  });
}

function drawPaddle(paddle, index) {
  const r = getPaddleRadius(index);
  const team = selectedTeams[index];
  const frozen = isFrozen(index);
  const now = performance.now();

  ctx.save();
  if (frozen) { ctx.globalAlpha = 0.6; ctx.shadowColor = '#88ddff'; }
  else ctx.shadowColor = team.color + '99';
  ctx.shadowBlur = 20;

  ctx.beginPath(); ctx.arc(paddle.x, paddle.y, r, 0, Math.PI * 2);
  ctx.fillStyle = team.color2 + 'cc';
  ctx.fill();
  ctx.shadowBlur = 0;

  const logo = logoCache[team.id];
  if (logo && logo.complete && logo.naturalWidth) {
    ctx.save();
    ctx.beginPath(); ctx.arc(paddle.x, paddle.y, r * 0.72, 0, Math.PI * 2); ctx.clip();
    const sz = r * 1.44;
    ctx.drawImage(logo, paddle.x - sz / 2, paddle.y - sz / 2, sz, sz);
    ctx.restore();
  }

  const speed = Math.hypot(paddle.vx, paddle.vy);
  if (speed > H * 0.15) {
    const angle = Math.atan2(paddle.vy, paddle.vx);
    ctx.strokeStyle = team.color + '55';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(paddle.x - Math.cos(angle) * (r + 8 * i), paddle.y - Math.sin(angle) * (r + 8 * i));
      ctx.lineTo(paddle.x - Math.cos(angle) * (r + 4 + 8 * i), paddle.y - Math.sin(angle) * (r + 4 + 8 * i));
      ctx.stroke();
    }
  }

  ctx.strokeStyle = team.color;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(paddle.x, paddle.y, r, 0, Math.PI * 2); ctx.stroke();

  if (paddle.effects.powerShot) {
    ctx.strokeStyle = '#ffdd00'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(paddle.x, paddle.y, r + 5, 0, Math.PI * 2); ctx.stroke();
  }
  if (paddle.effects.ultiShot) {
    const pulse = 1 + Math.sin(now * 0.012) * 0.12;
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4;
    ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.arc(paddle.x, paddle.y, (r + 10) * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(paddle.x, paddle.y, r + 6, 0, Math.PI * 2); ctx.stroke();
  }
  if (paddle.effects.shield) {
    ctx.strokeStyle = '#44aaff'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.arc(paddle.x, paddle.y, r + 8, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  if (paddle.effects.speedBoostUntil > now) {
    ctx.strokeStyle = '#00ffaa'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(paddle.x, paddle.y, r + 10, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawPuck(now) {
  const fire = puck.fireUntil > now;
  const ice = puck.iceUntil > now;
  ctx.save();
  if (fire) { ctx.shadowColor = '#ff5500'; ctx.shadowBlur = 25 + Math.sin(now * 0.02) * 10; }
  else if (ice) { ctx.shadowColor = '#88ddff'; ctx.shadowBlur = 18; }
  else { ctx.shadowColor = 'rgba(255,255,255,0.6)'; ctx.shadowBlur = 12; }

  ctx.beginPath(); ctx.arc(puck.x, puck.y, PUCK_R, 0, Math.PI * 2);
  const grd = ctx.createRadialGradient(puck.x - 2, puck.y - 2, 1, puck.x, puck.y, PUCK_R);
  if (fire) { grd.addColorStop(0, '#ffff88'); grd.addColorStop(0.5, '#ff6600'); grd.addColorStop(1, '#cc2200'); }
  else if (ice) { grd.addColorStop(0, '#eeffff'); grd.addColorStop(1, '#88ccff'); }
  else { grd.addColorStop(0, '#fff'); grd.addColorStop(1, '#bbb'); }
  ctx.fillStyle = grd; ctx.fill();
  ctx.restore();
}

function drawGoalOverlay() {
  const name = playerNames[goalAnim.scorer];
  const team = selectedTeams[goalAnim.scorer];
  const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.05;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${H * 0.1 * pulse}px Segoe UI, sans-serif`;
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = 'rgba(255,215,0,0.8)'; ctx.shadowBlur = 30;
  ctx.fillText('GOL!', W / 2, H / 2 - H * 0.05);
  ctx.shadowBlur = 0;
  ctx.font = `700 ${H * 0.035}px Segoe UI, sans-serif`;
  ctx.fillStyle = team.color;
  ctx.fillText(name, W / 2, H / 2 + H * 0.02);
  ctx.restore();
}

function drawGameOver() {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${H * 0.065}px Segoe UI, sans-serif`;
  ctx.fillStyle = '#ffd700';
  ctx.shadowColor = 'rgba(255,215,0,0.6)'; ctx.shadowBlur = 25;
  ctx.fillText(gameOverInfo.winner === 'Berabere' ? 'BERABERE!' : 'KAZANDI!', W / 2, H / 2 - H * 0.04);
  ctx.shadowBlur = 0;
  ctx.font = `600 ${H * 0.04}px Segoe UI, sans-serif`;
  ctx.fillStyle = '#fff';
  if (gameOverInfo.winner !== 'Berabere') ctx.fillText(gameOverInfo.winner, W / 2, H / 2 + H * 0.03);
  ctx.font = `400 ${H * 0.025}px Segoe UI, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`${scores[0]} - ${scores[1]}`, W / 2, H / 2 + H * 0.08);
  ctx.restore();
}

function draw(now) {
  drawTable();
  drawPowerUps(now);
  drawPuckTrail();
  drawPaddle(paddles[0], 0);
  drawPaddle(paddles[1], 1);
  drawPuck(now);
  drawFireworks();
  if (gameState === STATE.GOAL) drawGoalOverlay();
  if (gameState === STATE.GAMEOVER) drawGameOver();
  if (now < announce.until) { /* announce shown via DOM */ }
  else hideAnnounce();
}

function gameLoop(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  if (gameState === STATE.PLAYING) {
    updatePaddles(dt);
    updatePuckPhysics(dt);
    updatePowerUps(now);
    updateTouchPenalty(now);
    updateFireworks(dt);
    const left = updateTimer();
    if (left <= 0) endMatchByTime();
  } else if (gameState === STATE.GOAL) {
    updatePaddles(dt);
    updateGoalAnim(now, dt);
  } else if (gameState === STATE.COUNTDOWN) {
    updatePaddles(dt);
    updateCountdown(now);
    updateTimer();
  }

  draw(now);
  requestAnimationFrame(gameLoop);
}

async function enterFullscreen() {
  try { if (!document.fullscreenElement) await wrapper.requestFullscreen(); } catch {}
}

async function startGame() {
  playerNames = [
    nameP1.value.trim() || 'Oyuncu 1',
    nameP2.value.trim() || (gameMode === '1p' ? 'Yapay Zeka' : 'Oyuncu 2'),
  ];
  aiEnabled = gameMode === '1p';
  if (aiEnabled) playerNames[1] = selectedTeams[1].name + ' (YZ)';

  hudName1.textContent = playerNames[0];
  hudName2.textContent = playerNames[1];
  hudLogo1.src = selectedTeams[0].logo;
  hudLogo2.src = selectedTeams[1].logo;

  await enterFullscreen();
  menu.classList.add('hidden');
  hud.classList.remove('hidden');
  resetMatch();
  puckTrail = [];
  servePuck(Math.random() < 0.5 ? 0 : 1);
}

function showMenu() {
  gameState = STATE.MENU;
  menu.classList.remove('hidden');
  hud.classList.add('hidden');
  countdownEl.classList.add('hidden');
  hideAnnounce();
  powerUps = [];
  fireworks = [];
  if (document.fullscreenElement) document.exitFullscreen();
}

function isTyping() {
  const el = document.activeElement;
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

const GAME_KEYS = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','s','S','a','A','d','D','v','V','0']);

document.addEventListener('keydown', (e) => {
  if (isTyping()) return;
  if (e.repeat) return;
  if (e.key === 'v' || e.key === 'V') tryActivateUlti(0);
  if (e.key === '0' || e.code === 'Numpad0' || e.code === 'Digit0') tryActivateUlti(1);
  keys[e.key] = true;
  if (GAME_KEYS.has(e.key)) e.preventDefault();
  if (e.key === 'Escape' && gameState !== STATE.MENU) showMenu();
});
document.addEventListener('keyup', (e) => {
  if (isTyping()) return;
  keys[e.key] = false;
});
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && gameState !== STATE.MENU) showMenu();
});

btnPlay.addEventListener('click', startGame);

window.addEventListener('resize', () => {
  resize();
  for (let i = 0; i < 2; i++) {
    const b = paddleBounds(i);
    paddles[i].x = clamp(paddles[i].x, b.minX, b.maxX);
    paddles[i].y = clamp(paddles[i].y, b.minY, b.maxY);
  }
});

initLogos();
buildMenu();
resize();
resetPaddlesPos();
lastFrame = performance.now();
requestAnimationFrame(gameLoop);
