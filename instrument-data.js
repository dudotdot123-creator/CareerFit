// CareerFit instrument data (survey items, results data). Plain text only.
const LIKERT_LABELS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

// Part II. Factor 1 keeps the original CareerFit questions (Q7, Q8 in index.html) and adds these supplementary items.
// rev = zero-based positions of reverse-scored items (none in Lara 2025 as supplied).
const IV_SECTIONS = [
  { id: "interest", prefix: "int", title: "Personal Interest, Skills, and Abilities", rev: [],
    intro: "Think about the college program you will pursue. Tell us how much you agree with each statement.",
    cite: "Questions 7 and 8 are original CareerFit items. The statements below are from Lara (2025).",
    items: [
      "I am particularly interested in this program that I will pursue in college",
      "I like doing things related to the program that I would specialize in this degree",
      "To gain experience stimulates my interest in this program",
      "I see myself as competent in the program that I will pursue in college",
      "I will choose this program that I genuinely enjoy and feel motivated to learn more"] },
  { id: "personality", prefix: "per", title: "Personality", rev: [],
    intro: "Tell us how much you agree with each statement.",
    cite: "Lara (2025).",
    items: [
      "My personality fits best in my chosen program that I would take for college study",
      "My traits and understanding of them will give me an advantage in landing my desired career",
      "I am more productive in this program that I will practice due to my traits",
      "My personality should be ideal for the program that I would focus on",
      "My preferred program will serve as a training ground for acquiring my desired personality or attributes of a professional"] },
  { id: "mathanx", prefix: "ma", title: "Mathematics Anxiety", rev: [],
    intro: "Tell us how much you agree with each statement.",
    cite: "Lara (2025).",
    items: [
      "I get tense when I prepare for a mathematics test",
      "I get nervous when I have to use mathematics outside the classroom",
      "I worry that I will not be able to use mathematics in my future career when needed",
      "I worry that I will not be able to get a good grade in my mathematics subject",
      "I worry that I will not be able to do well on a mathematics test",
      "I feel stressed when listening to my mathematics instructor during class",
      "I get nervous when asking questions during mathematics class",
      "Working on mathematics homework is stressful for me",
      "I worry that I do not know enough mathematics to do well in future mathematics courses",
      "I worry I will not be able to understand mathematics lessons",
      "I worry that I will not be able to get an \"A\" in my mathematics courses",
      "I worry that I will not be able to learn well in my mathematics course",
      "I get nervous when taking a mathematics test",
      "I am afraid to give an incorrect answer during my mathematics class"] },
  { id: "mathse", prefix: "mse", title: "Mathematics Self-Efficacy", rev: [],
    intro: "Tell us how much you agree with each statement.",
    cite: "Lara (2025).",
    items: [
      "I feel confident enough to ask questions in any mathematics class",
      "I believe I can do well on a mathematics test",
      "I believe I can complete all of the assignments in a mathematics subject",
      "I believe I am the kind of person who is good at mathematics",
      "I believe I will be able to use mathematics in my future career when needed",
      "I believe I can understand the content in a mathematics course",
      "I believe I can get an \"A\" when I am in a mathematics course",
      "I believe I can learn well in a mathematics course",
      "I feel confident when taking a mathematics test",
      "I believe I am the type of person who can do mathematics",
      "I feel that I will be able to do well in future mathematics courses",
      "I believe I can do mathematics well in a mathematics course",
      "I believe I can think like a mathematician",
      "I feel confident when using mathematics outside the class"] },
  { id: "parental", prefix: "par", title: "Parental Involvement", rev: [],
    intro: "Think about your parents and relatives when you answer.",
    cite: "Lara (2025).",
    items: [
      "My parents and/or relatives took the same program that I would pursue",
      "My program choice will be made by my relatives since they will provide for the expenses",
      "My chosen program is beneficial to my parents since they may know what is best for me",
      "My parents and relatives allow me to make my own decision regarding my college program"] },
  { id: "jobs", prefix: "job", title: "Job Opportunities", rev: [],
    intro: "Tell us how much you agree with each statement.",
    cite: "Lara (2025).",
    items: [
      "There are abundant opportunities I can avail from the program I would like to pursue",
      "The program that I will choose will help me to find a suitable job opportunity easily",
      "The program that I would pursue is timely and in demand",
      "I am fully aware of the opportunities that surround the program that I am looking for",
      "My program choice is a highly paid profession"] },
  { id: "peer", prefix: "peer", title: "Peer Influence", rev: [],
    intro: "Think about your friends when you answer.",
    cite: "Lara (2025).",
    items: [
      "I choose a program according to my friend's preference",
      "My friends provide insights or ideas about the program I would like to pursue in college",
      "My friend's chosen program is an appealing profession",
      "I do not want to be separated from my friends so I will choose the same program they may select",
      "The educational background of my friend's family inspires me to pursue the program they took"] }
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
