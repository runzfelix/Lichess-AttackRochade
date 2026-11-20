const SIZE = 16, COLS = 'abcdefghijklmnop';
let board = [], turn = 'w', selected = null, validMoves = [], history = [], lastMove = null;
let flipped = false, pieceStyle = 'cburnett', variant = 'standard', gameMode = 'local', playerSide = 'w';
let timeWhite = 600, timeBlack = 600, timerInterval = null, gameActive = false;

const SVGS = {
  wP: '<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5"/></svg>',
  wR: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3M31 17v12.5H14V17M31 29.5l1.5 2.5h-20l1.5-2.5"/></g></svg>',
  wN: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.99 2.5-3c1 0 1 3 1 3"/></g></svg>',
  wB: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>',
  wQ: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5"><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/></g></svg>',
  wK: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/></g></svg>',
  wE: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5"><polygon points="22.5,5 35,20 29,38 16,38 10,20"/><text x="22.5" y="28" font-size="15" font-weight="bold" text-anchor="middle" fill="#000">E</text></g></svg>',
  wC: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5"><rect x="10" y="9" width="25" height="29" rx="3"/><text x="22.5" y="29" font-size="16" font-weight="bold" text-anchor="middle" fill="#000">C</text></g></svg>',
  wA: '<svg viewBox="0 0 45 45"><g fill="#fff" stroke="#000" stroke-width="1.5"><polygon points="22.5,4 28,15 40,17 31,26 33,38 22.5,32 12,38 14,26 5,17 17,15"/><text x="22.5" y="27" font-size="14" font-weight="bold" text-anchor="middle" fill="#000">A</text></g></svg>',
  bP: '<svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#1a1a1a" stroke="#000" stroke-width="1.5"/></svg>',
  bR: '<svg viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#000" stroke-width="1.5"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3M31 17v12.5H14V17M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M12 35.5h21M14 29.5h17M14 16.5h17" stroke="#fff"/></g></svg>',
  bN: '<svg viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#000" stroke-width="1.5"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.99 2.5-3c1 0 1 3 1 3"/><circle cx="9.5" cy="25.5" r="0.8" fill="#fff" stroke="#fff"/></g></svg>',
  bB: '<svg viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#000" stroke-width="1.5"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><circle cx="22.5" cy="8" r="2.5"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff"/></g></svg>',
  bQ: '<svg viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#000" stroke-width="1.5"><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" stroke="#fff"/></g></svg>',
  bK: '<svg viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#000" stroke-width="1.5"><path d="M22.5 11.63V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/></g></svg>',
  bE: '<svg viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#fff" stroke-width="1.5"><polygon points="22.5,5 35,20 29,38 16,38 10,20"/><text x="22.5" y="28" font-size="15" font-weight="bold" text-anchor="middle" fill="#fff">E</text></g></svg>',
  bC: '<svg viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#fff" stroke-width="1.5"><rect x="10" y="9" width="25" height="29" rx="3"/><text x="22.5" y="29" font-size="16" font-weight="bold" text-anchor="middle" fill="#fff">C</text></g></svg>',
  bA: '<svg viewBox="0 0 45 45"><g fill="#1a1a1a" stroke="#fff" stroke-width="1.5"><polygon points="22.5,4 28,15 40,17 31,26 33,38 22.5,32 12,38 14,26 5,17 17,15"/><text x="22.5" y="27" font-size="14" font-weight="bold" text-anchor="middle" fill="#fff">A</text></g></svg>'
};
const getCell = (r, c) => board.at(r).at(c);
const setCell = (r, c, val) => { board.at(r)[c] = val; };
function initBoard() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  const stdRank = ['R','R','N','N','B','B','Q','Q','K','Q','B','B','N','N','R','R'];
  const v2Rank  = ['R','N','E','B','C','Q','A','K','A','Q','C','B','E','N','R','R'];
  const rank = variant === 'variant2' ? v2Rank : stdRank;
  for (let c = 0; c < SIZE; c++) { setCell(0, c, 'b' + rank.at(c)); setCell(1, c, 'bP'); setCell(14, c, 'wP'); setCell(15, c, 'w' + rank.at(c)); }
  turn = 'w'; selected = null; validMoves = []; history = []; lastMove = null;
  document.getElementById('move-list').innerHTML = '';
  document.getElementById('variant-badge').textContent = variant === 'variant2' ? 'Variante 2' : 'Standard';
  updateEval(); updateStatus(); renderBoard();
}

