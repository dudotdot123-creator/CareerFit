// ---------- sound effects (off by default; 🔊 toggle turns them on) ----------
const clickSound = new Audio("click.mp3");
const nextSound = new Audio("next.mp3");
const resultsSound = new Audio("results.mp3");
const circleSound = new Audio("circle-click.mp3");
[clickSound, nextSound, resultsSound, circleSound].forEach((a) => { a.volume = 0.25; });
let soundOn = false;

// ---------- silent Google Sheets record sync ----------
// Replace this placeholder with your deployed Google Apps Script web app URL.
const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxDfHoDmJUNRf60bFWsEp3nRVIFQLhTOJ7v53bgwwgAjmG-9bkfnIgpCQC5eZoGjXrU/exec";

// One id per respondent so every autosave updates the SAME row in the sheet.
function newSessionId() {
  return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "s-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}
let sessionId = newSessionId();
let autosaveTimer = null;

// Reads every Likert circle that is currently ticked (even on pages not yet submitted).
function liveLikertAnswers() {
  const out = {};
  document.querySelectorAll(".circle input[type='radio']:checked").forEach((el) => { out[el.name] = Number(el.value); });
  return out;
}

function sendProfileToGoogleSheet(status = "completed") {
  if (!/^https:\/\/script\.google\.com\/macros\/s\//.test(GOOGLE_SHEET_WEB_APP_URL)) return;
  clearTimeout(autosaveTimer); // a late autosave must never overwrite the final save

  const row = {
    session_id: sessionId,
    status: status,
    last_page: currentPage,
    timestamp: new Date().toISOString(),
    name: profile.name,
    age: profile.age,
    sex: profile.sex,
    strand: profile.strand,
    income: INCOME_LABELS[profile.income],
    passion: profile.passion,
    skill: profile.skill,
    course1: recommendedCourses[0]?.course.name || "",
    course2: recommendedCourses[1]?.course.name || "",
    course3: recommendedCourses[2]?.course.name || "",
    ...ivFlat(),
    ...liveLikertAnswers()
  };

  // text/plain avoids a browser preflight while Apps Script still receives
  // the JSON string through e.postData.contents. Failures stay invisible.
  fetch(GOOGLE_SHEET_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(row),
    keepalive: true
  }).catch(() => {});
}

// Autosave: every circle click saves (after a short pause), and every page change saves right away.
function scheduleAutosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => sendProfileToGoogleSheet("in progress"), 2000);
}
document.addEventListener("change", (event) => {
  if (event.target.matches(".circle input[type='radio']")) scheduleAutosave();
});

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("sound-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      soundOn = !soundOn;
      toggle.textContent = soundOn ? "🔊" : "🔇";
    });
  }
});
function playClickSound() {
  if (!soundOn) return;
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {}); // ignore autoplay-block errors
}
function playCircleSound() {
  if (!soundOn) return;
  circleSound.currentTime = 0;
  circleSound.play().catch(() => {});
}
function playNextSound() {
  if (!soundOn) return;
  nextSound.currentTime = 0;
  nextSound.play().catch(() => {});
}
function playResultsSound() {
  if (!soundOn) return;
  resultsSound.currentTime = 0;
  resultsSound.play().catch(() => {});
}
document.addEventListener("change", (event) => {
  if (event.target.matches('.option input[type="radio"]')) {
    playClickSound();
  } else if (event.target.matches('.circle input[type="radio"]')) {
    playCircleSound();
  }
});

