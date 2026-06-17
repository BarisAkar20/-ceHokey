const TEAMS = [
  {
    id: 'gs', name: 'Galatasaray', league: 'Süper Lig',
    color: '#FDB912', color2: '#E30613',
    logo: 'assets/teams/gs.png',
  },
  {
    id: 'fb', name: 'Fenerbahçe', league: 'Süper Lig',
    color: '#FFED00', color2: '#00205B',
    logo: "assets/teams/2'nci.jpg",
  },
  {
    id: 'bjk', name: 'Beşiktaş', league: 'Süper Lig',
    color: '#FFFFFF', color2: '#000000',
    logo: 'assets/teams/bjk.jpg',
  },
  {
    id: 'ts', name: 'Trabzonspor', league: 'Süper Lig',
    color: '#7B003A', color2: '#00A0D2',
    logo: 'assets/teams/sampiyon.jpg',
  },
  {
    id: 'bas', name: 'Başakşehir', league: 'Süper Lig',
    color: '#F58220', color2: '#1D1D1B',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Istanbul_Basaksehir_FK_logo.svg/200px-Istanbul_Basaksehir_FK_logo.svg.png',
  },
  {
    id: 'ant', name: 'Antalyaspor', league: 'Süper Lig',
    color: '#E30613', color2: '#FFFFFF',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Antalyaspor_logo.svg/200px-Antalyaspor_logo.svg.png',
  },
  {
    id: 'sam', name: 'Samsunspor', league: 'Süper Lig',
    color: '#E30613', color2: '#FFFFFF',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Samsunspor_logo.svg/200px-Samsunspor_logo.svg.png',
  },
  {
    id: 'kon', name: 'Konyaspor', league: 'Süper Lig',
    color: '#007A3D', color2: '#FFFFFF',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Konyaspor_1922_logo.svg/200px-Konyaspor_1922_logo.svg.png',
  },
  {
    id: 'gaz', name: 'Gaziantep FK', league: 'Süper Lig',
    color: '#E30613', color2: '#000000',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Gaziantepspor_logo.svg/200px-Gaziantepspor_logo.svg.png',
  },
  {
    id: 'kas', name: 'Kasımpaşa', league: 'Süper Lig',
    color: '#0054A6', color2: '#FFFFFF',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Kasimpasa_2012_logo.svg/200px-Kasimpasa_2012_logo.svg.png',
  },
];

const STADIUMS = [
  {
    id: 'rams', name: 'Rams Park', city: 'İstanbul', club: 'Galatasaray', type: 'Futbol',
    teamId: 'gs',
    logo: 'assets/stadiums/ramspark.jpg',
    colors: ['#1a0808', '#2d1010', '#4a1818'], accent: '#FDB912', line: 'rgba(253,185,18,0.2)',
  },
  {
    id: 'chobani', name: 'Chobani Stadyumu', city: 'İstanbul', club: 'Fenerbahçe', type: 'Futbol',
    teamId: 'fb',
    logo: 'assets/stadiums/saraogluyeni.jpg',
    colors: ['#000d33', '#001a4d', '#002870'], accent: '#FFED00', line: 'rgba(255,237,0,0.18)',
  },
  {
    id: 'vodafone', name: 'Vodafone Park', city: 'İstanbul', club: 'Beşiktaş', type: 'Futbol',
    teamId: 'bjk',
    logo: 'assets/stadiums/bjkstd.jpg',
    colors: ['#080808', '#121212', '#1c1c1c'], accent: '#FFFFFF', line: 'rgba(255,255,255,0.12)',
  },
  {
    id: 'papara-trabzon', name: 'Papara Park', city: 'Trabzon', club: 'Trabzonspor', type: 'Futbol',
    teamId: 'ts',
    logo: 'assets/stadiums/ts61.jpg',
    colors: ['#180020', '#280035', '#450055'], accent: '#7B003A', line: 'rgba(123,0,58,0.28)',
  },
  {
    id: 'basaksehir', name: 'Başakşehir FT Stadyumu', city: 'İstanbul', club: 'Başakşehir', type: 'Futbol',
    teamId: 'bas',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Istanbul_Basaksehir_FK_logo.svg/200px-Istanbul_Basaksehir_FK_logo.svg.png',
    colors: ['#1a1008', '#2d1a0f', '#4a2a15'], accent: '#F58220', line: 'rgba(245,130,32,0.22)',
  },
  {
    id: 'msg', name: 'Madison Square Garden', city: 'New York', club: 'Knicks', type: 'NBA',
    teamId: null,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/New_York_Knicks_logo.svg/200px-New_York_Knicks_logo.svg.png',
    colors: ['#0a1020', '#101830', '#182040'], accent: '#F58426', line: 'rgba(0,82,165,0.2)',
  },
  {
    id: 'crypto', name: 'Crypto.com Arena', city: 'Los Angeles', club: 'Lakers', type: 'NBA',
    teamId: null,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/200px-Los_Angeles_Lakers_logo.svg.png',
    colors: ['#1a0a2e', '#2d1050', '#4a1878'], accent: '#FDB927', line: 'rgba(85,37,131,0.25)',
  },
  {
    id: 'united', name: 'United Center', city: 'Chicago', club: 'Bulls', type: 'NBA',
    teamId: null,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Chicago_Bulls_logo.svg/200px-Chicago_Bulls_logo.svg.png',
    colors: ['#1a0808', '#2d1010', '#4a1818'], accent: '#CE1141', line: 'rgba(206,17,65,0.22)',
  },
  {
    id: 'tdgarden', name: 'TD Garden', city: 'Boston', club: 'Celtics', type: 'NBA',
    teamId: null,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/200px-Boston_Celtics.svg.png',
    colors: ['#081a10', '#102d1a', '#184a28'], accent: '#007A33', line: 'rgba(0,122,51,0.22)',
  },
  {
    id: 'chase', name: 'Chase Center', city: 'San Francisco', club: 'Warriors', type: 'NBA',
    teamId: null,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Golden_State_Warriors_logo.svg/200px-Golden_State_Warriors_logo.svg.png',
    colors: ['#08101a', '#101a2d', '#182a4a'], accent: '#1D428A', line: 'rgba(29,66,138,0.25)',
  },
];