function renderBoard() {
  const el = document.getElementById('chessboard'); el.innerHTML = '';
  for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE; j++) {
    const r = flipped ? SIZE - 1 - i : i, c = flipped ? SIZE - 1 - j : j;
    const sq = document.createElement('div'); sq.className = 'square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
    if (lastMove && ((lastMove.fr === r && lastMove.fc === c) || (lastMove.tr === r && lastMove.tc === c))) sq.classList.add('last-move');
    if (selected && selected.r === r && selected.c === c) sq.classList.add('selected');
    const mv = validMoves.find(m => m.r === r && m.c === c); if (mv) sq.classList.add(getCell(r, c) ? 'valid-capture' : 'valid-move');
    if (j === 0) { const rk = document.createElement('span'); rk.className = 'coord-rank'; rk.textContent = SIZE - r; sq.appendChild(rk); }
    if (i === SIZE - 1) { const fl = document.createElement('span'); fl.className = 'coord-file'; fl.textContent = COLS.at(c); sq.appendChild(fl); }
    const p = getCell(r, c); if (p) { const div = document.createElement('div'); div.className = 'piece style-' + pieceStyle; div.innerHTML = SVGS[p]; sq.appendChild(div); }
    sq.addEventListener('click', () => onSquareClick(r, c)); el.appendChild(sq);
  }
}

