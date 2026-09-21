// ---------- silent save to Google Sheet ----------
const SHEET_URL = "https://script.google.com/macros/s/AKfycbyPUtXaDSE6CzviVdZ7pLwutsH9IuNNcW0l8gXJnzbXY7I3PqMaKNI_U4kHYAzLH9xgZQ/exec";
const SHEET_TOKEN = "CareerFit; // must match TOKEN in Apps Script

function sendToSheet(d) {
  if (!SHEET_URL || SHEET_URL.includes("https://script.google.com/macros/s/AKfycbyPUtXaDSE6CzviVdZ7pLwutsH9IuNNcW0l8gXJnzbXY7I3PqMaKNI_U4kHYAzLH9xgZQ/exec")) return;
  try {
    fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token: SHEET_TOKEN, ...d })
    }).catch(() => {});
  } catch (e) {}
}

// ---------- sound effects (off by default; 🔊 toggle turns them on) ----------
const clickSound = new Audio("click.mp3");
const nextSound = new Audio("next.mp3");
const resultsSound = new Audio("results.mp3");
[clickSound, nextSound, resultsSound].forEach((a) => { a.volume = 0.25; });
let soundOn = false;
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
  { name: "BS Math with Speci
