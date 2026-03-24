/* ────────────────────────────────────────────────
   FC Online 팀 랜덤 생성기 - Main Script
   ──────────────────────────────────────────────── */

// ── State ──────────────────────────────────────
const state = {
  selectedLeagues: new Set(LEAGUES.map(l => l.id)),
  selectedTiers: new Set(['S', 'A', 'B', 'C']),
  drawCount: 1,
  history: JSON.parse(localStorage.getItem('fc_history') || '[]'),
};

// ── DOM References ──────────────────────────────
const leagueGrid     = document.getElementById('leagueGrid');
const tierRow        = document.getElementById('tierRow');
const drawBtn        = document.getElementById('drawBtn');
const resultsGrid    = document.getElementById('resultsGrid');
const resultsPlaceholder = document.getElementById('resultsPlaceholder');
const historySection = document.getElementById('historySection');
const historyList    = document.getElementById('historyList');
const totalTeamsEl   = document.getElementById('totalTeams');
const filteredTeamsEl = document.getElementById('filteredTeams');

// ── Init ────────────────────────────────────────
function init() {
  renderBgParticles();
  renderLeagueChips();
  renderTierChips();
  setupCountButtons();
  setupDrawButton();
  setupSelectAll();
  updateStats();
  renderHistory();
  document.getElementById('clearHistory').addEventListener('click', clearHistory);
}