// ---------- background photo crossfade per strand ----------
const bgImages = {
  welcome: "welcome-bg.jpg",
  stem: "stem-bg.jpg",
  abm: "abm-bg.jpg",
  humss: "humss-bg.jpg",
  ict: "ict-bg.jpg",
  "home-economics": "homeec-bg.jpg"
};
const bgTints = {
  default: "linear-gradient(135deg, rgba(255,255,255,.55), rgba(245,245,250,.55))",
  stem: "linear-gradient(135deg, rgba(212,241,224,.6), rgba(152,216,176,.6))",
  abm: "linear-gradient(135deg, rgba(248,215,215,.6), rgba(232,168,168,.6))",
  humss: "linear-gradient(135deg, rgba(232,224,247,.6), rgba(196,176,232,.6))",
  ict: "linear-gradient(135deg, rgba(212,232,247,.6), rgba(148,199,232,.6))",
  "home-economics": "linear-gradient(135deg, rgba(255,242,204,.6), rgba(255,224,153,.6))"
};
let activeBgLayer = 1;
function setBackground(imageKey, tintKey) {
  const showing = document.getElementById("bg-photo-" + activeBgLayer);
  const nextLayer = activeBgLayer === 1 ? 2 : 1;
  const hidden = document.getElementById("bg-photo-" + nextLayer);
  hidden.style.backgroundImage = `url("${bgImages[imageKey]}")`;
  requestAnimationFrame(() => {
    hidden.classList.add("active");
    showing.classList.remove("active");
  });
  activeBgLayer = nextLayer;
  document.getElementById("bg-tint").style.background = bgTints[tintKey] || bgTints.default;
}

const strandInfo = {
  STEM: {
    icon: "🔬",
    theme: "stem",
    bg: "stem",
    passions: ["Healthcare & Medical Sciences", "Engineering & Architecture", "Science & Environment", "Technology & Innovation"],
    skills: ["Biology & Health Sciences", "Mathematics & Physical Sciences", "Engineering & Design", "Research & Analysis"]
  },
  ABM: {
    icon: "💰",
    theme: "abm",
    bg: "abm",
    passions: ["Business & Entrepreneurship", "Finance & Accounting", "Marketing & Management", "Economics & Analysis"],
    skills: ["Accounting & Finance", "Economics & Management", "Business Planning", "Communication & Organization"]
  },
  HUMSS: {
    icon: "📚",
    theme: "humss",
    bg: "humss",
    passions: ["Law & Public Service", "Communication & Media", "Psychology & Social Work", "Arts, Culture & Education"],
    skills: ["Language & Writing", "Social Sciences & History", "Critical Thinking & Logic", "People & Communication Skills"]
  },
  ICT: {
    icon: "💻",
    theme: "ict",
    bg: "ict",
    passions: ["Programming & Software", "Digital Media & Animation", "Data & Technology Systems", "Engineering Tech & Robotics"],
    skills: ["Coding & Programming", "Computer Systems", "Digital & Graphic Design", "Technical Problem Solving"]
  },
  "Home Economics": {
    icon: "🏠",
    theme: "home-economics",
    bg: "home-economics",
    passions: ["Culinary & Food Science", "Fashion & Design", "Hospitality & Tourism", "Home Management & Livelihood"],
    skills: ["Food Preparation & Safety", "Design & Handicrafts", "Resource Management", "Care & Hospitality Services"]
  }
};