function getMoves(r, c, p) {
  const moves = [], col = p.at(0), t = p.at(1), enemy = col === 'w' ? 'b' : 'w';
  const add = (nr, nc) => { if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return false; const tgt = getCell(nr, nc); if (!tgt) { moves.push({ fr: r, fc: c, r: nr, c: nc }); return true; } if (tgt.at(0) === enemy) { moves.push({ fr: r, fc: c, r: nr, c: nc }); return false; } return false; };
  const slide = dirs => dirs.forEach(([dr, dc]) => { let nr = r + dr, nc = c + dc; while (add(nr, nc)) { nr += dr; nc += dc; } });
  const knight = () => [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dr, dc]) => add(r + dr, c + dc));
  if (t === 'P') {
    const dir = col === 'w' ? -1 : 1, start = col === 'w' ? 14 : 1, max = r === start ? 3 : 1;
    for (let s = 1; s <= max; s++) { const nr = r + dir * s; if (nr >= 0 && nr < SIZE && !getCell(nr, c)) moves.push({ fr: r, fc: c, r: nr, c }); else break; }
    [-1, 1].forEach(dc => { const nr = r + dir, nc = c + dc; if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && getCell(nr, nc) && getCell(nr, nc).at(0) === enemy) moves.push({ fr: r, fc: c, r: nr, c: nc }); });
  } else if (t === 'R') slide([[1,0],[-1,0],[0,1],[0,-1]]); else if (t === 'B') slide([[1,1],[1,-1],[-1,1],[-1,-1]]); else if (t === 'Q') slide([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
  else if (t === 'N') knight(); else if (t === 'E') { slide([[1,1],[1,-1],[-1,1],[-1,-1]]); knight(); } else if (t === 'C') { slide([[1,0],[-1,0],[0,1],[0,-1]]); knight(); } else if (t === 'A') { slide([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]); knight(); }
  else if (t === 'K') for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dr || dc) add(r + dr, c + dc);
  return moves;
}
const VALS = { P: 100, N: 320, B: 330, R: 500, E: 650, C: 800, Q: 950, A: 1300, K: 20000 };
function evaluateBoard() { let s = 0; for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) { const p = getCell(r, c); if (!p) continue; const v = (VALS[p.at(1)] || 0) + (15 - (Math.abs(7.5 - r) + Math.abs(7.5 - c))) * 3; s += p.at(0) === 'w' ? v : -v; } return s / 100; }
function getAllMovesFor(side) { let all = []; for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) { const p = getCell(r, c); if (p && p.at(0) === side) all.push(...getLegalMoves(r, c, p)); } return all.sort((a, b) => (getCell(b.r, b.c) ? 1 : 0) - (getCell(a.r, a.c) ? 1 : 0)); }
function minimax(d, a, b, max) { if (!d) return evaluateBoard(); const mvs = getAllMovesFor(max ? 'w' : 'b'); if (!mvs.length) return evaluateBoard(); let best = max ? -99999 : 99999; for (let i = 0; i < Math.min(mvs.length, 35); i++) { const m = mvs.at(i), sf = getCell(m.fr, m.fc), st = getCell(m.r, m.c); setCell(m.r, m.c, sf); setCell(m.fr, m.fc, null); const ev = minimax(d - 1, a, b, !max); setCell(m.fr, m.fc, sf); setCell(m.r, m.c, st); if (max) { best = Math.max(best, ev); a = Math.max(a, ev); } else { best = Math.min(best, ev); b = Math.min(b, ev); } if (b <= a) break; } return best; }
function drawArrow(mv) { let svg = document.getElementById('arrow-svg'); if (!svg) { svg = document.createElementNS('http://w3.org', 'svg'); svg.id = 'arrow-svg'; svg.setAttribute('class', 'arrow-layer'); svg.setAttribute('viewBox', '0 0 1600 1600'); document.querySelector('.board-container').appendChild(svg); } svg.innerHTML = ''; if (!mv || !document.getElementById('engine-toggle').checked) return; const x1 = (flipped ? 15 - mv.fc : mv.fc) * 100 + 50, y1 = (flipped ? 15 - mv.fr : mv.fr) * 100 + 50, x2 = (flipped ? 15 - mv.c : mv.c) * 100 + 50, y2 = (flipped ? 15 - mv.r : mv.r) * 100 + 50; svg.innerHTML = `<defs><marker id="ah" markerWidth="4" markerHeight="4" refX="2.5" refY="2" orient="auto"><polygon points="0 0, 4 2, 0 4" fill="rgba(21,120,27,0.85)"/></marker></defs><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(21,120,27,0.85)" stroke-width="24" stroke-linecap="round" marker-end="url(#ah)"/>`; }
function updateEval() { if (!document.getElementById('engine-toggle').checked) { drawArrow(null); return; } document.getElementById('eval-score').textContent = '...'; setTimeout(() => { const mvs = getAllMovesFor(turn); if (!mvs.length) return; let bm = mvs.at(0), bs = turn === 'w' ? -99999 : 99999; for (let i = 0; i < Math.min(mvs.length, 30); i++) { const m = mvs.at(i), sf = getCell(m.fr, m.fc), st = getCell(m.r, m.c); setCell(m.r, m.c, sf); setCell(m.fr, m.fc, null); const sc = minimax(1, -99999, 99999, turn !== 'w'); setCell(m.fr, m.fc, sf); setCell(m.r, m.c, st); if ((turn === 'w' && sc > bs) || (turn === 'b' && sc < bs)) { bs = sc; bm = m; } } document.getElementById('eval-fill').style.height = (50 + (Math.max(-20, Math.min(20, bs)) / 20) * 45) + '%'; document.getElementById('eval-score').textContent = (bs > 0 ? '+' : '') + bs.toFixed(1); drawArrow(bm); }, 100); }

function isKingAttacked(side) {
  let kr = -1, kc = -1;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (getCell(r, c) === side + "K") { kr = r; kc = c; }
  if (kr === -1) return true;
  const enemy = side === "w" ? "b" : "w";
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const p = getCell(r, c);
    if (p && p.at(0) === enemy) {
      if (getMoves(r, c, p).some(m => m.r === kr && m.c === kc)) return true;
    }
  }
  return false;
}

