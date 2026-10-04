// CareerFit instrument data (survey items, results data). Plain text only.
const LIKERT_LABELS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

// Part II. Factor 1 keeps the original CareerFit questions (Q7, Q8 in index.html) and adds these supplementary items.
// rev = zero-based positions of reverse-scored items.
const IV_SECTIONS = [
  { id: "interest", prefix: "int", title: "Personal Interest, Skills, and Abilities",
    intro: "Tell us how much you agree with each statement.",
    cite: "Original CareerFit items plus supplementary items based on Lara (2025).",
    items: [
      "I enjoy learning about topics related to the course I want to take.",
      "I spend my free time on activities connected to my chosen field.",
      "I am confident that my skills are enough for my chosen course.",
      "My teachers or classmates have noticed my strengths in this field.",
      "I do well in the subjects connected to my preferred course.",
      "I am willing to practice and improve my abilities in this field."] },
  { id: "personality", prefix: "per", title: "Personality", rev: [3, 9],
    intro: "Think about how you usually are. Choose how much each statement describes you.",
    cite: "Items based on Lara (2025).",
    items: [
      "I am outgoing and enjoy being around people.",
      "I am organized and finish my tasks on time.",
      "I am curious and like trying new ideas.",
      "I am quiet and reserved around people I do not know.",
      "I am kind and care about the feelings of others.",
      "I keep working even when a task is difficult.",
      "I enjoy creative and imaginative activities.",
      "I trust others and work well in a team.",
      "I stay calm when things get stressful.",
      "I easily get worried or upset."] },
  { id: "mathanx", prefix: "ma", title: "Mathematics Anxiety", rev: [5],
    intro: "Choose how much each statement is true for you.",
    cite: "Items based on Lara (2025).",
    items: [
      "I feel nervous when I have to take a mathematics test.",
      "I get worried when I think about solving math problems.",
      "My mind goes blank when I am asked to solve a math problem in front of the class.",
      "I feel uneasy when a class needs a lot of math.",
      "I avoid activities that involve numbers or calculations.",
      "I feel relaxed when I work on math problems."] },
  { id: "mathse", prefix: "mse", title: "Mathematics Self-Efficacy", rev: [5],
    intro: "Choose how much you agree with each statement about your math ability.",
    cite: "Items based on Lara (2025).",
    items: [
      "I am confident that I can understand even the hardest math lessons.",
      "I can solve math problems on my own.",
      "I believe I can get a high grade in mathematics.",
      "I can use math in real-life situations.",
      "I can learn new math topics quickly.",
      "I doubt my ability to do well in math."] },
  { id: "parental", prefix: "par", title: "Parental Involvement", rev: [],
    intro: "Think about your parents or guardians when you answer.",
    cite: "Items based on Lara (2025).",
    items: [
      "My parents or guardians talk with me about my future course and career.",
      "My parents or guardians support my choice of course.",
      "My parents or guardians ask about my progress in school.",
      "My parents or guardians help me find information about colleges and courses.",
      "My parents or guardians encourage me to do my best.",
      "My parents or guardians pressure me to take a course they prefer."] },
  { id: "jobs", prefix: "job", title: "Job Opportunities", rev: [],
    intro: "Tell us how much job opportunities affect your choice of course.",
    cite: "Expanded from the original CareerFit job focus, with items based on Lara (2025).",
    items: [
      "I want a course with many available jobs after graduation.",
      "I consider how easy it is to find work in my community or in Bulacan.",
      "I consider the expected salary after graduation.",
      "I look for courses that offer job opportunities abroad.",
      "I consider whether a course leads to a licensure exam and a stable career.",
      "I check job trends before I choose a course.",
      "Job demand matters more to me than my personal interest."] },
  { id: "peer", prefix: "peer", title: "Peer Influence", rev: [],
    intro: "Think about your friends and classmates when you answer.",
    cite: "Items based on Lara (2025).",
    items: [
      "My friends or classmates talk with me about which courses to take.",
      "I am considering a course because my friends are taking it.",
      "I want to go to the same school as my friends.",
      "My classmates' opinions affect my choice of course.",
      "My friends encourage me to follow my own interests.",
      "I feel pressured by my peers to choose a certain course."] }
];

// Part III. System Evaluation, framework from Alao et al. (2017). The three original Yes/No questions stay in index.html.
const EVAL_SECTIONS = [
  { id: "eval_a", prefix: "ea", title: "A. Accuracy and Relevance", items: [
    "The recommended courses match my interests.",
    "The recommended courses match my skills and abilities.",
    "The recommendations are relevant to my strand and my family's financial situation.",
    "The Bulacan schools, tuition, scholarship, and job information are relevant to my needs."] },
  { id: "eval_b", prefix: "eb", title: "B. Adequacy and Clarity", items: [
    "The information given is enough to help me decide on a course.",
    "The questions were clear and easy to understand.",
    "The results were presented clearly.",
    "The questionnaire covered the factors that matter in my choice of course."] },
  { id: "eval_c", prefix: "ec", title: "C. Usability and Satisfaction", items: [
    "The system is easy to use.",
    "It was easy to move from one page to the next.",
    "I enjoyed using the system.",
    "I would use this system again or recommend it to other students.",
    "The system made me feel more confident about my choice of course."] }
];

