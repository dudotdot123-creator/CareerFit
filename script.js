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
    passions: ["Science & Research", "Math & Engineering", "Health & Medicine", "Technology & Innovation"],
    skills: ["General Chemistry", "General Physics", "Capstone Research"]
  },
  ABM: {
    icon: "💰",
    theme: "abm",
    bg: "abm",
    passions: ["Business & Entrepreneurship", "Finance & Accounting", "Marketing & Sales", "Economics & Management"],
    skills: ["Fundamentals of Accountancy, Business & Management", "Applied Economics", "Business Finance", "Business Ethics", "Business Simulation"]
  },
  HUMSS: {
    icon: "📚",
    theme: "humss",
    bg: "humss",
    passions: ["Writing & Creative Works", "Social Sciences & Culture", "Politics & Public Service", "Community & Social Development"],
    skills: ["Creative Nonfiction", "Introduction to World Religions & Belief Systems", "Philippine Politics & Governance", "Community Engagement, Solidarity & Citizenship", "Culminating Activity"]
  },
  ICT: {
    icon: "💻",
    theme: "ict",
    bg: "ict",
    passions: ["Programming & Software", "Graphic Design & Animation", "Computer Systems & Servicing", "Digital Media & Technology"],
    skills: ["Java Programming", "Visual Graphic Design", "Animation", "Computer Systems Servicing", "Work Immersion"]
  },
  "Home Economics": {
    icon: "🏠",
    theme: "home-economics",
    bg: "home-economics",
    passions: ["Bread & Pastry Production", "Housekeeping & Hospitality", "Culinary & Food Services", "Home Management & Caregiving"],
    skills: ["Housekeeping", "Bread and Pastry Production", "Work Immersion"]
  }
};