const POWER_TYPES = [
  { id: 'fireball',   label: 'Ateş Topu',   color: '#ff5500', icon: '🔥' },
  { id: 'powerShot',  label: 'Güç Şutu',    color: '#ffdd00', icon: '⚡' },
  { id: 'slowEnemy',  label: 'Yavaşlat',    color: '#aa66ff', icon: '🐌' },
  { id: 'speedBoost', label: 'Hız Artışı', color: '#00ffaa', icon: '💨' },
  { id: 'giant',      label: 'Dev Raket',   color: '#ff66aa', icon: '⬆' },
  { id: 'shield',     label: 'Kalkan',      color: '#44aaff', icon: '🛡' },
  { id: 'freeze',     label: 'Dondur',      color: '#88ddff', icon: '❄' },
  { id: 'magnet',     label: 'Mıknatıs',    color: '#ff88ff', icon: '🧲' },
  { id: 'doubleGoal', label: 'Çift Gol',    color: '#ffaa00', icon: '✕2' },
  { id: 'icePuck',    label: 'Buz Topu',    color: '#aaddff', icon: '🧊' },
];

const MATCH_DURATION_MS = 120000;

const MATCH_MODES = [
  {
    id: 'classic',
    name: 'Klasik Maç',
    icon: '🏆',
    desc: 'Standart kurallar · 2 dakika',
  },
  {
    id: 'doubleScore',
    name: 'Çift Gol',
    icon: '✕2',
    desc: 'Her gol 2 puan sayılır',
  },
  {
    id: 'overtime',
    name: 'Uzatmalı',
    icon: '⏱',
    desc: 'Her golde +15 saniye eklenir',
  },
  {
    id: 'freezePenalty',
    name: 'Temas Cezası',
    icon: '❄',
    desc: '8 sn topa dokunmazsan donarsın',
  },
];

const MATCH_RULES = {
  OVERTIME_BONUS_MS: 15000,
  TOUCH_LIMIT_MS: 8000,
  FREEZE_PENALTY_MS: 2500,
};

const PHYS = {
  PUCK_MASS: 1,
  PADDLE_MASS: 10,
  PADDLE_ACCEL: 3.2,
  PADDLE_DAMPING: 2.8,
  PADDLE_MAX_SPEED: 1.85,
  PUCK_DRAG: 0.22,
  PUCK_MAX_SPEED: 2.6,
  PUCK_MIN_SPEED: 0.22,
  RESTITUTION: 1.2,
  WALL_RESTITUTION: 0.94,
  ULTI_MAX: 100,
  ULTI_CHARGE_PER_HIT: 14,
  ULTI_RESTITUTION: 2.35,
  POWER_SHOT_RESTITUTION: 1.65,
};
