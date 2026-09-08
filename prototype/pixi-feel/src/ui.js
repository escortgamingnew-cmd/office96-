/* Խաղի UI — DOM/CSS, պրոտոյից գրեթե ուղիղ պորտ (ms-ref խորեոգրաֆիա).
 * ՄԵԿ կանաչ կոճակ՝ «Place Bet» ↔ «🐰 Run! Daddy» ↔ «↻ Keep Running» (ghost, պարտության հետո),
 * CASH OUT կոճակ WON վիճակով, պատմության pills (վերջին 6 + մոդալ մինչև 60), մուլտի ցուցիչ։
 */
const $ = (id) => document.getElementById(id);

export class UI {
  constructor(handlers) {
    this.h = handlers; // { onPlaceBet(bet), onHold(on), onRestart(), onCashOut() }
    this.state = "bet"; this.bet = 5;
    this.btn = $("hold"); this.betMorph = $("betmorph"); this.betStack = $("betstack");
    this.lbl = { bet: $("lbl_bet"), run: $("lbl_run"), lost: $("lbl_lost") };
    this.multEl = $("mult"); this.stateEl = $("state"); this.betAmt = $("bet_amt");
    this.co = $("cashout"); this.coAmt = $("co_amt"); this.coLbl = $("co_label");
    this.hist = []; this.HIST_MAX = 60;
    this.vig = $("vig");
    this._w = { bet: 0, run: 0, btnH: 0, stackH: 0 }; this._morphTO = 0;

    $("bet_minus").addEventListener("click", () => { this.bet = Math.max(1, this.bet - 1); this.drawBet(); });
    $("bet_plus").addEventListener("click", () => { this.bet = Math.min(500, this.bet + 1); this.drawBet(); });
    document.querySelectorAll("#chiprow .chip").forEach(c => c.addEventListener("click", () => { this.bet = +c.dataset.bet; this.drawBet(); }));
    // նույն կոճակը. bet-ը դնում ա / catch-ից հետո restart
    this.btn.addEventListener("click", () => {
      if (this.state === "bet") { this.h.onPlaceBet(this.bet); this.showRun(); }
      else if (this.state === "lost") this.h.onRestart();
    });
    this.btn.addEventListener("pointerdown", e => { e.preventDefault(); if (this.state === "run") this.h.onHold(true); });
    for (const ev of ["pointerup", "pointercancel", "pointerleave"]) this.btn.addEventListener(ev, () => this.h.onHold(false));
    addEventListener("keydown", e => { if (e.repeat) return; if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); if (this.state === "run") this.h.onHold(true); } });
    addEventListener("keyup", e => { if (e.code === "Space" || e.code === "ArrowUp") this.h.onHold(false); });
    // cash out. pointerdown, ոչ click — երկրորդ մատի tap-ը (մինչ առաջինը hold-ի վրա ա) click չի սինթեզում
    this.co.addEventListener("pointerdown", e => { e.stopPropagation(); e.preventDefault(); this.h.onCashOut(); });
    this.co.addEventListener("click", e => { e.preventDefault(); this.h.onCashOut(); });
    // պատմություն
    this.histPills = $("histpills"); this.histGrid = $("histgrid");
    const modal = $("histmodal"), back = $("histback"), more = $("histmore");
    const toggle = (open) => { modal.classList.toggle("open", open); back.classList.toggle("open", open); more.classList.toggle("open", open); };
    more.onclick = () => toggle(!modal.classList.contains("open"));
    back.onclick = () => toggle(false); $("histclose").onclick = () => toggle(false);
    this.renderHist();
    addEventListener("resize", () => this.measure());
    this.drawBet();
    requestAnimationFrame(() => this.measure());
  }
  drawBet() { this.betAmt.textContent = "$" + this.bet; }
  setMult(m, crashed) { this.multEl.textContent = m.toFixed(2) + "x"; this.multEl.classList.toggle("crashed", !!crashed); }
  setState(t) { this.stateEl.textContent = t; }
  setVignette(k) { this.vig.style.opacity = k * .9; }
  active(on) { this.btn.classList.toggle("active", on); }

  /* ---- cash out կոճակ ---- */
  cashoutShow(on) { this.co.classList.toggle("show", on); }
  cashoutAmount(v) { this.coAmt.textContent = "$" + v.toFixed(2); }
  cashoutReset() { this.co.classList.remove("won"); this.coLbl.textContent = "CASH OUT"; }
  cashoutWon(v) { this.co.classList.add("won"); this.coLbl.textContent = "✓ WON"; this.coAmt.textContent = "+$" + v.toFixed(2); }

  /* ---- պատմություն ---- */
  pushResult(m, win) { this.hist.unshift({ m, win }); if (this.hist.length > this.HIST_MAX) this.hist.pop(); this.renderHist(); }
  renderHist() {
    const pill = r => `<span class="hpill ${r.win ? "w" : "l"}">${r.m.toFixed(2)}x</span>`;
    this.histPills.innerHTML = this.hist.slice(0, 6).map(pill).join("");
    this.histGrid.innerHTML = this.hist.map(pill).join("") || '<span class="hempty">Դեռ ավարտված ռաունդ չկա</span>';
  }

  /* ---- bet ↔ run մորֆ (պրոտոյի measureMorph/applyMorph/syncBtn) ---- */
  measure() {
    this.btn.style.width = "";
    this._w.run = this.btn.offsetWidth; this._w.btnH = this.btn.offsetHeight;
    this._w.stackH = this.betStack.offsetHeight;
    this._w.bet = Math.max(this.betStack.offsetWidth, this._w.run);
    this.applyMorph(false);
  }
  _syncBtn() {
    const bet = this.state === "bet";
    this.btn.style.width = (bet ? this._w.bet : this._w.run) + "px";
    this.lbl.bet.classList.toggle("off", this.state !== "bet");
    this.lbl.run.classList.toggle("off", this.state !== "run");
    this.lbl.lost.classList.toggle("off", this.state !== "lost");
  }
  applyMorph(animate = true) {
    const bet = this.state === "bet", bm = this.betMorph;
    if (!animate) { bm.style.transition = "none"; this.btn.style.transition = "none"; }
    bm.classList.toggle("run", this.state === "run");
    bm.classList.toggle("lost", this.state === "lost");
    bm.style.width = (bet ? this._w.bet : this._w.run) + "px";
    bm.style.height = (bet ? this._w.stackH + 10 + this._w.btnH : this._w.btnH) + "px";
    clearTimeout(this._morphTO);
    // stake-զոնան առաջինն ա փլվում, կոճակը մի beat ուշ ա մորֆվում; ետդարձը՝ միասին
    if (animate && !bet) this._morphTO = setTimeout(() => this._syncBtn(), 160);
    else this._syncBtn();
    if (!animate) { void bm.offsetWidth; bm.style.transition = ""; this.btn.style.transition = ""; }
  }
  showBet() { this.state = "bet"; this.applyMorph(); this.setState("place your bet"); }
  showRun() { this.state = "run"; this.applyMorph(); this.setState("idle"); }
  showLost() { this.state = "lost"; this.applyMorph(); this.setState("caught"); }
}