// Results page data. Estimates only: verify before publication.
const SCHOOLS = [
  { n: "Bulacan State University", w: "Malolos and other campuses", t: "public", c: ["eng", "built", "it", "sci", "biz", "edu", "arts", "social", "hosp", "sports"] },
  { n: "Bulacan Polytechnic College", w: "Malolos", t: "public", c: ["tvet", "it", "edu", "biz", "hosp"] },
  { n: "Bulacan Agricultural State College", w: "San Ildefonso", t: "public", c: ["sci", "edu", "tvet", "biz", "it"] },
  { n: "Baliuag University", w: "Baliuag", t: "private", c: ["eng", "it", "biz", "edu", "hosp", "sci"] },
  { n: "La Consolacion University Philippines", w: "Malolos", t: "private", c: ["edu", "biz", "it", "hosp", "arts", "social"] },
  { n: "Centro Escolar University Malolos", w: "Malolos", t: "private", c: ["biz", "edu", "it", "sci"] },
  { n: "Meycauayan College", w: "Meycauayan", t: "private", c: ["biz", "it", "edu", "hosp", "tvet"] },
  { n: "STI College", w: "Malolos and Meycauayan", t: "private", c: ["it", "biz", "hosp"] }
];
const BASE_SCHOLARSHIPS = [
  "Free Higher Education (RA 10931) at state universities and colleges, for qualified students",
  "CHED Tertiary Education Subsidy (TES) and other UniFAST financial aid",
  "CHED Merit Scholarship for high-performing students",
  "Bulacan provincial and local government scholarships (ask your municipal hall)",
  "School-based academic and athletic discounts"];
const DOST_GRANT = "DOST-SEI Undergraduate Scholarship for priority science, technology, engineering, and math courses";
const CLUSTER_RULES = [
  [/Education/, "edu"], [/Engineering/, "eng"], [/Architecture|Landscape|Planning|Drafting/, "built"],
  [/Biology|Environmental Science|Food Technology|Medical Technology|Applied Statistics|Business Application/, "sci"],
  [/Information|Cybersecurity|Computer Technology|Computer Science/, "it"], [/^BIT /, "tvet"],
  [/Accountancy|Business Administration|Entrepreneurship|Legal Management|Public Administration/, "biz"],
  [/Hospitality|Tourism/, "hosp"], [/Arts|Journalism|Broadcasting|English|Malikhaing|Visual Communication/, "arts"],
  [/Psychology|Social Work|Development Studies/, "social"], [/Exercise and Sports/, "sports"]];
const CLUSTERS = {
  eng: { outlook: "Generally high demand in construction, manufacturing, power, and technology. Most programs lead to a licensure exam.", jobs: "Project engineer, design engineer, plant or maintenance engineer, technical consultant", grants: [DOST_GRANT] },
  built: { outlook: "Steady demand in construction, real estate, and design firms. Architecture and landscape architecture have licensure exams.", jobs: "Architect, drafter, site planner, design technologist", grants: [DOST_GRANT] },
  it: { outlook: "Strong and growing demand in software, IT services, BPO, and cybersecurity.", jobs: "Software or web developer, systems or network technician, IT support, security analyst", grants: [DOST_GRANT] },
  sci: { outlook: "Steady demand in laboratories, hospitals, food and manufacturing industries, research, and environmental work. Some programs lead to licensure.", jobs: "Laboratory analyst, medical technologist, researcher, food technologist, environmental officer, data analyst", grants: [DOST_GRANT] },
  tvet: { outlook: "Steady demand for skilled technologists in factories, service centers, and construction. Hands-on training supports employability.", jobs: "Technician, technologist, drafter, production or maintenance staff, supervisor" },
  biz: { outlook: "Steady demand in banks, firms, government, and startups. Accountancy leads to the CPA licensure exam.", jobs: "Accountant, auditor, business analyst, entrepreneur, administrative officer, public servant" },
  hosp: { outlook: "Steady demand in hotels, restaurants, airlines, travel agencies, and events, with opportunities abroad.", jobs: "Hotel or restaurant supervisor, travel consultant, airport ground staff, event coordinator, chef" },
  edu: { outlook: "Consistent demand for teachers in public and private schools. A teacher licensure exam is required.", jobs: "Teacher, school staff, tutor, learning-material developer", grants: ["Teacher education scholarships and grants (check CHED and DepEd announcements each year)"] },
  arts: { outlook: "Moderate demand in media, advertising, publishing, and creative industries. Portfolio and experience matter.", jobs: "Writer, journalist, broadcaster, designer, editor, content creator, performer" },
  social: { outlook: "Steady demand in schools, NGOs, government offices, and community programs. Some programs have licensure exams.", jobs: "Social worker, guidance or HR staff, community development worker, researcher" },
  sports: { outlook: "Growing demand in gyms, schools, sports programs, and wellness businesses.", jobs: "Fitness coach, sports coordinator, PE teacher, wellness trainer" },
  other: { outlook: "Demand depends on the field and location. Ask your guidance counselor for current job trends.", jobs: "Ask your guidance counselor or the school's admissions office" }
};
if (typeof module !== "undefined") module.exports = { LIKERT_LABELS, IV_SECTIONS, EVAL_SECTIONS };