// Course database, grouped by strand. A course only appears for the strands listed in `strands`.
// `passions` (Q7) and `skills` (Q8) are ordered from best fit to weaker fit; the order breaks ties.
// A course shared by two strands (Hospitality Management, Food Technology, Entrepreneurship) lists the
// Q7/Q8 labels of both strands, because every strand uses its own distinct labels.
const courses = [
  // ---------- STEM ----------
  { name: "BS Civil Engineering", strands: ["STEM"], cost: 2, passions: ["Engineering & Architecture", "Technology & Innovation"], skills: ["Engineering & Design", "Mathematics & Physical Sciences"], description: "Design and build roads, bridges, buildings, and water systems." },
  { name: "BS Electrical Engineering", strands: ["STEM"], cost: 2, passions: ["Engineering & Architecture", "Technology & Innovation"], skills: ["Mathematics & Physical Sciences", "Engineering & Design"], description: "Work with power systems, wiring, and electrical equipment." },
  { name: "BS Electronics Engineering", strands: ["STEM"], cost: 2, passions: ["Technology & Innovation", "Engineering & Architecture"], skills: ["Engineering & Design", "Mathematics & Physical Sciences"], description: "Design circuits, communication systems, and smart devices." },
  { name: "BS Mechanical Engineering", strands: ["STEM"], cost: 2, passions: ["Engineering & Architecture", "Technology & Innovation"], skills: ["Engineering & Design", "Mathematics & Physical Sciences"], description: "Design machines, engines, and manufacturing systems." },
  { name: "BS Architecture", strands: ["STEM"], cost: 2, passions: ["Engineering & Architecture", "Technology & Innovation"], skills: ["Engineering & Design", "Mathematics & Physical Sciences"], description: "Design buildings and spaces for people and communities." },
  { name: "BS Environmental Science", strands: ["STEM"], cost: 1, passions: ["Science & Environment"], skills: ["Research & Analysis", "Biology & Health Sciences"], description: "Study the environment and find solutions to ecological problems." },
  { name: "Bachelor of Applied Science in Laboratory Technology", strands: ["STEM"], cost: 1, passions: ["Science & Environment", "Healthcare & Medical Sciences"], skills: ["Research & Analysis", "Biology & Health Sciences"], description: "Run laboratory tests and support scientific research." },
  { name: "BS Food Technology", strands: ["STEM", "Home Economics"], cost: 1, passions: ["Science & Environment", "Technology & Innovation", "Culinary & Food Science"], skills: ["Research & Analysis", "Biology & Health Sciences", "Food Preparation & Safety"], description: "Apply science to produce safe, nutritious, and long-lasting food." },
  { name: "BS Nursing", strands: ["STEM"], cost: 2, passions: ["Healthcare & Medical Sciences"], skills: ["Biology & Health Sciences", "Research & Analysis"], description: "Care for patients and support health in hospitals and communities." },
  { name: "BS Medical Technology", strands: ["STEM"], cost: 2, passions: ["Healthcare & Medical Sciences", "Science & Environment"], skills: ["Biology & Health Sciences", "Research & Analysis"], description: "Perform laboratory tests that help doctors diagnose illness." },
  { name: "BS Pharmacy", strands: ["STEM"], cost: 2, passions: ["Healthcare & Medical Sciences", "Science & Environment"], skills: ["Biology & Health Sciences", "Mathematics & Physical Sciences"], description: "Learn how medicines are made, used, and safely given to patients." },

  // ---------- ABM ----------
  { name: "BS Accountancy", strands: ["ABM"], cost: 2, passions: ["Finance & Accounting", "Economics & Analysis"], skills: ["Accounting & Finance", "Economics & Management"], description: "Work with financial records, reports, and decisions." },
  { name: "BS Accounting Technology", strands: ["ABM"], cost: 1, passions: ["Finance & Accounting", "Business & Entrepreneurship"], skills: ["Accounting & Finance", "Business Planning"], description: "Handle accounting records and systems for businesses." },
  { name: "BS Business Management", strands: ["ABM"], cost: 1, passions: ["Marketing & Management", "Business & Entrepreneurship"], skills: ["Economics & Management", "Communication & Organization", "Business Planning"], description: "Learn to plan, organize, and lead a business." },
  { name: "BS Entrepreneurship", strands: ["ABM"], cost: 1, passions: ["Business & Entrepreneurship", "Marketing & Management"], skills: ["Business Planning", "Communication & Organization"], description: "Start and grow your own business." },
  { name: "BS Hospitality Management", strands: ["ABM", "Home Economics"], cost: 2, passions: ["Marketing & Management", "Business & Entrepreneurship", "Hospitality & Tourism", "Culinary & Food Science"], skills: ["Communication & Organization", "Business Planning", "Care & Hospitality Services", "Resource Management"], description: "Manage hotels, restaurants, and tourism services." },
  { name: "BS Economics", strands: ["ABM"], cost: 1, passions: ["Economics & Analysis", "Finance & Accounting"], skills: ["Economics & Management", "Accounting & Finance"], description: "Analyze markets, money, and policies using data and theory." },

  // ---------- HUMSS ----------
  { name: "AB History", strands: ["HUMSS"], cost: 1, passions: ["Arts, Culture & Education"], skills: ["Social Sciences & History", "Language & Writing"], description: "Study the past to understand people, culture, and society." },
  { name: "AB Philosophy", strands: ["HUMSS"], cost: 1, passions: ["Arts, Culture & Education", "Law & Public Service"], skills: ["Critical Thinking & Logic", "Social Sciences & History"], description: "Explore ideas about knowledge, ethics, and how people live." },
  { name: "AB English", strands: ["HUMSS"], cost: 1, passions: ["Communication & Media", "Arts, Culture & Education"], skills: ["Language & Writing", "People & Communication Skills"], description: "Study the English language, communication, and writing." },
  { name: "AB Linguistics", strands: ["HUMSS"], cost: 1, passions: ["Communication & Media", "Arts, Culture & Education"], skills: ["Language & Writing", "Critical Thinking & Logic"], description: "Study how language works and how people use it." },
  { name: "AB Literature", strands: ["HUMSS"], cost: 1, passions: ["Arts, Culture & Education", "Communication & Media"], skills: ["Language & Writing", "Social Sciences & History"], description: "Read, analyze, and write about literary works." },
  { name: "AB Psychology", strands: ["HUMSS"], cost: 1, passions: ["Psychology & Social Work"], skills: ["People & Communication Skills", "Critical Thinking & Logic"], description: "Understand human behavior, thinking, and feelings." },
  { name: "BS Psychology", strands: ["HUMSS"], cost: 1, passions: ["Psychology & Social Work"], skills: ["Critical Thinking & Logic", "People & Communication Skills"], description: "Study behavior and mental processes using science and research." },
  { name: "BS Criminology", strands: ["HUMSS"], cost: 1, passions: ["Law & Public Service"], skills: ["Critical Thinking & Logic", "Social Sciences & History"], description: "Study crime, justice, and community safety." },
  { name: "AB Political Science", strands: ["HUMSS"], cost: 1, passions: ["Law & Public Service"], skills: ["Social Sciences & History", "Critical Thinking & Logic"], description: "Study government, politics, and public policy." },
  { name: "AB Sociology", strands: ["HUMSS"], cost: 1, passions: ["Psychology & Social Work", "Arts, Culture & Education"], skills: ["Social Sciences & History", "People & Communication Skills"], description: "Study groups, communities, and social change." },
  { name: "AB Anthropology", strands: ["HUMSS"], cost: 1, passions: ["Arts, Culture & Education", "Psychology & Social Work"], skills: ["Social Sciences & History", "Critical Thinking & Logic"], description: "Study people, cultures, and how societies change." },
  { name: "BS Forensic Science", strands: ["HUMSS"], cost: 2, passions: ["Law & Public Service"], skills: ["Critical Thinking & Logic", "Social Sciences & History"], description: "Use science to help investigate crimes and examine evidence." },
  { name: "AB Communication", strands: ["HUMSS"], cost: 1, passions: ["Communication & Media"], skills: ["People & Communication Skills", "Language & Writing"], description: "Learn to communicate through media, speech, and public relations." },
  { name: "AB Journalism", strands: ["HUMSS"], cost: 1, passions: ["Communication & Media", "Law & Public Service"], skills: ["Language & Writing", "Social Sciences & History"], description: "Gather, write, and report news for print, broadcast, and online media." },
  { name: "Bachelor of Elementary Education", strands: ["HUMSS"], cost: 1, passions: ["Arts, Culture & Education", "Psychology & Social Work"], skills: ["People & Communication Skills", "Language & Writing"], description: "Become a teacher who guides children in the early grades." },
  { name: "Bachelor of Secondary Education", strands: ["HUMSS"], cost: 1, passions: ["Arts, Culture & Education"], skills: ["Language & Writing", "Social Sciences & History", "People & Communication Skills"], description: "Become a high school teacher in the subject you love." },

  // ---------- HE ----------
  { name: "BS Industrial Education – Home Economics", strands: ["Home Economics"], cost: 1, passions: ["Home Management & Livelihood", "Fashion & Design"], skills: ["Resource Management", "Care & Hospitality Services", "Design & Handicrafts"], description: "Teach home and livelihood skills such as cooking, sewing, and home care." },
  { name: "Bachelor of Technology in Culinary Technology", strands: ["Home Economics"], cost: 2, passions: ["Culinary & Food Science"], skills: ["Food Preparation & Safety", "Resource Management"], description: "Master professional cooking, baking, and kitchen management." },
  { name: "BS Entrepreneurship – Food & Livelihood", strands: ["Home Economics"], cost: 1, passions: ["Home Management & Livelihood", "Culinary & Food Science"], skills: ["Resource Management", "Food Preparation & Safety"], description: "Start a food business or livelihood project, from product to profit." },
  { name: "Bachelor of Technology in Apparel and Fashion", strands: ["Home Economics"], cost: 2, passions: ["Fashion & Design"], skills: ["Design & Handicrafts", "Resource Management"], description: "Design, cut, and produce clothing and fashion products." },

  // ---------- ICT ----------
  { name: "BS Computer Science", strands: ["ICT"], cost: 1, passions: ["Programming & Software", "Data & Technology Systems"], skills: ["Coding & Programming", "Technical Problem Solving"], description: "Learn programming, algorithms, and how software works." },
  { name: "BS Information Technology", strands: ["ICT"], cost: 1, passions: ["Data & Technology Systems", "Programming & Software"], skills: ["Computer Systems", "Technical Problem Solving", "Coding & Programming"], description: "Build, manage, and support computer systems and applications." },
  { name: "BS Information Systems", strands: ["ICT"], cost: 1, passions: ["Data & Technology Systems", "Programming & Software"], skills: ["Computer Systems", "Coding & Programming"], description: "Connect technology with business needs and information management." },
  { name: "Bachelor of Multimedia Arts / Graphic Technology", strands: ["ICT"], cost: 2, passions: ["Digital Media & Animation"], skills: ["Digital & Graphic Design"], description: "Create digital art, graphics, video, and visual content." },
  { name: "BS Animation", strands: ["ICT"], cost: 2, passions: ["Digital Media & Animation"], skills: ["Digital & Graphic Design", "Technical Problem Solving"], description: "Bring characters and stories to life through 2D and 3D animation." },
  { name: "BS Computer Engineering Technology", strands: ["ICT"], cost: 2, passions: ["Engineering Tech & Robotics", "Data & Technology Systems"], skills: ["Technical Problem Solving", "Computer Systems"], description: "Build and maintain computer hardware, electronics, and robotic systems." },
];