// ── Background Particles ────────────────────────
function renderBgParticles() {
  const container = document.getElementById('bgParticles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      background: ${Math.random() > 0.5 ? '#00e676' : '#00b8ff'};
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * -15}s;
    `;
    container.appendChild(p);
  }
}

// ── League Chips ────────────────────────────────
function renderLeagueChips() {
  leagueGrid.innerHTML = '';
  LEAGUES.forEach(league => {
    const count = TEAMS.filter(t => t.league === league.id).length;
    const isActive = state.selectedLeagues.has(league.id);

    const chip = document.createElement('label');
    chip.className = 'league-chip' + (isActive ? ' active' : '');
    chip.innerHTML = `
      <input type="checkbox" value="${league.id}" ${isActive ? 'checked' : ''} />
      <span class="league-chip-flag">${league.country.split(' ')[0]}</span>
      <span class="league-chip-name">${league.name}</span>
      <span class="league-chip-count">${count}</span>
    `;
    chip.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) state.selectedLeagues.add(league.id);
      else state.selectedLeagues.delete(league.id);
      chip.classList.toggle('active', e.target.checked);
      updateStats();
    });
    leagueGrid.appendChild(chip);
  });
}

// ── Tier Chips ──────────────────────────────────
const TIER_INFO = {
  S: { label: '🏆 S티어', desc: '최상위' },
  A: { label: '⭐ A티어', desc: '강팀' },
  B: { label: '✅ B티어', desc: '중상위' },
  C: { label: '🔵 C티어', desc: '기타' },
};

function renderTierChips() {
  tierRow.innerHTML = '';
  ['S', 'A', 'B', 'C'].forEach(tier => {
    const count = TEAMS.filter(t => t.tier === tier).length;
    const isActive = state.selectedTiers.has(tier);

    const chip = document.createElement('label');
    chip.className = `tier-chip tier-${tier}${isActive ? ' active' : ''}`;
    chip.innerHTML = `
      <input type="checkbox" value="${tier}" ${isActive ? 'checked' : ''} />
      <span class="tier-chip-label">${TIER_INFO[tier].label}&nbsp;(${count})</span>
    `;
    chip.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) state.selectedTiers.add(tier);
      else state.selectedTiers.delete(tier);
      chip.classList.toggle('active', e.target.checked);
      updateStats();
    });
    tierRow.appendChild(chip);
  });
}

// ── Select All Buttons ──────────────────────────
function setupSelectAll() {
  document.getElementById('selectAllLeagues').addEventListener('click', () => {
    LEAGUES.forEach(l => state.selectedLeagues.add(l.id));
    leagueGrid.querySelectorAll('input').forEach(i => i.checked = true);
    leagueGrid.querySelectorAll('.league-chip').forEach(c => c.classList.add('active'));
    updateStats();
  });
  document.getElementById('deselectAllLeagues').addEventListener('click', () => {
    state.selectedLeagues.clear();
    leagueGrid.querySelectorAll('input').forEach(i => i.checked = false);
    leagueGrid.querySelectorAll('.league-chip').forEach(c => c.classList.remove('active'));
    updateStats();
  });
  document.getElementById('selectAllTiers').addEventListener('click', () => {
    ['S','A','B','C'].forEach(t => state.selectedTiers.add(t));
    tierRow.querySelectorAll('input').forEach(i => i.checked = true);
    tierRow.querySelectorAll('.tier-chip').forEach(c => c.classList.add('active'));
    updateStats();
  });
  document.getElementById('deselectAllTiers').addEventListener('click', () => {
    state.selectedTiers.clear();
    tierRow.querySelectorAll('input').forEach(i => i.checked = false);
    tierRow.querySelectorAll('.tier-chip').forEach(c => c.classList.remove('active'));
    updateStats();
  });
}

// ── Count Buttons ───────────────────────────────
function setupCountButtons() {
  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.drawCount = parseInt(btn.dataset.count, 10);
    });
  });
}

// ── Stats Update ────────────────────────────────
function getFilteredPool() {
  return TEAMS.filter(t =>
    state.selectedLeagues.has(t.league) && state.selectedTiers.has(t.tier)
  );
}

function updateStats() {
  totalTeamsEl.textContent = TEAMS.length;
  filteredTeamsEl.textContent = getFilteredPool().length;
}

// ── Draw Button ─────────────────────────────────
function setupDrawButton() {
  drawBtn.addEventListener('click', handleDraw);
}

function handleDraw() {
  const pool = getFilteredPool();
  if (pool.length === 0) {
    drawBtn.classList.add('shake');
    setTimeout(() => drawBtn.classList.remove('shake'), 400);
    return;
  }

  const count = Math.min(state.drawCount, pool.length);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, count);

  renderCards(picked);
  saveHistory(picked);
}

// ── Render Cards ────────────────────────────────
function renderCards(teams) {
  resultsPlaceholder.style.display = 'none';
  resultsGrid.style.display = 'grid';
  resultsGrid.innerHTML = '';

  teams.forEach((team, idx) => {
    const league = LEAGUES.find(l => l.id === team.league);
    const card = createCard(team, league, idx);
    resultsGrid.appendChild(card);

    // Flip with stagger
    setTimeout(() => card.classList.add('flipped'), 200 + idx * 180);
  });
}

function createCard(team, league, idx) {
  const div = document.createElement('div');
  div.className = 'team-card';
  div.style.animationDelay = `${idx * 80}ms`;

  div.innerHTML = `
    <div class="team-card-inner">
      <!-- Back face -->
      <div class="card-face card-back">
        <span class="card-back-icon">⚽</span>
        <span class="card-back-text">뽑는 중...</span>
      </div>
      <!-- Front face -->
      <div class="card-face card-front">
        <div class="card-banner" style="background: linear-gradient(135deg, ${team.primary}cc, ${team.secondary}55);">
          <div class="card-banner-glow" style="background: ${team.primary};"></div>
          <span class="card-emblem">${team.emblem}</span>
        </div>
        <div class="card-body">
          <div>
            <div class="card-team-name">${team.name}</div>
            <div class="card-eng-name">${team.engName}</div>
          </div>
          <div class="card-meta">
            <span class="badge badge-league">${league ? league.name : team.league}</span>
            <span class="badge badge-tier-${team.tier}">${team.tier}티어</span>
          </div>
          <div class="card-colors">
            <div class="color-dot" style="background:${team.primary};" title="${team.primary}"></div>
            <div class="color-dot" style="background:${team.secondary};" title="${team.secondary}"></div>
          </div>
        </div>
        <div class="card-footer rec-footer">
          <div class="rec-item"><span class="rec-icon">👕</span> 미페: <b>구단 컬러</b> 유니폼 통일</div>
          <div class="rec-item"><span class="rec-icon">✨</span> 시즌: <b>최신/고평가</b> 카드 위주 조합</div>
        </div>
      </div>
    </div>
  `;

  return div;
}



// ── History ─────────────────────────────────────
function saveHistory(teams) {
  const entry = {
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    teams: teams.map(t => t.name),
  };
  state.history.unshift(entry);
  if (state.history.length > 10) state.history.pop();
  localStorage.setItem('fc_history', JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  if (state.history.length === 0) {
    historySection.style.display = 'none';
    return;
  }
  historySection.style.display = 'block';
  historyList.innerHTML = '';
  state.history.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <span class="history-time">${entry.time}</span>
      <div class="history-teams">
        ${entry.teams.map(n => `<span class="history-team-tag">${n}</span>`).join('')}
      </div>
    `;
    historyList.appendChild(item);
  });
}

function clearHistory() {
  state.history = [];
  localStorage.removeItem('fc_history');
  renderHistory();
}

// ── Start ────────────────────────────────────────
init();
