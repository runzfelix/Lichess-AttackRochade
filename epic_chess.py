import time, threading, chess, chess.engine
from flask import Flask, jsonify, render_template_string

app = Flask(__name__)
GAMES = 30

CONFIGS = {
    "b1": {"title": "1+0 Bullet", "base": 60.0, "inc": 0.0, "max_t": 0.8},
    "b2": {"title": "1+2 Bullet", "base": 60.0, "inc": 2.0, "max_t": 1.2},
    "b3": {"title": "3+0 Blitz",  "base": 180.0, "inc": 0.0, "max_t": 1.8},
    "b4": {"title": "3+2 Blitz",  "base": 180.0, "inc": 2.0, "max_t": 2.4}
}

states = {}
for k, cfg in CONFIGS.items():
    states[k] = {
        "title": cfg.get("title"), "run": False, "done": False,
        "fen": chess.STARTING_FEN, "mv": "", "g": 1,
        "wt": cfg.get("base"), "bt": cfg.get("base"), "t": "w",
        "w": 0, "d": 0, "b": 0, "ev": 0.0, "evt": "0.0",
        "st": "Bereit", "ts": 0.0
    }

HTML = """<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LICHESS 4-ARENA MULTIVIEW</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#12110f;color:#bababa;font-family:-apple-system,sans-serif;height:100vh;overflow:hidden;padding:8px;display:flex;flex-direction:column;gap:8px}
.header{display:flex;justify-content:space-between;align-items:center;background:#262421;border:1px solid #3c3934;padding:8px 16px;border-radius:6px}
.header b{color:#fff;font-size:15px}
.btn-all{padding:9px 18px;font-size:14px;font-weight:800;color:#fff;background:#629924;border:none;border-radius:5px;cursor:pointer}
.btn-all:disabled{background:#3c3934;color:#888}
.grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;flex:1;min-height:0}
.card{background:#262421;border:1px solid #3c3934;border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px;position:relative}
.c-top{display:flex;justify-content:space-between;align-items:center;font-size:12px}
.bdg{background:#629924;color:#fff;font-weight:700;padding:2px 6px;border-radius:3px}
.c-main{display:flex;gap:8px;align-items:stretch;justify-content:center}
.eb{width:18px;background:#161512;border:1px solid #403d39;border-radius:3px;position:relative;overflow:hidden}
.ew{position:absolute;bottom:0;width:100%;height:50%;background:#fff;transition:height .2s}
.el{position:absolute;width:100%;text-align:center;font-size:8px;font-weight:800;z-index:3;top:3px;color:#888}
.board{display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);width:min(32vh,32vw);height:min(32vh,32vw);border:2px solid #161512}
.sq{display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:hidden}
.l{background:#dee3e6}.d{background:#8ca2ad}.hi.l{background:#cdd26a}.hi.d{background:#aaa23a}
.sq svg{width:86%;height:86%;display:block}
.side{flex:1;min-width:105px;display:flex;flex-direction:column;justify-content:space-between;gap:4px}
.pbox{background:#1d1b18;padding:6px;border-radius:4px;border:1px solid #33302b}
.pname{font-size:11px;color:#fff;font-weight:700;display:flex;justify-content:space-between}
.clk{font-family:monospace;font-size:16px;font-weight:800;background:#161512;color:#787878;padding:3px 6px;border-radius:3px;text-align:right;margin-top:3px}
.clk.on{background:#384722;color:#fff}.clk.lo{background:#5c1a14;color:#ff6655}
.mid{text-align:center;font-size:11px;padding:4px 0}
.sc{font-size:13px;font-weight:800;color:#fff;margin-top:2px}
.overlay{position:absolute;inset:0;background:rgba(18,17,15,.93);border-radius:6px;display:none;flex-direction:column;align-items:center;justify-content:center;z-index:10;padding:16px;text-align:center;gap:10px}
.overlay.show{display:flex}
.res-title{font-size:20px;font-weight:800;color:#629924}
.res-big{font-size:24px;font-weight:800;color:#fff;background:#1d1b18;padding:10px 20px;border-radius:6px;border:1px solid #3c3934}
</style></head><body>
<div class="header">
  <div><b>STOCKFISH 4-ARENA</b> <span style="font-size:12px;margin-left:8px">4x 30 Runden • Weiss: Nur Angriffs-Rochade</span></div>
  <button class="btn-all" id="btn-all" onclick="startAll()">ALLE 4 STARTEN</button>
</div>
<div class="grid" id="grid"></div>
<script>
const KEYS=['b1','b2','b3','b4'];
const SVG={
  P:'<path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/>',
  R:'<g><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none"/></g>',
  N:'<g><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/></g>',
  B:'<g><g><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none"/></g>',
  Q:'<g><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/></g>',
  K:'<g><path d="M22.5 11.63V6M20 8h5" fill="none"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/></g>'
};
let lastFens={}, liveData={};

function buildCards(){
  const g=document.getElementById('grid');
  for(const k of KEYS){
    g.innerHTML+=`<div class="card" id="card-${k}">
      <div class="overlay" id="ov-${k}">
        <div class="res-title" id="ov-t-${k}">ENDERGEBNIS (30 RUNDEN)</div>
        <div class="res-big" id="ov-s-${k}">W 0 • D 0 • S 0</div>
        <div style="font-size:13px;color:#aaa" id="ov-w-${k}"></div>
      </div>
      <div class="c-top"><span class="bdg" id="gb-${k}">GAME 1/30</span><b style="color:#fff" id="tt-${k}">...</b></div>
      <div class="c-main">
        <div class="eb"><div class="el" id="et-${k}">0.0</div><div class="ew" id="eb-${k}"></div></div>
        <div class="board" id="b-${k}"></div>
        <div class="side">
          <div class="pbox"><div class="pname"><span>SF Black</span><span style="color:#888">3600</span></div><div class="clk" id="cb-${k}">00:00.0</div></div>
          <div class="mid"><div id="st-${k}">Bereit</div><div class="sc" id="sc-${k}">W 0 • D 0 • S 0</div></div>
          <div class="pbox"><div class="clk" id="cw-${k}">00:00.0</div><div class="pname"><span>SF White</span><span style="color:#888">3600</span></div></div>
        </div>
      </div>
    </div>`;
    drawBoard(k,"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1","");
  }
}

function drawBoard(k,fen,mv){
  const B=document.getElementById('b-'+k); B.innerHTML=''; let r=0;
  for(const row of fen.split(' ').shift().split('/')){
    let c=0;
    for(const ch of row){
      if(!isNaN(ch)){for(let i=0;i<Number(ch);i++){addSq(B,r,c++,null,mv);}}
      else{addSq(B,r,c++,ch,mv);}
    }
    r++;
  }
}
function addSq(B,r,c,p,mv){
  const d=document.createElement('div'),n='abcdefgh'.charAt(c)+(8-r);
  d.className='sq '+((r+c)%2?'d':'l')+(mv&&(mv.startsWith(n)||mv.endsWith(n))?' hi':'');
  if(p){
    const isW=p===p.toUpperCase(), fill=isW?'#fff':'#1a1a1a', stroke=isW?'#000':'#fff';
    d.innerHTML='<svg viewBox="0 0 45 45" style="fill:'+fill+';stroke:'+stroke+';stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round">'+Reflect.get(SVG,p.toUpperCase())+'</svg>';
  }
  B.appendChild(d);
}
function fmt(s){s=Math.max(0,s);return '0'+Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0');}
async function startAll(){document.getElementById('btn-all').disabled=true;await fetch('/go',{method:'POST'});}

setInterval(()=>{
  for(const k of KEYS){
    const d=Reflect.get(liveData,k); if(!d)continue;
    let wt=d.wt,bt=d.bt;
    if(d.run && d.ts>0){const e=Math.max(0,(Date.now()/1000)-d.ts);if(d.t==='w')wt=Math.max(0,wt-e);else bt=Math.max(0,bt-e);}
    const w=document.getElementById('cw-'+k),b=document.getElementById('cb-'+k);
    w.innerText=fmt(wt);b.innerText=fmt(bt);
    w.className='clk'+(d.run&&d.t==='w'?(wt<10?' lo':' on'):'');
    b.className='clk'+(d.run&&d.t==='b'?(bt<10?' lo':' on'):'');
  }
},100);

async function loop(){
  try{
    const all=await(await fetch('/s')).json();
    let anyRun=false;
    for(const k of KEYS){
      const d=Reflect.get(all,k); Reflect.set(liveData,k,d);
      if(d.run)anyRun=true;
      document.getElementById('tt-'+k).innerText=d.title;
      document.getElementById('gb-'+k).innerText='GAME '+d.g+'/30';
      document.getElementById('st-'+k).innerText=d.st;
      document.getElementById('sc-'+k).innerText='W '+d.w+' • D '+d.d+' • S '+d.b;
      document.getElementById('et-'+k).innerText=d.evt;
      document.getElementById('eb-'+k).style.height=Math.max(4,Math.min(96,50+d.ev*5))+'%';
      if(Reflect.get(lastFens,k)!==d.fen){Reflect.set(lastFens,k,d.fen);drawBoard(k,d.fen,d.mv);}
      if(d.done){
        document.getElementById('ov-'+k).classList.add('show');
        document.getElementById('ov-t-'+k).innerText='ENDERGEBNIS • '+d.title;
        document.getElementById('ov-s-'+k).innerText='WEISS '+d.w+'  |  REMIS '+d.d+'  |  SCHWARZ '+d.b;
        const win=d.w>d.b?'Gesamtsieger: WEISS':d.b>d.w?'Gesamtsieger: SCHWARZ':'Unentschieden!';
        document.getElementById('ov-w-'+k).innerText=win;
      }
    }
    if(anyRun){document.getElementById('btn-all').disabled=true;document.getElementById('btn-all').innerText='4 ARENEN LAUFEN...';}
  }catch(e){}
  setTimeout(loop,200);
}
buildCards();loop();
</script></body></html>"""