function getLegalMoves(r, c, p) {
  const side = p.at(0);
  return getMoves(r, c, p).filter(m => {
    const sf = getCell(m.fr, m.fc), st = getCell(m.r, m.c);
    setCell(m.r, m.c, sf); setCell(m.fr, m.fc, null);
    const bad = isKingAttacked(side);
    setCell(m.fr, m.fc, sf); setCell(m.r, m.c, st);
    return !bad;
  });
}

function onSquareClick(r, c) { if (!gameActive) return; const mv = validMoves.find(m => m.r === r && m.c === c); if (mv && selected) { executeMove(mv); return; } const p = getCell(r, c); if (p && p.at(0) === turn) { selected = { r, c }; validMoves = getLegalMoves(r, c, p); } else { selected = null; validMoves = []; } renderBoard(); }
function executeMove(mv) { const p = getCell(mv.fr, mv.fc), cap = getCell(mv.r, mv.c);
  if (cap && cap.at(1) === "K") {
    setCell(mv.r, mv.c, p); setCell(mv.fr, mv.fc, null);
    gameActive = false; clearInterval(timerInterval);
    renderBoard();
    document.getElementById("status-text").textContent = (turn === "w" ? "🏆 Weiß gewinnt!" : "🏆 Schwarz gewinnt!");
    return;
  }
  if (cap && cap.at(1) === "K") {
    setCell(mv.r, mv.c, p); setCell(mv.fr, mv.fc, null);
    gameActive = false; clearInterval(timerInterval);
    renderBoard();
    document.getElementById("status-text").textContent = (turn === "w" ? "🏆 Weiß gewinnt!" : "🏆 Schwarz gewinnt!");
    return;
  } setCell(mv.r, mv.c, p); setCell(mv.fr, mv.fc, null); if (p === 'wP' && mv.r === 0) setCell(mv.r, mv.c, 'wQ'); if (p === 'bP' && mv.r === 15) setCell(mv.r, mv.c, 'bQ'); lastMove = { fr: mv.fr, fc: mv.fc, tr: mv.r, tc: mv.c }; const ml = document.getElementById('move-list'), item = document.createElement('span'); item.className = 'move-item'; item.textContent = (history.length + 1) + '. ' + (p.at(1) === 'P' ? '' : p.at(1)) + (cap ? 'x' : '') + COLS.at(mv.c) + (SIZE - mv.r); history.push(item.textContent); ml.appendChild(item); ml.scrollTop = ml.scrollHeight; turn = turn === 'w' ? 'b' : 'w'; selected = null; validMoves = []; updateEval(); updateStatus(); renderBoard(); const botSide = playerSide === 'w' ? 'b' : 'w'; if (turn === botSide && gameMode.startsWith('bot-')) setTimeout(playBotMove, 250); }
