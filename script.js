// ---------- sound effects (off by default; 🔊 toggle turns them on) ----------
const clickSound = new Audio("click.mp3");
const nextSound = new Audio("next.mp3");
const resultsSound = new Audio("results.mp3");
const circleSound = new Audio("circle-click.mp3");
[clickSound, nextSound, resultsSound, circleSound].forEach((a) => { a.volume = 0.25; });
let soundOn = false;

// ---------- silent Google Sheets record sync ----------
// Replace this placeholder with your deployed Google Apps Script web app URL.
const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyJeu_v_ooZiY2Q1WznqhMKWxApVCMdHfBAAPHsZeykvsgthR3Uay385-xZS8Lo6Qhl/exec";

function sendProfileToGoogleSheet() {
  if (!/^https:\/\/script\.google\.com\/macros\/s\//.test(GOOGLE_SHEET_WEB_APP_URL)) return;

  const row = {
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
    ...ivFlat()
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
  { name: "BS Architecture", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Technology & Innovation"], skills: ["General Physics", "Capstone Research"], description: "Design buildings and spaces for people and communities." },
  { name: "B Fine Arts Major in Visual Communication", strands: ["ICT", "HUMSS"], cost: 2, passions: ["Graphic Design & Animation", "Writing & Creative Works"], skills: ["Visual Graphic Design", "Creative Nonfiction"], description: "Create visual concepts, artwork, and communication designs." },
  { name: "B Landscape Architecture", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Science & Research"], skills: ["General Physics", "Capstone Research"], description: "Plan and design outdoor environments and landscapes." },
  { name: "BS Environmental Planning", strands: ["STEM"], cost: 2, passions: ["Science & Research", "Math & Engineering"], skills: ["General Chemistry", "Capstone Research"], description: "Help plan sustainable and resilient communities." },
  { name: "BA Broadcasting", strands: ["HUMSS"], cost: 1, passions: ["Writing & Creative Works", "Digital Media & Technology"], skills: ["Creative Nonfiction", "Culminating Activity"], description: "Create broadcasts and media stories for different audiences." },
  { name: "BA Journalism", strands: ["HUMSS"], cost: 1, passions: ["Writing & Creative Works", "Social Sciences & Culture"], skills: ["Creative Nonfiction", "Culminating Activity"], description: "Research, write, and communicate news and public-interest stories." },
  { name: "BA Performing Arts (Theater Track)", strands: ["HUMSS"], cost: 1, passions: ["Writing & Creative Works", "Community & Social Development"], skills: ["Creative Nonfiction", "Culminating Activity"], description: "Develop performance, storytelling, and theater production skills." },
  { name: "BA English Language Studies", strands: ["HUMSS"], cost: 1, passions: ["Writing & Creative Works", "Social Sciences & Culture"], skills: ["Creative Nonfiction", "Culminating Activity"], description: "Study language, communication, and English literature." },
  { name: "BA Malikhaing Pagsulat", strands: ["HUMSS"], cost: 1, passions: ["Writing & Creative Works"], skills: ["Creative Nonfiction", "Culminating Activity"], description: "Turn ideas and experiences into creative Filipino writing." },
  { name: "BS Accountancy", strands: ["ABM"], cost: 2, passions: ["Finance & Accounting", "Economics & Management"], skills: ["Fundamentals of Accountancy, Business & Management", "Business Finance"], description: "Work with financial records, reports, and decisions." },
  { name: "BS Business Administration", strands: ["ABM"], cost: 1, passions: ["Business & Entrepreneurship", "Economics & Management"], skills: ["Business Ethics", "Business Simulation", "Applied Economics"], description: "Learn how organizations and businesses operate." },
  { name: "BS Entrepreneurship", strands: ["ABM"], cost: 1, passions: ["Business & Entrepreneurship", "Marketing & Sales"], skills: ["Business Simulation", "Business Ethics"], description: "Build ideas, ventures, and solutions for real-world needs." },
  { name: "BS Legal Management", strands: ["ABM", "HUMSS"], cost: 2, passions: ["Politics & Public Service", "Economics & Management"], skills: ["Philippine Politics & Governance", "Business Ethics"], description: "Combine business, law, governance, and organizational skills." },
  { name: "BS Civil Engineering", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Technology & Innovation"], skills: ["General Physics", "Capstone Research"], description: "Design and build structures and infrastructure." },
  { name: "BS Computer Engineering", strands: ["STEM", "ICT"], cost: 2, passions: ["Math & Engineering", "Programming & Software"], skills: ["General Physics", "Java Programming"], description: "Combine hardware, software, and engineering problem-solving." },
  { name: "BS Electrical Engineering", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Technology & Innovation"], skills: ["General Physics", "General Chemistry"], description: "Work with electrical systems, power, and technology." },
  { name: "BS Electronics Engineering", strands: ["STEM", "ICT"], cost: 2, passions: ["Technology & Innovation", "Math & Engineering"], skills: ["General Physics", "Computer Systems Servicing"], description: "Design and improve electronic and communication systems." },
  { name: "BS Industrial Engineering", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Economics & Management"], skills: ["General Physics", "Capstone Research"], description: "Improve systems, processes, productivity, and quality." },
  { name: "BS Manufacturing Engineering", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Technology & Innovation"], skills: ["General Physics", "Capstone Research"], description: "Develop efficient manufacturing processes and products." },
  { name: "BS Mechanical Engineering", strands: ["STEM"], cost: 2, passions: ["Math & Engineering", "Technology & Innovation"], skills: ["General Physics", "General Chemistry"], description: "Design machines, systems, and mechanical solutions." },
  { name: "BS Mechatronics Engineering", strands: ["STEM", "ICT"], cost: 2, passions: ["Math & Engineering", "Technology & Innovation"], skills: ["General Physics", "Computer Systems Servicing"], description: "Combine mechanics, electronics, and intelligent systems." },
  { name: "BS Hospitality Management", strands: ["Home Economics"], cost: 1, passions: ["Housekeeping & Hospitality", "Home Management & Caregiving"], skills: ["Housekeeping", "Work Immersion"], description: "Build a career in hotels, events, and guest service." },
  { name: "BS in Tourism Management (Major in Travel Operations)", strands: ["Home Economics"], cost: 1, passions: ["Housekeeping & Hospitality", "Culinary & Food Services"], skills: ["Housekeeping", "Work Immersion"], description: "Plan travel experiences and manage tourism operations." },
  { name: "BS in Tourism Management (Major in Airport Operations)", strands: ["Home Economics"], cost: 1, passions: ["Housekeeping & Hospitality", "Digital Media & Technology"], skills: ["Housekeeping", "Work Immersion"], description: "Learn service, travel, and airport operations." },
  { name: "BIT Architectural Drafting and Digital Graphics Technology", strands: ["ICT", "STEM"], cost: 1, passions: ["Graphic Design & Animation", "Math & Engineering"], skills: ["Visual Graphic Design", "Computer Systems Servicing"], description: "Create technical drawings and digital graphics for design work." },
  { name: "BIT Automotive Technology", strands: ["STEM"], cost: 1, passions: ["Technology & Innovation", "Math & Engineering"], skills: ["General Physics", "Work Immersion"], description: "Develop practical skills in vehicle systems and service." },
  { name: "BIT Climate Control Technology (HVAC)", strands: ["STEM"], cost: 1, passions: ["Technology & Innovation", "Math & Engineering"], skills: ["General Physics", "Work Immersion"], description: "Work with heating, ventilation, air-conditioning, and cooling systems." },
  { name: "BIT Computer Technology", strands: ["ICT"], cost: 1, passions: ["Computer Systems & Servicing", "Programming & Software"], skills: ["Computer Systems Servicing", "Java Programming"], description: "Install, maintain, and troubleshoot computer systems." },
  { name: "BIT Culinary and Food Processing Technology", strands: ["Home Economics"], cost: 1, passions: ["Bread & Pastry Production", "Culinary & Food Services"], skills: ["Bread and Pastry Production", "Work Immersion"], description: "Learn food preparation, processing, safety, and service." },
  { name: "BIT Electrical Technology", strands: ["STEM"], cost: 1, passions: ["Technology & Innovation", "Math & Engineering"], skills: ["General Physics", "Work Immersion"], description: "Build practical skills in electrical installation and systems." },
  { name: "BIT Electronics & Communication Technology", strands: ["ICT", "STEM"], cost: 1, passions: ["Technology & Innovation", "Computer Systems & Servicing"], skills: ["Computer Systems Servicing", "General Physics"], description: "Work with electronics, communication, and digital systems." },
  { name: "BIT Electronic Technology", strands: ["ICT", "STEM"], cost: 1, passions: ["Technology & Innovation", "Computer Systems & Servicing"], skills: ["Computer Systems Servicing", "General Physics"], description: "Build and troubleshoot electronic devices and systems." },
  { name: "BIT Mechanical Technology", strands: ["STEM"], cost: 1, passions: ["Technology & Innovation", "Math & Engineering"], skills: ["General Physics", "Work Immersion"], description: "Develop hands-on skills in mechanical tools and systems." },
  { name: "BIT Mechatronics Technology", strands: ["ICT", "STEM"], cost: 1, passions: ["Technology & Innovation", "Computer Systems & Servicing"], skills: ["Computer Systems Servicing", "General Physics"], description: "Combine mechanical, electrical, and automated technologies." },
  { name: "BIT Advanced Fabrication and Welding Technology", strands: ["STEM"], cost: 1, passions: ["Technology & Innovation", "Math & Engineering"], skills: ["General Physics", "Work Immersion"], description: "Learn fabrication, welding, and production techniques." },
  { name: "BS Information Technology", strands: ["STEM", "ICT"], cost: 1, passions: ["Technology & Innovation", "Programming & Software"], skills: ["Java Programming", "Computer Systems Servicing"], description: "Build software, websites, and digital systems." },
  { name: "BS Information Systems", strands: ["STEM", "ICT"], cost: 2, passions: ["Computer Systems & Servicing", "Digital Media & Technology"], skills: ["Computer Systems Servicing", "Work Immersion"], description: "Connect technology, systems, and real-world organizations." },
  { name: "BS Cybersecurity", strands: ["STEM", "ICT"], cost: 2, passions: ["Programming & Software", "Computer Systems & Servicing"], skills: ["Java Programming", "Computer Systems Servicing"], description: "Protect information, networks, and digital systems." },
  { name: "Bachelor of Early Childhood Education", strands: ["HUMSS"], cost: 1, passions: ["Community & Social Development", "Health & Medicine"], skills: ["Community Engagement, Solidarity & Citizenship", "Culminating Activity"], description: "Support young children's learning, growth, and development." },
  { name: "Bachelor of Elementary Education", strands: ["HUMSS"], cost: 1, passions: ["Community & Social Development", "Writing & Creative Works"], skills: ["Community Engagement, Solidarity & Citizenship", "Culminating Activity"], description: "Prepare to teach and guide elementary learners." },
  { name: "Bachelor of Secondary Education Major in English (Minor in Mandarin)", strands: ["HUMSS"], cost: 1, passions: ["Community & Social Development", "Writing & Creative Works"], skills: ["Community Engagement, Solidarity & Citizenship", "Culminating Activity"], description: "Prepare to teach English and support secondary learners." },
  { name: "Bachelor of Secondary Education Major in Filipino", strands: ["HUMSS"], cost: 1, passions: ["Community & Social Development", "Writing & Creative Works"], skills: ["Community Engagement, Solidarity & Citizenship", "Culminating Activity"], description: "Prepare to teach Filipino and support secondary learners." },
  { name: "Bachelor of Secondary Education Major in Mathematics", strands: ["HUMSS", "STEM"], cost: 1, passions: ["Community & Social Development", "Math & Engineering"], skills: ["Community Engagement, Solidarity & Citizenship", "General Physics"], description: "Prepare to teach mathematics in secondary school." },
  { name: "Bachelor of Secondary Education Major in Sciences", strands: ["HUMSS", "STEM"], cost: 1, passions: ["Community & Social Development", "Science & Research"], skills: ["Community Engagement, Solidarity & Citizenship", "General Chemistry"], description: "Prepare to teach science in secondary school." },
  { name: "Bachelor of Secondary Education Major in Social Studies", strands: ["HUMSS"], cost: 1, passions: ["Community & Social Development", "Social Sciences & Culture"], skills: ["Community Engagement, Solidarity & Citizenship", "Philippine Politics & Governance"], description: "Prepare to teach social studies in secondary school." },
  { name: "Bachelor of Secondary Education Major in Values Education", strands: ["HUMSS"], cost: 1, passions: ["Community & Social Development", "Social Sciences & Culture"], skills: ["Community Engagement, Solidarity & Citizenship", "Culminating Activity"], description: "Prepare to teach values and character formation." },
  { name: "Bachelor of Physical Education", strands: ["HUMSS", "Home Economics"], cost: 1, passions: ["Community & Social Development", "Health & Medicine"], skills: ["Work Immersion", "Community Engagement, Solidarity & Citizenship"], description: "Teach movement, fitness, sports, and healthy living." },
  { name: "Bachelor of Technical Vocational Teacher Education, Major in Food Service Management", strands: ["Home Economics", "HUMSS"], cost: 1, passions: ["Culinary & Food Services", "Community & Social Development"], skills: ["Bread and Pastry Production", "Work Immersion"], description: "Teach technical and vocational food-service skills." },
  { name: "BS Biology", strands: ["STEM"], cost: 2, passions: ["Science & Research", "Health & Medicine"], skills: ["General Chemistry", "Capstone Research"], description: "Study living systems, organisms, and scientific research." },
  { name: "BS Environmental Science (Specialization in Climate Change and Disaster Management)", strands: ["STEM"], cost: 2, passions: ["Science & Research", "Community & Social Development"], skills: ["General Chemistry", "Capstone Research"], description: "Study climate change, disaster management, and sustainability." },
  { name: "BS Environmental Science (Specialization in Pollution Control Management)", strands: ["STEM"], cost: 2, passions: ["Science & Research", "Community & Social Development"], skills: ["General Chemistry", "Capstone Research"], description: "Study pollution control, environmental protection, and sustainability." },
  { name: "BS Food Technology", strands: ["STEM", "Home Economics"], cost: 2, passions: ["Science & Research", "Culinary & Food Services"], skills: ["General Chemistry", "Work Immersion"], description: "Apply science and technology to food products and safety." },
  { name: "BS Medical Technology", strands: ["STEM"], cost: 2, passions: ["Health & Medicine", "Science & Research"], skills: ["General Chemistry", "Capstone Research"], description: "Support health care through laboratory science and testing." },
  { name: "BS Math with Specialization in Applied Statistics", strands: ["STEM", "ABM"], cost: 2, passions: ["Math & Engineering", "Economics & Management"], skills: ["General Physics", "Capstone Research"], description: "Use mathematics and statistics to understand data and decisions." },
  { name: "BS Math with Specialization in Business Application", strands: ["STEM", "ABM"], cost: 2, passions: ["Math & Engineering", "Economics & Management"], skills: ["General Physics", "Capstone Research"], description: "Apply mathematical thinking to business and organizations." },
  { name: "BS Math with Specialization in Computer Science", strands: ["STEM", "ICT"], cost: 2, passions: ["Math & Engineering", "Programming & Software"], skills: ["General Physics", "Java Programming"], description: "Combine mathematical reasoning with computing and algorithms." },
  { name: "BS Psychology", strands: ["HUMSS"], cost: 2, passions: ["Social Sciences & Culture", "Community & Social Development"], skills: ["Introduction to World Religions & Belief Systems", "Community Engagement, Solidarity & Citizenship"], description: "Understand people, behavior, and communities." },
  { name: "BS Social Work", strands: ["HUMSS"], cost: 1, passions: ["Community & Social Development", "Social Sciences & Culture"], skills: ["Community Engagement, Solidarity & Citizenship", "Culminating Activity"], description: "Support individuals, families, and communities through service." },
  { name: "Bachelor in Public Administration", strands: ["HUMSS", "ABM"], cost: 1, passions: ["Politics & Public Service", "Community & Social Development"], skills: ["Philippine Politics & Governance", "Community Engagement, Solidarity & Citizenship"], description: "Prepare for public service, governance, and administration." },
  { name: "BA in Development Studies", strands: ["HUMSS"], cost: 1, passions: ["Community & Social Development", "Politics & Public Service"], skills: ["Community Engagement, Solidarity & Citizenship", "Philippine Politics & Governance"], description: "Study social, economic, and community development." },
  { name: "Bachelor of Science in Exercise and Sports Sciences Major in Fitness and Sports Coaching", strands: ["HUMSS", "Home Economics"], cost: 2, passions: ["Health & Medicine", "Community & Social Development"], skills: ["Work Immersion", "Community Engagement, Solidarity & Citizenship"], description: "Study fitness, sports coaching, and human performance." },
  { name: "Bachelor of Science in Exercise and Sports Sciences Major in Fitness and Sports Management", strands: ["HUMSS", "Home Economics"], cost: 2, passions: ["Health & Medicine", "Economics & Management"], skills: ["Work Immersion", "Community Engagement, Solidarity & Citizenship"], description: "Study fitness, sports management, and human performance." }
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
  $("progress-wrap").style.display = pageNumber === 1 ? "none" : "block";
  $("progress-fill").style.width = `${Math.min(100, ((pageNumber - 1) / (TOTAL_STEPS - 1)) * 100)}%`;
  $("progress-label").textContent = `Step ${pageNumber} of ${TOTAL_STEPS}${label ? " · " + label : ""}`;
}

function setTheme(strand) {
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

function makeRecommendations() {
  const possibleCourses = courses.filter((course) => course.strands.includes(profile.strand));
  return possibleCourses.map((course) => {
    const financial = financialScore(course);
    const passion = course.passions.includes(profile.passion) ? 100 : 35;
    const skills = course.skills.includes(profile.skill) ? 100 : 35;
    const total = Math.round(financial * 0.30 + passion * 0.35 + skills * 0.35);
    const reasons = [];
    reasons.push(course.passions.includes(profile.passion) ? "matches your passion" : "offers a related interest area");
    reasons.push(course.skills.includes(profile.skill) ? "matches your strongest skill" : "can develop your selected skill");
    reasons.push(financial >= 70 ? "fits your budget preference" : "needs careful tuition planning");
    return { course, total, reasons };
  }).sort((a, b) => b.total - a.total).slice(0, 3);
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
  profile.strand = strand.value;
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