def is_attacking_castling(board, move):
    if not board.is_castling(move): return True
    b2 = board.copy(); b2.push(move)
    if b2.is_check(): return True
    rsq = chess.F1 if chess.square_file(move.to_square) == 6 else chess.D1
    for t in b2.attacks(rsq):
        p = b2.piece_at(t)
        if p and p.color == chess.BLACK and (p.piece_type == chess.QUEEN or not b2.is_attacked_by(chess.BLACK, t)):
            return True
    return False

def run_arena(k):
    cfg = CONFIGS.get(k); st = states.get(k)
    ew = chess.engine.SimpleEngine.popen_uci("/usr/games/stockfish")
    eb = chess.engine.SimpleEngine.popen_uci("/usr/games/stockfish")
    ew.configure({"Threads": 1, "Hash": 128}); eb.configure({"Threads": 1, "Hash": 128})
    for g in range(1, GAMES + 1):
        b = chess.Board(); wt = bt = cfg.get("base")
        st.update({"g": g, "fen": b.fen(), "mv": "", "wt": wt, "bt": bt, "t": "w", "ev": 0.0, "evt": "0.0", "st": f"Runde {g}/30", "ts": time.time()})
        while not b.is_game_over():
            t0 = time.time(); eng = ew if b.turn else eb
            rm = [m for m in b.legal_moves if b.turn == chess.BLACK or is_attacking_castling(b, m)]
            if cfg.get("inc") == 0.0:
                lim = chess.engine.Limit(white_clock=max(0.05, wt), black_clock=max(0.05, bt), white_inc=0.0, black_inc=0.0)
            else:
                rem = wt if b.turn else bt
                t_lim = 0.35 if len(rm) <= 3 else min(cfg.get("max_t"), max(0.45, rem * 0.02))
                lim = chess.engine.Limit(time=t_lim)
            res = eng.play(b, lim, root_moves=rm, info=chess.engine.INFO_SCORE)
            sc = res.info.get("score").white() if "score" in res.info else chess.engine.Cp(0)
            ev = (10.0 if sc.mate() > 0 else -10.0) if sc.is_mate() else max(-10.0, min(10.0, sc.score()/100.0))
            evt = f"#{sc.mate()}" if sc.is_mate() else f"{sc.score()/100.0:+.1f}"
            dt = time.time() - t0
            if cfg.get("inc") > 0.0 and dt < 0.8: time.sleep(0.8 - dt); dt = 0.8
            if b.turn:
                wt = wt - dt + cfg.get("inc")
                if wt <= 0: st.update({"wt": 0.0, "b": st.get("b")+1, "st": "Zeitablauf W"}); break
            else:
                bt = bt - dt + cfg.get("inc")
                if bt <= 0: st.update({"bt": 0.0, "w": st.get("w")+1, "st": "Zeitablauf S"}); break
            b.push(res.move)
            st.update({"fen": b.fen(), "mv": res.move.uci(), "wt": wt, "bt": bt, "t": "w" if b.turn else "b", "ev": ev, "evt": evt, "ts": time.time()})
        if b.is_game_over():
            r = b.result()
            if r == "1-0": st.update({"w": st.get("w")+1, "st": "Weiss siegt"})
            elif r == "0-1": st.update({"b": st.get("b")+1, "st": "Schwarz siegt"})
            else: st.update({"d": st.get("d")+1, "st": "Remis"})
        time.sleep(1.2)
    st.update({"run": False, "done": True, "st": "Beendet!"})
    ew.quit(); eb.quit()

@app.route("/")
def idx(): return render_template_string(HTML)
@app.route("/s")
def get_s(): return jsonify(states)
@app.route("/go", methods=("POST",))
def go():
    for k in CONFIGS:
        if not states.get(k).get("run") and not states.get(k).get("done"):
            states.get(k).update({"run": True, "st": "Startet...", "ts": time.time()})
            threading.Thread(target=run_arena, args=(k,), daemon=True).start()
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