let currentPage = 1;
const TOTAL_STEPS = 13;
const INCOME_LABELS = { below: "Below ₱15,000", "15-30": "₱15,001 – ₱30,000", "30-50": "₱30,001 – ₱50,000", above: "₱50,001 and above" };
let profile = { iv: {} };
let recommendedCourses = [];
let lastEvaluation = null;

const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setPage(pageNumber, label) {
  if (currentPage && pageNumber > currentPage) playNextSound();
  currentPage = pageNumber;
  if (pageNumber >= 4 && pageNumber <= 12) sendProfileToGoogleSheet("in progress");
  $("progress-wrap").style.display = pageNumber === 1 ? "none" : "block";
  $("progress-fill").style.width = `${Math.min(100, ((pageNumber - 1) / (TOTAL_STEPS - 1)) * 100)}%`;
  $("progress-label").textContent = `Step ${pageNumber} of ${TOTAL_STEPS}${label ? " · " + label : ""}`;
}

const STRAND_ALIASES = { HE: "Home Economics" };
function setTheme(strand) {
  strand = STRAND_ALIASES[strand] || strand;
  const info = strandInfo[strand];
  document.body.className = `theme-${info.theme}`;
  document.body.dataset.themeIcon = info.icon;
  applyStrandColor(strand);
  setBackground(info.bg, info.theme);
  renderOptions("passion-options", "passion", info.passions);
  renderOptions("skills-options", "skill", info.skills);
}

