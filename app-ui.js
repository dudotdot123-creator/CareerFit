// CareerFit UI layer: info carousel, swipe sidebar, navigation, auto-save, dark mode, tooltips, dashboards.
// Questions, Likert scale, scoring, and Google Sheets code stay in script.js and instrument-data.js.
(function () {
  const $ = (id) => document.getElementById(id);
  const CARDS = [
    ["Research Design", "This study uses a descriptive-developmental research design. The descriptive component determines the extent of the seven factors influencing career choice among Grade 12 students. The developmental component focuses on designing, building, and evaluating the CareerFit web-based system. The respondents are 50 Grade 12 students selected through stratified random sampling across the five academic strands."],
    ["Research Instrument", "The main instrument is a structured questionnaire divided into three parts. Part 1 gathers demographic profile including age, sex, and strand. Part 2 assesses seven factors: personal interest, skills and abilities, personality, mathematics anxiety, mathematics self-efficacy, parental involvement, job opportunities, and peer influence. Part 3 evaluates the system in terms of accuracy and relevance, adequacy and clarity, and usability and satisfaction, adapted from Alao et al. (2017). Responses use a 5-point Likert scale."],
    ["Data Collection", "Data collection begins with securing approval from school authorities and obtaining parental consent and student assent. Researchers explain the study's purpose and assure confidentiality. Students complete the survey through the CareerFit web-based platform, which guides them through the profile, assessment, and system evaluation sections. All responses are automatically recorded and stored in Google Sheets for analysis. Participation is voluntary, and all information remains confidential."],
    ["Data Analysis", "The gathered data are analyzed using descriptive statistical tools. Frequency counts and percentage summarize the demographic profile. Weighted mean determines the level of the seven career-influencing factors and the acceptability and effectiveness of CareerFit. The 5-point scale interpretation is: 4.21–5.00 = Strongly Agree, 3.41–4.20 = Agree, 2.61–3.40 = Neutral, 1.81–2.60 = Disagree, and 1.00–1.80 = Strongly Disagree."],
    ["About the Researchers & Project Goals", "CareerFit has been prepared and submitted by John Reuben Balala, Joana Caiross R. Beñoza, Alyssa Shane G. Sabido, and Aljian R. Sta Ines — Grade 12 students of Dampol 1st National High School. This work is in partial fulfillment of the requirements for the subject Inquire, Investigation, and Immersion, under the guidance of their adviser, Ms. Myra B. Generoso, MAEd, LPT, RPm, RGC. The team's shared goal is to create a helpful, accessible web-based system that supports students in making informed, confident decisions about their future college courses and career paths."]
  ];
  const SCREEN = { 1: "screen-welcome", 2: "screen-basic", 3: "screen-financial", 4: "screen-passion", 5: "screen-iv-2", 6: "screen-iv-3", 7: "screen-iv-4", 8: "screen-iv-5", 9: "screen-iv-6", 10: "screen-iv-7", 11: "screen-results", 12: "screen-evaluation", 13: "screen-thank-you" };
  const SECTIONS = [
    { name: "Home", page: 1, pages: [1] },
    { name: "Student Profile", page: 2, pages: [2, 3], step: 1 },
    { name: "Career Assessment", page: 4, pages: [4, 5, 6, 7, 8, 9, 10], step: 2 },
    { name: "Results", page: 11, pages: [11], step: 3 },
    { name: "System Evaluation", page: 12, pages: [12], step: 4 }
  ];
  const KEY = "careerfit_autosave_v1";
  let maxPage = 1, dirty = false;
  const labelFor = (n) => ({ 2: "Basic Information", 3: "Family Monthly Income", 11: "Your Recommendations", 12: "System Evaluation", 13: "Thank You" }[n] || (n >= 4 && n <= 10 ? IV_SECTIONS[n - 4].title : ""));

  // ---------- Horizontal info carousel (scroll or swipe, dots only) ----------
  const car = document.createElement("section");
  car.className = "info-carousel";
  car.setAttribute("aria-label", "Study information");
  car.innerHTML = `<div class="car-track" tabindex="0">${CARDS.map((c) => `<article class="car-card"><h3>${c[0]}</h3><p>${c[1]}</p></article>`).join("")}</div>
    <div class="car-dots">${CARDS.map((_, i) => `<span class="car-dot${i ? "" : " on"}"></span>`).join("")}</div>`;
  document.querySelector(".site-header").after(car);
  const track = car.querySelector(".car-track"), dots = [...car.querySelectorAll(".car-dot")];
  track.addEventListener("scroll", () => {
    const step = track.querySelector(".car-card").offsetWidth + 12;
    let i = Math.round(track.scrollLeft / step);
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) i = CARDS.length - 1;
    dots.forEach((d, k) => d.classList.toggle("on", k === i));
  }, { passive: true });

  // ---------- Progress label: Step X of 4, percentage completed ----------
  function decorate(n) {
    const sec = SECTIONS.find((s) => s.pages.includes(n));
    const pct = Math.round(((n - 1) / 12) * 100);
    $("progress-label").textContent = n === 13 ? "Complete · 100% completed" : `Step ${sec && sec.step ? sec.step : 0} of 4 · ${sec ? sec.name : ""} · ${pct}% completed`;
  }

  // ---------- Navigation ----------
  function rebuildProfile() {
    const v = (n) => { const e = selected(n); return e ? e.value : undefined; };
    profile.name = $("name").value.trim(); profile.age = $("age").value; profile.sex = v("sex");
    const st = v("strand"); profile.strand = STRAND_ALIASES[st] || st;
    profile.income = v("income"); profile.passion = v("passion"); profile.skill = v("skill");
    profile.iv = profile.iv || {};
    IV_SECTIONS.forEach((sec) => { const items = sectionItems(sec); if (items.every((it) => selected(it.id))) profile.iv[sec.id] = readLikert(items); });
  }
  function goTo(n) {
    if (n > maxPage) return;
    if (n === 11) { rebuildProfile(); renderResults(); }
    setPage(n, labelFor(n));
    showScreen(SCREEN[n]);
  }
  const goPrev = () => goTo(Math.max(1, currentPage - 1));
  function addPrev(anchor) {
    const row = document.createElement("div"); row.className = "nav-row";
    const prev = document.createElement("button");
    prev.type = "button"; prev.className = "secondary-button prev-btn"; prev.textContent = "← Previous";
    prev.addEventListener("click", goPrev);
    anchor.before(row); row.append(prev, anchor);
  }
  document.querySelectorAll("#app form").forEach((f) => { const b = f.querySelector('button[type="submit"]'); if (b) addPrev(b); });
  addPrev($("btn-evaluation"));

  // ---------- Swipe sidebar ----------
  const side = document.createElement("aside"); side.id = "side-nav"; side.setAttribute("aria-label", "Navigation");
  const backdrop = document.createElement("div"); backdrop.id = "side-backdrop";
  const handle = document.createElement("button"); handle.id = "side-handle"; handle.type = "button"; handle.setAttribute("aria-label", "Open menu"); handle.textContent = "›";
  document.body.append(side, backdrop, handle);
  function renderSide() {
    const pct = Math.round(((currentPage - 1) / 12) * 100);
    side.innerHTML = `<div class="side-head"><b>Menu</b><button type="button" id="side-close" aria-label="Close menu">×</button></div>
      <nav>${SECTIONS.map((s) => {
        const locked = s.page > maxPage, here = s.pages.includes(currentPage), done = maxPage > Math.max(...s.pages) && !here;
        return `<button type="button" class="side-link${here ? " here" : ""}${locked ? " locked" : ""}" data-page="${s.page}"${locked ? " disabled" : ""}><span>${locked ? "🔒" : done ? "✓" : here ? "●" : "○"}</span>${s.name}</button>`;
      }).join("")}</nav>
      <div class="side-progress"><div class="bar"><span style="width:${pct}%"></span></div><small>${pct}% completed</small></div>
      <p class="side-hint">Swipe or drag from the left edge to open, and swipe left to close. Your answers are kept when you move between sections.</p>`;
  }
  const openSide = () => { renderSide(); side.classList.add("open"); backdrop.classList.add("show"); };
  const closeSide = () => { side.classList.remove("open"); backdrop.classList.remove("show"); };
  side.addEventListener("click", (e) => {
    const link = e.target.closest(".side-link");
    if (link && !link.disabled) { closeSide(); goTo(Number(link.dataset.page)); }
    if (e.target.id === "side-close") closeSide();
  });
  backdrop.addEventListener("click", closeSide);
  handle.addEventListener("click", openSide);
  let sx = null, sy = 0, mode = null;
  const begin = (x, y) => { sx = x; sy = y; mode = side.classList.contains("open") ? "close" : x <= 24 ? "open" : null; };
  const finish = (x, y) => {
    if (sx === null) return;
    const dx = x - sx, dy = Math.abs(y - sy);
    if (mode === "open" && dx > 50 && dy < 70) openSide();
    if (mode === "close" && dx < -50 && dy < 70) closeSide();
    sx = null; mode = null;
  };
  document.addEventListener("touchstart", (e) => begin(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  document.addEventListener("touchend", (e) => finish(e.changedTouches[0].clientX, e.changedTouches[0].clientY), { passive: true });
  document.addEventListener("mousedown", (e) => begin(e.clientX, e.clientY));
  document.addEventListener("mouseup", (e) => finish(e.clientX, e.clientY));

  // ---------- Auto-save with Saved indicator ----------
  const chip = document.createElement("div"); chip.id = "save-chip"; chip.textContent = "✓ Saved"; document.body.append(chip);
  let timer, chipTimer;
  function save(show) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const v = {};
      document.querySelectorAll("#app input").forEach((i) => {
        if (i.type === "radio") { if (i.checked) v[i.name] = i.value; } else if (i.id) v["#" + i.id] = i.value;
      });
      try { localStorage.setItem(KEY, JSON.stringify({ v, max: maxPage })); } catch (e) { return; }
      if (show) { chip.classList.add("show"); clearTimeout(chipTimer); chipTimer = setTimeout(() => chip.classList.remove("show"), 1400); }
    }, 300);
  }
  const clearSave = () => { clearTimeout(timer); try { localStorage.removeItem(KEY); } catch (e) {} };
  function restore() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    if (!d || !d.v || !Object.keys(d.v).length) return;
    Object.entries(d.v).forEach(([k, val]) => { if (k[0] === "#" && $(k.slice(1))) $(k.slice(1)).value = val; });
    if (d.v.strand) { const s = document.querySelector(`input[name="strand"][value="${CSS.escape(d.v.strand)}"]`); if (s) { s.checked = true; setTheme(d.v.strand); } }
    Object.entries(d.v).forEach(([k, val]) => {
      if (k[0] === "#") return;
      const el = document.querySelector(`input[name="${k}"][value="${CSS.escape(val)}"]`);
      if (el) { el.checked = true; const o = el.closest(".option"); if (o) o.classList.add("selected"); }
    });
    maxPage = Math.max(1, Math.min(d.max || 1, 10));
    const note = document.createElement("p"); note.className = "source-note";
    note.textContent = "✓ Your saved answers on this device were restored. Open the menu (swipe from the left edge) to continue.";
    $("btn-start").before(note);
  }
  document.addEventListener("input", (e) => { if (e.target.closest("#app")) { dirty = true; save(true); } });
  document.addEventListener("change", (e) => { if (e.target.closest("#app")) { dirty = true; save(true); } });
  window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
  $("btn-restart").addEventListener("click", () => { maxPage = 1; dirty = false; clearSave(); renderSide(); });

  // ---------- Light and dark mode ----------
  const tt = document.createElement("button");
  tt.className = "sound-toggle"; tt.id = "theme-toggle"; tt.type = "button"; tt.style.right = "66px"; tt.setAttribute("aria-label", "Toggle light or dark mode");
  document.body.append(tt);
  function setDark(on) { document.documentElement.classList.toggle("dark", on); tt.textContent = on ? "☀️" : "🌙"; try { localStorage.setItem("careerfit_theme", on ? "dark" : "light"); } catch (e) {} }
  tt.addEventListener("click", () => setDark(!document.documentElement.classList.contains("dark")));
  try { setDark(localStorage.getItem("careerfit_theme") === "dark"); } catch (e) { setDark(false); }

  // ---------- Tooltips (ⓘ) ----------
  const TIPS = [
    ["Strand / Program", "Your senior high school track: STEM, ABM, HUMSS, ICT, or Home Economics."],
    ["Family Monthly Income", "The total amount your family earns in one month. It helps us suggest courses that fit your budget."],
    ["Personal Interest, Skills, and Abilities", "What you enjoy doing and what you are good at."],
    ["Personality", "Your usual traits and how you behave around other people."],
    ["Mathematics Anxiety", "Feeling nervous or worried when you do mathematics."],
    ["Mathematics Self-Efficacy", "How much you believe you can do well in mathematics."],
    ["Parental Involvement", "How much your parents or relatives take part in your choice of course."],
    ["Job Opportunities", "The jobs you can get after you finish a course."],
    ["Peer Influence", "How your friends affect your choice of course."],
    ["Accuracy and Relevance", "How correct and useful the recommendations are for you."],
    ["Adequacy and Clarity", "Whether the information is enough and easy to understand."],
    ["Usability and Satisfaction", "How easy the system is to use and how happy you are with it."]
  ];
  const tipEl = (text) => { const b = document.createElement("button"); b.type = "button"; b.className = "tip"; b.dataset.tip = text; b.setAttribute("aria-label", text); b.textContent = "ⓘ"; return b; };
  document.querySelectorAll(".screen h2, .field-label, .part-heading").forEach((el) => {
    const t = TIPS.find(([k]) => el.textContent.includes(k));
    if (t) el.append(tipEl(t[1]));
  });
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".tip");
    document.querySelectorAll(".tip.open").forEach((x) => { if (x !== t) x.classList.remove("open"); });
    if (t) t.classList.toggle("open");
  });

  // ---------- Dashboards ----------
  const interp = (m) => (m >= 4.21 ? "Strongly Agree" : m >= 3.41 ? "Agree" : m >= 2.61 ? "Neutral" : m >= 1.81 ? "Disagree" : "Strongly Disagree");
  const barRows = (rows) => rows.map((r) => `<div class="dash-row"><div class="dash-top"><span>${r.name}${r.tag ? ` <em class="dash-tag">${r.tag}</em>` : ""}</span><b>${r.mean.toFixed(2)} · ${interp(r.mean)}</b></div><div class="bar"><span style="width:${(r.mean / 5) * 100}%"></span></div></div>`).join("");
  function slot(id, after) { let d = $(id); if (!d) { d = document.createElement("div"); d.id = id; d.className = "dash"; after.after(d); } return d; }
  function renderProfileDash() {
    const box = slot("dash-profile", $("results-it"));
    const rows = IV_SECTIONS.map((sec) => {
      const items = sectionItems(sec);
      return items.every((it) => selected(it.id)) ? { id: sec.id, name: sec.title, mean: factorMean(items, readLikert(items)) } : null;
    }).filter(Boolean);
    if (!rows.length) { box.innerHTML = ""; return; }
    const strongest = rows.reduce((a, b) => (b.mean > a.mean ? b : a));
    const anx = rows.find((r) => r.id === "mathanx"), others = rows.filter((r) => r.id !== "mathanx");
    const priority = anx && anx.mean >= 3.41 ? anx : others.reduce((a, b) => (b.mean < a.mean ? b : a), others[0]);
    strongest.tag = "Strongest"; if (priority !== strongest) priority.tag = "Top priority";
    box.innerHTML = `<h3>Your Career Profile — Based on Lara (2025)</h3>
      <p class="source-note">Scores are averages from 1 to 5. <button type="button" class="tip" data-tip="Weighted mean: the average of your answers for each factor. 4.21 to 5.00 is Strongly Agree, 3.41 to 4.20 is Agree, 2.61 to 3.40 is Neutral, 1.81 to 2.60 is Disagree, and 1.00 to 1.80 is Strongly Disagree.">ⓘ</button></p>
      ${barRows(rows)}
      <p class="dash-note">💪 <b>Strongest factor:</b> ${strongest.name}</p>
      <p class="dash-note">🎯 <b>Top priority:</b> ${priority.id === "mathanx" ? "Math anxiety is high for you, so ask for math support as you prepare for college." : priority.name + " is your lowest-rated factor, so give it extra thought when choosing a course."}</p>`;
  }
  function renderEvalDash() {
    if (!lastEvaluation) return;
    const box = slot("dash-eval", document.querySelector("#screen-thank-you .intro-text"));
    const rows = EVAL_SECTIONS.map((sec) => ({ name: sec.title.replace(/^[A-C]\. /, ""), mean: factorMean(sectionItems(sec), lastEvaluation.likert) }));
    const overall = rows.reduce((s, r) => s + r.mean, 0) / rows.length;
    box.innerHTML = `<h3>System Evaluation Summary — Based on Alao et al. (2017)</h3>
      ${barRows(rows.concat([{ name: "Overall", mean: overall }]))}
      <p class="dash-note">Quick answers: accuracy <b>${lastEvaluation.accuracy}</b>, clarity <b>${lastEvaluation.clarity}</b>, satisfaction <b>${lastEvaluation.satisfaction}</b>.</p>`;
  }

  // ---------- Hooks into the existing flow ----------
  const baseSetPage = setPage, baseShowScreen = showScreen;
  setPage = function (n, label) { baseSetPage(n, label); maxPage = Math.max(maxPage, n); decorate(n); save(false); renderSide(); };
  showScreen = function (id) {
    baseShowScreen(id); closeSide();
    if (id === "screen-results") renderProfileDash();
    if (id === "screen-thank-you") { renderEvalDash(); dirty = false; clearSave(); }
  };
  restore(); decorate(currentPage); renderSide();
})();