const courses = [
  { name: "AB History", strands: ["HUMSS"], cost: 1, passions: ["Social Sciences & Culture", "Writing & Creative Works"], skills: ["Creative Nonfiction", "Introduction to World Religions & Belief Systems", "Culminating Activity"], description: "Study the past to understand people, culture, and society." },
  { name: "AB Philosophy", strands: ["HUMSS"], cost: 1, passions: ["Social Sciences & Culture", "Writing & Creative Works"], skills: ["Introduction to World Religions & Belief Systems", "Creative Nonfiction"], description: "Explore ideas about knowledge, ethics, and how people live." },
  { name: "BFA Industrial Design", strands: ["ICT", "HUMSS", "Home Economics"], cost: 2, passions: ["Graphic Design & Animation", "Writing & Creative Works", "Home Management & Caregiving"], skills: ["Visual Graphic Design", "Creative Nonfiction", "Work Immersion"], description: "Design everyday products that are useful and well made." },
  { name: "BFA Painting", strands: ["ICT", "HUMSS"], cost: 2, passions: ["Graphic Design & Animation", "Writing & Creative Works"], skills: ["Visual Graphic Design", "Creative Nonfiction"], description: "Create original paintings and develop your artistic voice." },
  { name: "BFA Sculpture", strands: ["ICT", "HUMSS"], cost: 2, passions: ["Graphic Design & Animation", "Writing & Creative Works"], skills: ["Visual Graphic Design", "Creative Nonfiction"], description: "Shape three-dimensional art from different materials." },
  { name: "BFA Visual Communication", strands: ["ICT", "HUMSS"], cost: 2, passions: ["Graphic Design & Animation", "Digital Media & Technology", "Writing & Creative Works"], skills: ["Visual Graphic Design", "Animation", "Creative Nonfiction"], description: "Create visual concepts, artwork, and communication designs." },
  { name: "AB Economics", strands: ["HUMSS", "ABM"], cost: 1, passions: ["Economics & Management", "Social Sciences & Culture", "Politics & Public Service"], skills: ["Applied Economics", "Philippine Politics & Governance"], description: "Study how people, businesses, and governments use resources." },
  { name: "BS Economics", strands: ["ABM", "HUMSS"], cost: 1, passions: ["Economics & Management", "Finance & Accounting", "Business & Entrepreneurship"], skills: ["Applied Economics", "Business Finance"], description: "Analyze markets, money, and policies using data and theory." },
  { name: "AB Psychology", strands: ["HUMSS"], cost: 1, passions: ["Social Sciences & Culture", "Community & Social Development"], skills: ["Community Engagement, Solidarity & Citizenship", "Introduction to World Religions & Belief Systems", "Culminating Activity"], description: "Understand human behavior, thinking, and feelings." },
  { name: "BS Psychology", strands: ["HUMSS", "Home Economics"], cost: 1, passions: ["Social Sciences & Culture", "Community & Social Development", "Home Management & Caregiving"], skills: ["Community Engagement, Solidarity & Citizenship", "Culminating Activity", "Work Immersion"], description: "Study behavior and mental processes using science and research." },
  { name: "BS Criminology", strands: ["HUMSS"], cost: 1, passions: ["Politics & Public Service", "Community & Social Development"], skills: ["Philippine Politics & Governance", "Community Engagement, Solidarity & Citizenship"], description: "Study crime, justice, and community safety." },
  { name: "AB Political Science", strands: ["HUMSS"], cost: 1, passions: ["Politics & Public Service", "Social Sciences & Culture"], skills: ["Philippine Politics & Governance", "Culminating Activity"], description: "Study government, politics, and public policy." },
  { name: "AB English", strands: ["HUMSS"], cost: 1, passions: ["Writing & Creative Works", "Social Sciences & Culture"], skills: ["Creative Nonfiction", "Culminating Activity"], description: "Study the English language, communication, and writing." },
  { name: "AB Linguistics", strands: ["HUMSS"], cost: 1, passions: ["Writing & Creative Works", "Social Sciences & Culture"], skills: ["Creative Nonfiction", "Culminating Activity"], description: "Study how language works and how people use it." },
  { name: "AB Literature", strands: ["HUMSS"], cost: 1, passions: ["Writing & Creative Works", "Social Sciences & Culture"], skills: ["Creative Nonfiction", "Culminating Activity"], description: "Read, analyze, and write about literary works." },
  { name: "AB Anthropology", strands: ["HUMSS"], cost: 1, passions: ["Social Sciences & Culture", "Community & Social Development"], skills: ["Community Engagement, Solidarity & Citizenship", "Introduction to World Religions & Belief Systems"], description: "Study people, cultures, and how societies change." },
  { name: "AB Sociology", strands: ["HUMSS"], cost: 1, passions: ["Social Sciences & Culture", "Community & Social Development"], skills: ["Community Engagement, Solidarity & Citizenship", "Introduction to World Religions & Belief Systems", "Culminating Activity"], description: "Study groups, communities, and social change." },
  { name: "AB Filipino", strands: ["HUMSS"], cost: 1, passions: ["Writing & Creative Works", "Social Sciences & Culture"], skills: ["Creative Nonfiction", "Culminating Activity"], description: "Study Filipino language, literature, and communication." },
  { name: "BS Forensic Science", strands: ["STEM"], cost: 2, passions: ["Science & Research", "Health & Medicine"], skills: ["General Chemistry", "Capstone Research"], description: "Use science to help investigate crimes and examine evidence." },
  { name: "AB Islamic Studies", strands: ["HUMSS"], cost: 1, passions: ["Social Sciences & Culture", "Community & Social Development"], skills: ["Introduction to World Religions & Belief Systems", "Community Engagement, Solidarity & Citizenship"], description: "Study Islamic beliefs, history, and culture." },
  { name: "BS Environmental Science", strands: ["STEM"], cost: 1, passions: ["Science & Research"], skills: ["General Chemistry", "Capstone Research"], description: "Study the environment and find solutions to ecological problems." },
  { name: "BS Forestry", strands: ["STEM"], cost: 1, passions: ["Science & Research"], skills: ["Capstone Research", "General Chemistry"], description: "Protect and manage forests and natural resources." },
  { name: "BS Fisheries", strands: ["STEM"], cost: 1, passions: ["Science & Research"], skills: ["General Chemistry", "Capstone Research"], description: "Study and manage fish, aquatic resources, and coastal areas." },
  { name: "BS Geology", strands: ["STEM"], cost: 2, passions: ["Science & Research", "Math & Engineering"], skills: ["General Physics", "General Chemistry"], description: "Study the earth, rocks, minerals, and natural hazards." },
  { name: "BS Biology", strands: ["STEM"], cost: 1, passions: ["Science & Research", "Health & Medicine"], skills: ["General Chemistry", "Capstone Research"], description: "Study living things, from cells to ecosystems." },
  { name: "BS Molecular Biology", strands: ["STEM"], cost: 2, passions: ["Science & Research", "Health & Medicine"], skills: ["General Chemistry", "Capstone Research"], description: "Study life at the level of cells, genes, and molecules." },
  { name: "BS Physics", strands: ["STEM"], cost: 1, passions: ["Science & Research", "Math & Engineering"], skills: ["General Physics", "Capstone Research"], description: "Study matter, energy, and the laws of nature." },
  { name: "BS Applied Physics", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Science & Research", "Technology & Innovation"], skills: ["General Physics", "Capstone Research"], description: "Use physics to solve problems in technology and industry." },
  { name: "BS Chemistry", strands: ["STEM"], cost: 2, passions: ["Science & Research", "Health & Medicine"], skills: ["General Chemistry", "Capstone Research"], description: "Study substances, reactions, and materials in the laboratory." },
  { name: "BS Computer Science", strands: ["STEM", "ICT"], cost: 1, passions: ["Programming & Software", "Computer Systems & Servicing", "Technology & Innovation"], skills: ["Java Programming", "Computer Systems Servicing", "General Physics", "Capstone Research"], description: "Learn programming, algorithms, and how software works." },
  { name: "BS Information Technology", strands: ["STEM", "ICT"], cost: 1, passions: ["Programming & Software", "Computer Systems & Servicing", "Digital Media & Technology", "Technology & Innovation"], skills: ["Java Programming", "Computer Systems Servicing", "Work Immersion", "Capstone Research"], description: "Build, manage, and support computer systems and applications." },
  { name: "BS Information Systems", strands: ["STEM", "ICT"], cost: 1, passions: ["Programming & Software", "Digital Media & Technology", "Technology & Innovation"], skills: ["Java Programming", "Work Immersion", "Capstone Research"], description: "Connect technology with business needs and information management." },
  { name: "BS Mathematics", strands: ["STEM"], cost: 1, passions: ["Math & Engineering", "Science & Research"], skills: ["General Physics", "Capstone Research"], description: "Study numbers, patterns, and logical reasoning." },
  { name: "BS Applied Mathematics", strands: ["STEM"], cost: 1, passions: ["Math & Engineering", "Science & Research", "Technology & Innovation"], skills: ["General Physics", "Capstone Research"], description: "Use mathematics to solve real problems in science and industry." },
  { name: "BS Statistics", strands: ["STEM", "ABM"], cost: 1, passions: ["Math & Engineering", "Science & Research", "Economics & Management", "Finance & Accounting"], skills: ["Capstone Research", "Applied Economics", "Business Finance"], description: "Collect and analyze data to support decisions." },
  { name: "BS Agriculture", strands: ["STEM", "Home Economics"], cost: 1, passions: ["Science & Research", "Culinary & Food Services", "Bread & Pastry Production"], skills: ["General Chemistry", "Work Immersion", "Bread and Pastry Production"], description: "Learn how crops and farm animals are grown and managed." },
  { name: "BS Agribusiness", strands: ["ABM", "Home Economics"], cost: 1, passions: ["Business & Entrepreneurship", "Marketing & Sales", "Culinary & Food Services", "Housekeeping & Hospitality"], skills: ["Business Finance", "Business Ethics", "Work Immersion", "Housekeeping"], description: "Run and manage businesses in farming and food products." },
  { name: "BS Agroforestry", strands: ["STEM"], cost: 1, passions: ["Science & Research"], skills: ["General Chemistry", "Capstone Research"], description: "Combine farming and forestry for sustainable land use." },
  { name: "BS Architecture", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Technology & Innovation"], skills: ["General Physics", "Capstone Research"], description: "Design buildings and spaces for people and communities." },
  { name: "B Landscape Architecture", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Science & Research"], skills: ["General Physics", "Capstone Research"], description: "Plan and design outdoor environments and landscapes." },
  { name: "BS Interior Design", strands: ["STEM", "Home Economics"], cost: 2, passions: ["Math & Engineering", "Technology & Innovation", "Housekeeping & Hospitality", "Home Management & Caregiving"], skills: ["General Physics", "Capstone Research", "Housekeeping", "Work Immersion"], description: "Plan and design comfortable and attractive indoor spaces." },
  { name: "BS Accountancy", strands: ["ABM"], cost: 2, passions: ["Finance & Accounting", "Economics & Management"], skills: ["Fundamentals of Accountancy, Business & Management", "Business Finance"], description: "Work with financial records, reports, and decisions." },
  { name: "BS Accounting Technology", strands: ["ABM", "Home Economics"], cost: 1, passions: ["Finance & Accounting", "Economics & Management", "Home Management & Caregiving"], skills: ["Fundamentals of Accountancy, Business & Management", "Business Finance", "Work Immersion"], description: "Handle accounting records and systems for businesses." },
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

// IT / technology courses: ICT-tagged programs and the BIT technology programs
function isTechCourse(course) {
  return course.strands.includes("ICT") || /^BIT /.test(course.name);
}

function scoreCourse(course) {
  const financial = financialScore(course);
  const passion = course.passions.includes(profile.passion) ? 100 : 35;
  const skills = course.skills.includes(profile.skill) ? 100 : 35;
  const total = Math.round(financial * 0.30 + passion * 0.35 + skills * 0.35);
  const reasons = [];
  reasons.push(course.passions.includes(profile.passion) ? "matches your passion" : "offers a related interest area");
  reasons.push(course.skills.includes(profile.skill) ? "matches your strongest skill" : "can develop your selected skill");
  reasons.push(financial >= 70 ? "fits your budget preference" : "needs careful tuition planning");
  return { course, total, reasons };
}

function makeRecommendations() {
  let possibleCourses = courses.filter((course) => course.strands.includes(profile.strand));
  const isSTEM = profile.strand === "STEM";
  let wantsTech = false;
  if (isSTEM) {
    // STEM students see IT courses only when they chose Technology & Innovation (and not General Physics).
    // Otherwise they see science and engineering courses only.
    wantsTech = profile.passion === "Technology & Innovation" && profile.skill !== "General Physics";
    possibleCourses = possibleCourses.filter((course) => isTechCourse(course) === wantsTech);
  }
  const ranked = possibleCourses.map(scoreCourse).sort((a, b) => b.total - a.total);
  const top = ranked.slice(0, 3);
  // STEM students leaning to engineering, design, or technology should receive the Architecture course
  if (isSTEM && !wantsTech && ["Math & Engineering", "Technology & Innovation"].includes(profile.passion) &&
      !top.some((r) => r.course.name === "BS Architecture")) {
    const arch = ranked.find((r) => r.course.name === "BS Architecture");
    if (arch) { top[top.length - 1] = arch; top.sort((x, y) => y.total - x.total); }
  }
  return top;
}

// STEM students who chose Technology & Innovation: how well IT courses fit their interest and abilities (income not included)
let lastITFit = null;
function itFitForSTEM() {
  if (profile.strand !== "STEM" || profile.passion !== "Technology & Innovation") return null;
  const list = courses
    .filter((course) => course.strands.includes("STEM") && isTechCourse(course))
    .map((course) => ({
      course,
      percent: Math.round((course.passions.includes(profile.passion) ? 100 : 35) * 0.5 + (course.skills.includes(profile.skill) ? 100 : 35) * 0.5)
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);
  return list.length ? { percent: list[0].percent, list } : null;
}

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
  lastITFit = itFitForSTEM();
  const showList = lastITFit && !recommendedCourses.every((r) => isTechCourse(r.course));
  $("results-it").innerHTML = lastITFit ? `
    <article class="result-card it-fit">
      <div class="result-top">
        <h3>IT Course Fit</h3>
        <span class="score">${lastITFit.percent}% fit</span>
      </div>
      <p>Based on your interest in technology and your ${profile.skill} ability, IT courses fit you at ${lastITFit.percent}%. This uses your interest and abilities only, not your income.</p>
      ${showList ? `<ul>${lastITFit.list.map((x) => `<li>${x.course.name}: ${x.percent}% fit</li>`).join("")}</ul>` : ""}
    </article>` : "";
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
  const c = CLUSTERS[key];
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
  el.className = "screen"; el.id = `screen-iv-${n}`;
  el.innerHTML = `
    <p class="eyebrow">Page ${n + 3} · Part II · Factor ${n} of 7</p>
    <h2>${sec.title}</h2>
    <p class="intro-text">${sec.intro}</p>
    <p class="source-note">${sec.cite}</p>
    <form id="form-iv-${n}" novalidate>
      ${likertHTML(items)}
      <p class="form-message" id="msg-iv-${n}"></p>
      <button class="primary-button" type="submit">${last ? "See My Courses <span>✨</span>" : "Next <span>→</span>"}</button>
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
  setBackground("welcome", "default");
  setPage(1);
  showScreen("screen-welcome");
});

setBackground("welcome", "default");
setPage(1);