function renderOptions(containerId, name, values) {
  const container = $(containerId);
  container.innerHTML = values.map((value) => `
    <label class="option">
      <input type="radio" name="${name}" value="${value}">
      <span>${value}</span>
    </label>
  `).join("");
  container.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      container.querySelectorAll(".option").forEach((option) => option.classList.remove("selected"));
      input.closest(".option").classList.add("selected");
    });
  });
}

function selected(name) {
  return document.querySelector(`input[name="${name}"]:checked`);
}

function requireAnswer(name, messageId) {
  if (!selected(name)) {
    $(messageId).textContent = "Please choose one answer before continuing.";
    return false;
  }
  $(messageId).textContent = "";
  return true;
}

function incomeLevel(income) {
  return { below: 1, "15-30": 2, "30-50": 3, above: 4 }[income];
}

function financialScore(course) {
  const budget = incomeLevel(profile.income);
  const score = Math.max(25, 100 - (course.cost - budget) * 22);
  return Math.max(20, Math.min(100, score));
}

// Q7 / Q8 match: the position of the student's answer in a course's tag list sets the strength
// (first tag = best fit). No tag match gives a low baseline so related courses can still appear.
function tagFit(tags, answer) {
  const i = tags.indexOf(answer);
  return i === -1 ? 35 : Math.max(70, 100 - i * 10);
}