function playBotMove() { const botSide = playerSide === 'w' ? 'b' : 'w', all = getAllMovesFor(botSide); if (!all.length) return; if (gameMode === 'bot-easy') { executeMove(all.at(Math.floor(Math.random() * all.length))); return; } const d = gameMode === 'bot-hard' ? 2 : 1; setTimeout(() => { let best = all.at(0), bs = botSide === 'w' ? -99999 : 99999; for (let i = 0; i < Math.min(all.length, 35); i++) { const m = all.at(i), sf = getCell(m.fr, m.fc), st = getCell(m.r, m.c); setCell(m.r, m.c, sf); setCell(m.fr, m.fc, null); const sc = minimax(d - 1, -99999, 99999, botSide !== 'w') + (gameMode === 'bot-med' ? (Math.random() - 0.5) * 1.5 : 0); setCell(m.fr, m.fc, sf); setCell(m.r, m.c, st); if ((botSide === 'w' && sc > bs) || (botSide === 'b' && sc < bs)) { bs = sc; best = m; } } executeMove(best); }, 250); }
function formatTime(s) { return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
function startClocks() { clearInterval(timerInterval); timerInterval = setInterval(() => { if (!gameActive) return; if (turn === 'w') { timeWhite = Math.max(0, timeWhite - 1); document.getElementById('clock-bottom').textContent = formatTime(timeWhite); } else { timeBlack = Math.max(0, timeBlack - 1); document.getElementById('clock-top').textContent = formatTime(timeBlack); } }, 1000); }
function updateStatus() { const inChk = isKingAttacked(turn);
  const hasMoves = getAllMovesFor(turn).length > 0;
  const stEl = document.getElementById("status-text");
  if (!hasMoves) {
    gameActive = false; clearInterval(timerInterval);
    stEl.textContent = inChk ? (turn === "w" ? "🏆 Schachmatt! Schwarz gewinnt!" : "🏆 Schachmatt! Weiß gewinnt!") : "🤝 Unentschieden (Patt)!";
  } else {
    stEl.textContent = (turn === "w" ? "Weiß ist am Zug" : "Schwarz ist am Zug") + (inChk ? " — ⚠️ SCHACH!" : "");
  } }
function updateInviteLink() { const room = Math.random().toString(36).substring(2, 7).toUpperCase(), fs = document.getElementById('opt-color').value === 'b' ? 'w' : 'b'; document.getElementById('invite-link').value = window.location.href.split('?').at(0) + '?room=' + room + '&side=' + fs; }
document.getElementById('btn-copy-link').onclick = () => { const i = document.getElementById('invite-link'); i.select(); navigator.clipboard?.writeText(i.value); const b = document.getElementById('btn-copy-link'); b.textContent = 'Kopiert!'; setTimeout(() => b.textContent = 'Kopieren', 1500); };
function applyAllThemes() { document.body.className = document.getElementById('ui-theme').value + ' ' + document.getElementById('board-theme').value + ' ' + document.getElementById('piece-shape').value; }
['ui-theme', 'board-theme', 'piece-shape'].forEach(id => document.getElementById(id).onchange = applyAllThemes);
document.getElementById('piece-style').onchange = e => { pieceStyle = e.target.value; renderBoard(); };
document.getElementById('opt-color').onchange = updateInviteLink;
document.getElementById('opt-time').oninput = e => document.getElementById('time-val').textContent = e.target.value;
document.getElementById('opt-mode').onchange = e => document.getElementById('qr-area').classList.toggle('hidden', e.target.value !== 'local');
document.getElementById('btn-start-game').onclick = () => { variant = document.getElementById('opt-variant').value; gameMode = document.getElementById('opt-mode').value; let c = document.getElementById('opt-color').value; if (c === 'random') c = Math.random() < 0.5 ? 'w' : 'b'; playerSide = c; flipped = (playerSide === 'b'); const m = parseInt(document.getElementById('opt-time').value, 10); timeWhite = m * 60; timeBlack = m * 60; document.getElementById('clock-bottom').textContent = formatTime(timeWhite); document.getElementById('clock-top').textContent = formatTime(timeBlack); document.getElementById('bot-name').textContent = playerSide === 'w' ? 'Du (Weiß)' : 'Du (Schwarz)'; document.getElementById('top-name').textContent = gameMode === 'local' ? 'Freund (Link/QR)' : 'Bot (' + gameMode.replace('bot-','') + ')'; document.getElementById('setup-modal').classList.add('hidden'); gameActive = true; initBoard(); startClocks(); if (playerSide === 'b' && gameMode.startsWith('bot-')) setTimeout(playBotMove, 350); };
document.getElementById('gift-top').onclick = () => { timeBlack += 15; document.getElementById('clock-top').textContent = formatTime(timeBlack); };
document.getElementById('gift-bottom').onclick = () => { timeWhite += 15; document.getElementById('clock-bottom').textContent = formatTime(timeWhite); };
document.getElementById('engine-toggle').onchange = e => { document.getElementById('eval-box').classList.toggle('hidden', !e.target.checked); updateEval(); };
document.getElementById('btn-flip').onclick = () => { flipped = !flipped; renderBoard(); updateEval(); };
document.getElementById('btn-setup').onclick = () => { updateInviteLink(); document.getElementById('setup-modal').classList.remove('hidden'); };
document.getElementById('btn-rules').onclick = () => document.getElementById('rules-modal').classList.remove('hidden');
document.getElementById('btn-close-rules').onclick = () => document.getElementById('rules-modal').classList.add('hidden');
updateInviteLink(); initBoard();