function scoreCourse(course) {
  const passion = tagFit(course.passions, profile.passion);
  const skills = tagFit(course.skills, profile.skill);
  const total = Math.round(passion * 0.5 + skills * 0.5);
  const passionHit = passion > 35, skillHit = skills > 35;
  const reasons = [];
  if (passionHit && skillHit) {
    reasons.push(`Recommended because it matches your passion for ${profile.passion} and strength in ${profile.skill}`);
  } else if (passionHit) {
    reasons.push(`Recommended because it matches your passion for ${profile.passion}, and it can help you build skills in ${profile.skill}`);
  } else if (skillHit) {
    reasons.push(`Recommended because it matches your strength in ${profile.skill}, and it can grow your interest in ${profile.passion}`);
  } else {
    reasons.push(`A related course in your strand that can grow your interest in ${profile.passion} and your skills in ${profile.skill}`);
  }
  const financial = financialScore(course);
  reasons.push(financial >= 70 ? "Fits your budget preference" : "Needs careful tuition planning");
  return { course, total, reasons, financial };
}

// 1) filter by the student's strand only, 2) rank by Q7 + Q8 match (budget only breaks ties), 3) keep the top 3
function makeRecommendations() {
  return courses
    .filter((course) => course.strands.includes(profile.strand))
    .map(scoreCourse)
    .sort((a, b) => b.total - a.total || b.financial - a.financial)
    .slice(0, 3);
}

// The old STEM-only "IT Course Fit" card no longer applies: courses now come from the student's own strand.
let lastITFit = null;

function renderResults() {
  recommendedCourses = makeRecommendations();
  $("results-list").innerHTML = recommendedCourses.map((result, index) => `
    <article class="result-card">
      <div class="result-top">
        <h3>${index + 1}. ${result.course.name}</h3>
        <span class="score">${result.total}% match</span>
      </div>
      <p>${result.course.description}</p>
      <ul>${result.reasons.map((reason) => `<li>${reason}</li>`).join("")}</ul>
      ${resultDetails(result.course, index === 0)}
    </article>
  `).join("");
  lastITFit = null;
  $("results-it").innerHTML = "";
  playResultsSound();
  localStorage.setItem("careerfit_profile", JSON.stringify(profile));
  localStorage.setItem("careerfit_results", JSON.stringify(recommendedCourses.map((r) => r.course.name)));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadResponse(evaluation) {
  const data = {
    timestamp: new Date().toISOString(), name: profile.name, age: profile.age, sex: profile.sex,
    strand: profile.strand, family_income: INCOME_LABELS[profile.income],
    passion: profile.passion, skill: profile.skill
  };
  recommendedCourses.forEach((r, i) => { data[`course_${i + 1}`] = r.course.name; data[`course_${i + 1}_score`] = r.total; });
  Object.assign(data, ivFlat());
  const headers = Object.keys(data);
  const blob = new Blob([headers.join(",") + "\n" + headers.map((k) => csvEscape(data[k])).join(",")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `careerfit-response-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

document.querySelectorAll("input[type='radio']").forEach((input) => {
  input.addEventListener("change", () => input.closest(".option")?.classList.add("selected"));
});

$("btn-start").addEventListener("click", () => {
  setPage(2, "Basic Information");
  showScreen("screen-basic");
});

document.querySelectorAll("input[name='strand']").forEach((input) => {
  input.addEventListener("change", () => setTheme(input.value));
});

$("basic-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const sex = selected("sex");
  const strand = selected("strand");
  if (!$("age").value || !sex || !strand) {
    $("basic-message").textContent = "Please complete your age, sex, and strand.";
    return;
  }
  profile.name = $("name").value.trim();
  profile.age = $("age").value;
  profile.sex = sex.value;
  profile.strand = STRAND_ALIASES[strand.value] || strand.value;
  setPage(3, "Financial Capacity");
  showScreen("screen-financial");
});

$("financial-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const income = selected("income");
  if (!income) {
    $("financial-message").textContent = "Please choose your family monthly income.";
    return;
  }
  profile.income = income.value;
  setPage(4, "Personal Interest, Skills, and Abilities");
  showScreen("screen-passion");
});

// ---------- Likert helpers (clickable circles, values 1 to 5 recorded, numbers not shown) ----------
function sectionItems(sec) { return sec.items.map((text, i) => ({ id: sec.prefix + (i + 1), text, r: (sec.rev || []).includes(i) })); }
function likertHTML(items) {
  return items.map((it) => `
    <div class="likert-item">
      <p class="likert-text">${it.text}</p>
      <div class="likert-row" role="radiogroup" aria-label="${it.text.replace(/"/g, '&quot;')}">
        ${LIKERT_LABELS.map((label, i) => `<label class="circle" title="${label}"><input type="radio" name="${it.id}" value="${i + 1}" aria-label="${label}"><span></span></label>`).join("")}
      </div>
      <div class="likert-ends"><span>${LIKERT_LABELS[0]}</span><span>${LIKERT_LABELS[4]}</span></div>
    </div>`).join("");
}
function checkLikert(items, msgId) {
  const left = items.filter((it) => !selected(it.id)).length;
  $(msgId).textContent = left ? `Please answer every statement (${left} left).` : "";
  return !left;
}
function readLikert(items) {
  const out = {};
  items.forEach((it) => { out[it.id] = Number(selected(it.id).value); });
  return out;
}
function factorMean(items, answers) {
  const v = items.map((it) => (it.r ? 6 - answers[it.id] : answers[it.id]));
  return Number((v.reduce((x, y) => x + y, 0) / v.length).toFixed(2));
}
function ivFlat() {
  const flat = {};
  if (lastITFit) flat.it_fit_percent = lastITFit.percent;
  IV_SECTIONS.forEach((sec) => {
    const a = profile.iv && profile.iv[sec.id];
    if (a) { Object.assign(flat, a); flat[sec.id + "_mean"] = factorMean(sectionItems(sec), a); }
  });
  if (lastEvaluation) {
    flat.evaluation_accuracy = lastEvaluation.accuracy;
    flat.evaluation_satisfaction = lastEvaluation.satisfaction;
    flat.evaluation_clarity = lastEvaluation.clarity;
    Object.assign(flat, lastEvaluation.likert);
    EVAL_SECTIONS.forEach((sec) => { flat[sec.id + "_mean"] = factorMean(sectionItems(sec), lastEvaluation.likert); });
  }
  return flat;
}

// ---------- Results extras: Bulacan schools, tuition note, scholarships, job outlook ----------
function clusterOf(name) { const rule = CLUSTER_RULES.find(([re]) => re.test(name)); return rule ? rule[1] : "other"; }
function tuitionNote(course) {
  const range = course.cost === 1 ? "₱15,000 to ₱35,000" : "₱25,000 to ₱60,000";
  return `State universities: free tuition for qualified students under RA 10931, though other fees may apply. Private schools: roughly ${range} per semester. Estimate only.`;
}
function resultDetails(course, open) {
  const key = clusterOf(course.name);
  const c = CLUSTERS[key] || CLUSTERS.other || { outlook: "Ask your guidance counselor about job outlook for this course.", jobs: "Varies by specialization.", grants: [] };
  const schools = SCHOOLS.filter((sc) => sc.c.includes(key)).slice(0, 5);
  const list = (arr) => `<ul>${arr.map((x) => `<li>${x}</li>`).join("")}</ul>`;
  return `<details class="more"${open ? " open" : ""}>
    <summary>Schools, tuition, scholarships, and jobs</summary>
    <h4>Schools in Bulacan</h4>${schools.length ? list(schools.map((sc) => `${sc.n} (${sc.w}, ${sc.t})`)) : "<p>Ask your guidance counselor for schools that offer this course.</p>"}
    <h4>Estimated tuition</h4><p>${tuitionNote(course)}</p>
    <h4>Scholarships</h4>${list([...BASE_SCHOLARSHIPS, ...(c.grants || [])])}
    <h4>Job outlook</h4><p>${c.outlook}</p><p><strong>Possible careers:</strong> ${c.jobs}</p>
  </details>`;
}

// ---------- Part II: Factors 2 to 7 (pages 5 to 10) ----------
const interestItems = sectionItems(IV_SECTIONS[0]);
$("likert-interest").innerHTML = likertHTML(interestItems);
IV_SECTIONS.slice(1).forEach((sec, k) => {
  const n = k + 2, items = sectionItems(sec), last = n === IV_SECTIONS.length;
  const el = document.createElement("section");
  el.className = "screen card"; el.id = `screen-iv-${n}`;
  el.innerHTML = `
    <p class="eyebrow">Page ${n + 3} · Part II · Factor ${n} of 7</p>
    <h2>${sec.title}</h2>
    <p class="intro-text">${sec.intro}</p>
    <p class="source-note">${sec.cite}</p>
    <form id="form-iv-${n}" novalidate>
      ${likertHTML(items)}
      <p class="form-message" id="msg-iv-${n}"></p>
      <button class="primary-button btn-primary" type="submit">${last ? "See My Courses <span>✨</span>" : "Next <span>→</span>"}</button>
    </form>`;
  $("screen-loading").before(el);
  $(`form-iv-${n}`).addEventListener("submit", (event) => {
    event.preventDefault();
    if (!checkLikert(items, `msg-iv-${n}`)) return;
    profile.iv[sec.id] = readLikert(items);
    if (last) {
      setPage(11, "Your Recommendations");
      showScreen("screen-loading");
      setTimeout(() => { renderResults(); showScreen("screen-results"); }, 900);
    } else {
      setPage(n + 4, IV_SECTIONS[n].title);
      showScreen(`screen-iv-${n + 1}`);
    }
  });
});

$("passion-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!requireAnswer("passion", "passion-message") || !requireAnswer("skill", "passion-message") || !checkLikert(interestItems, "passion-message")) return;
  profile.passion = selected("passion").value;
  profile.skill = selected("skill").value;
  profile.iv.interest = readLikert(interestItems);
  setPage(5, IV_SECTIONS[1].title);
  showScreen("screen-iv-2");
});

$("btn-evaluation").addEventListener("click", () => {
  setPage(12, "System Evaluation");
  showScreen("screen-evaluation");
});

EVAL_SECTIONS.forEach((sec) => { $("likert-" + sec.id).innerHTML = likertHTML(sectionItems(sec)); });
const evalItems = EVAL_SECTIONS.flatMap(sectionItems);

$("evaluation-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const evaluation = { accuracy: selected("accuracy"), satisfaction: selected("satisfaction"), clarity: selected("clarity") };
  if (!evaluation.accuracy || !evaluation.satisfaction || !evaluation.clarity) {
    $("evaluation-message").textContent = "Please answer all three Yes/No style questions.";
    return;
  }
  if (!checkLikert(evalItems, "evaluation-message")) return;
  lastEvaluation = {
    accuracy: evaluation.accuracy.value,
    satisfaction: evaluation.satisfaction.value,
    clarity: evaluation.clarity.value,
    likert: readLikert(evalItems)
  };
  sendProfileToGoogleSheet();
  setPage(13, "Thank You");
  showScreen("screen-thank-you");
});

$("btn-download").addEventListener("click", () => {
  if (lastEvaluation) downloadResponse(lastEvaluation);
});

$("btn-restart").addEventListener("click", () => {
  profile = { iv: {} };
  recommendedCourses = [];
  lastEvaluation = null;
  sessionId = newSessionId();
  document.querySelectorAll("form").forEach((form) => form.reset());
  document.querySelectorAll(".option").forEach((option) => option.classList.remove("selected"));
  document.body.className = "theme-default";
  document.body.dataset.themeIcon = "✨";
  applyStrandColor(null);
  setBackground("welcome", "default");
  setPage(1);
  showScreen("screen-welcome");
});

setBackground("welcome", "default");
setPage(1);
