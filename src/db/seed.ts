// Seed data for OCD - Pan-African platform
// Run with: npx tsx src/db/seed.ts (or via api/seed route)

import { db } from "./index";
import {
  countries,
  cities,
  skills,
  users,
  talentProfiles,
  talentSkills,
  experiences,
  portfolioItems,
  companies,
  opportunities,
  applications,
  conversations,
  messages,
} from "./schema";
import { sql } from "drizzle-orm";

// Seeded accounts use the same scrypt hashing as the real app, so the demo
// credentials are held to the same standard.
import { hashPassword } from "@/lib/auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// African countries with mapId matching our inline SVG paths
const COUNTRIES_DATA = [
  { iso2: "DZ", iso3: "DZA", name: "Algeria", nameFr: "Algérie", flag: "🇩🇿", capital: "Algiers", region: "North", mapId: "DZ", labelX: 420, labelY: 175 },
  { iso2: "AO", iso3: "AGO", name: "Angola", nameFr: "Angola", flag: "🇦🇴", capital: "Luanda", region: "Central", mapId: "AO", labelX: 460, labelY: 510 },
  { iso2: "BJ", iso3: "BEN", name: "Benin", nameFr: "Bénin", flag: "🇧🇯", capital: "Porto-Novo", region: "West", mapId: "BJ", labelX: 380, labelY: 365 },
  { iso2: "BW", iso3: "BWA", name: "Botswana", nameFr: "Botswana", flag: "🇧🇼", capital: "Gaborone", region: "Southern", mapId: "BW", labelX: 510, labelY: 595 },
  { iso2: "BF", iso3: "BFA", name: "Burkina Faso", nameFr: "Burkina Faso", flag: "🇧🇫", capital: "Ouagadougou", region: "West", mapId: "BF", labelX: 320, labelY: 320 },
  { iso2: "BI", iso3: "BDI", name: "Burundi", nameFr: "Burundi", flag: "🇧🇮", capital: "Gitega", region: "East", mapId: "BI", labelX: 580, labelY: 480 },
  { iso2: "CM", iso3: "CMR", name: "Cameroon", nameFr: "Cameroun", flag: "🇨🇲", capital: "Yaoundé", region: "Central", mapId: "CM", labelX: 470, labelY: 400 },
  { iso2: "CV", iso3: "CPV", name: "Cape Verde", nameFr: "Cap-Vert", flag: "🇨🇻", capital: "Praia", region: "West", mapId: "CV", labelX: 100, labelY: 280 },
  { iso2: "CF", iso3: "CAF", name: "Central African Republic", nameFr: "République centrafricaine", flag: "🇨🇫", capital: "Bangui", region: "Central", mapId: "CF", labelX: 500, labelY: 380 },
  { iso2: "TD", iso3: "TCD", name: "Chad", nameFr: "Tchad", flag: "🇹🇩", capital: "N'Djamena", region: "Central", mapId: "TD", labelX: 480, labelY: 300 },
  { iso2: "KM", iso3: "COM", name: "Comoros", nameFr: "Comores", flag: "🇰🇲", capital: "Moroni", region: "East", mapId: "KM", labelX: 670, labelY: 530 },
  { iso2: "CG", iso3: "COG", name: "Republic of the Congo", nameFr: "Congo", flag: "🇨🇬", capital: "Brazzaville", region: "Central", mapId: "CG", labelX: 460, labelY: 460 },
  { iso2: "CD", iso3: "COD", name: "DR Congo", nameFr: "RD Congo", flag: "🇨🇩", capital: "Kinshasa", region: "Central", mapId: "CD", labelX: 510, labelY: 460 },
  { iso2: "CI", iso3: "CIV", name: "Côte d'Ivoire", nameFr: "Côte d'Ivoire", flag: "🇨🇮", capital: "Yamoussoukro", region: "West", mapId: "CI", labelX: 270, labelY: 380 },
  { iso2: "DJ", iso3: "DJI", name: "Djibouti", nameFr: "Djibouti", flag: "🇩🇯", capital: "Djibouti", region: "East", mapId: "DJ", labelX: 670, labelY: 360 },
  { iso2: "EG", iso3: "EGY", name: "Egypt", nameFr: "Égypte", flag: "🇪🇬", capital: "Cairo", region: "North", mapId: "EG", labelX: 540, labelY: 220 },
  { iso2: "ET", iso3: "ETH", name: "Ethiopia", nameFr: "Éthiopie", flag: "🇪🇹", capital: "Addis Ababa", region: "East", mapId: "ET", labelX: 650, labelY: 380 },
  { iso2: "GA", iso3: "GAB", name: "Gabon", nameFr: "Gabon", flag: "🇬🇦", capital: "Libreville", region: "Central", mapId: "GA", labelX: 430, labelY: 450 },
  { iso2: "GM", iso3: "GMB", name: "Gambia", nameFr: "Gambie", flag: "🇬🇲", capital: "Banjul", region: "West", mapId: "GM", labelX: 170, labelY: 320 },
  { iso2: "GH", iso3: "GHA", name: "Ghana", nameFr: "Ghana", flag: "🇬🇭", capital: "Accra", region: "West", mapId: "GH", labelX: 305, labelY: 370 },
  { iso2: "GN", iso3: "GIN", name: "Guinea", nameFr: "Guinée", flag: "🇬🇳", capital: "Conakry", region: "West", mapId: "GN", labelX: 200, labelY: 340 },
  { iso2: "GW", iso3: "GNB", name: "Guinea-Bissau", nameFr: "Guinée-Bissau", flag: "🇬🇼", capital: "Bissau", region: "West", mapId: "GW", labelX: 160, labelY: 330 },
  { iso2: "KE", iso3: "KEN", name: "Kenya", nameFr: "Kenya", flag: "🇰🇪", capital: "Nairobi", region: "East", mapId: "KE", labelX: 645, labelY: 450 },
  { iso2: "LS", iso3: "LSO", name: "Lesotho", nameFr: "Lesotho", flag: "🇱🇸", capital: "Maseru", region: "Southern", mapId: "LS", labelX: 540, labelY: 640 },
  { iso2: "LR", iso3: "LBR", name: "Liberia", nameFr: "Libéria", flag: "🇱🇷", capital: "Monrovia", region: "West", mapId: "LR", labelX: 215, labelY: 380 },
  { iso2: "LY", iso3: "LBY", name: "Libya", nameFr: "Libye", flag: "🇱🇾", capital: "Tripoli", region: "North", mapId: "LY", labelX: 450, labelY: 240 },
  { iso2: "MG", iso3: "MDG", name: "Madagascar", nameFr: "Madagascar", flag: "🇲🇬", capital: "Antananarivo", region: "East", mapId: "MG", labelX: 700, labelY: 580 },
  { iso2: "MW", iso3: "MWI", name: "Malawi", nameFr: "Malawi", flag: "🇲🇼", capital: "Lilongwe", region: "Southern", mapId: "MW", labelX: 605, labelY: 555 },
  { iso2: "ML", iso3: "MLI", name: "Mali", nameFr: "Mali", flag: "🇲🇱", capital: "B Bamako", region: "West", mapId: "ML", labelX: 270, labelY: 290 },
  { iso2: "MR", iso3: "MRT", name: "Mauritania", nameFr: "Mauritanie", flag: "🇲🇷", capital: "Nouakchott", region: "West", mapId: "MR", labelX: 200, labelY: 270 },
  { iso2: "MU", iso3: "MUS", name: "Mauritius", nameFr: "Maurice", flag: "🇲🇺", capital: "Port Louis", region: "East", mapId: "MU", labelX: 730, labelY: 580 },
  { iso2: "MA", iso3: "MAR", name: "Morocco", nameFr: "Maroc", flag: "🇲🇦", capital: "Rabat", region: "North", mapId: "MA", labelX: 320, labelY: 200 },
  { iso2: "MZ", iso3: "MOZ", name: "Mozambique", nameFr: "Mozambique", flag: "🇲🇿", capital: "Maputo", region: "Southern", mapId: "MZ", labelX: 630, labelY: 600 },
  { iso2: "NA", iso3: "NAM", name: "Namibia", nameFr: "Namibie", flag: "🇳🇦", capital: "Windhoek", region: "Southern", mapId: "NA", labelX: 470, labelY: 600 },
  { iso2: "NE", iso3: "NER", name: "Niger", nameFr: "Niger", flag: "🇳🇪", capital: "Niamey", region: "West", mapId: "NE", labelX: 400, labelY: 290 },
  { iso2: "NG", iso3: "NGA", name: "Nigeria", nameFr: "Nigeria", flag: "🇳🇬", capital: "Abuja", region: "West", mapId: "NG", labelX: 410, labelY: 350 },
  { iso2: "RW", iso3: "RWA", name: "Rwanda", nameFr: "Rwanda", flag: "🇷🇼", capital: "Kigali", region: "East", mapId: "RW", labelX: 580, labelY: 470 },
  { iso2: "ST", iso3: "STP", name: "São Tomé and Príncipe", nameFr: "Sao Tomé-et-Principe", flag: "🇸🇹", capital: "São Tomé", region: "Central", mapId: "ST", labelX: 380, labelY: 460 },
  { iso2: "SN", iso3: "SEN", name: "Senegal", nameFr: "Sénégal", flag: "🇸🇳", capital: "Dakar", region: "West", mapId: "SN", labelX: 170, labelY: 300 },
  { iso2: "SC", iso3: "SYC", name: "Seychelles", nameFr: "Seychelles", flag: "🇸🇨", capital: "Victoria", region: "East", mapId: "SC", labelX: 730, labelY: 510 },
  { iso2: "SL", iso3: "SLE", name: "Sierra Leone", nameFr: "Sierra Leone", flag: "🇸🇱", capital: "Freetown", region: "West", mapId: "SL", labelX: 190, labelY: 360 },
  { iso2: "SO", iso3: "SOM", name: "Somalia", nameFr: "Somalie", flag: "🇸🇴", capital: "Mogadishu", region: "East", mapId: "SO", labelX: 710, labelY: 380 },
  { iso2: "ZA", iso3: "ZAF", name: "South Africa", nameFr: "Afrique du Sud", flag: "🇿🇦", capital: "Pretoria", region: "Southern", mapId: "ZA", labelX: 530, labelY: 650 },
  { iso2: "SS", iso3: "SSD", name: "South Sudan", nameFr: "Soudan du Sud", flag: "🇸🇸", capital: "Juba", region: "East", mapId: "SS", labelX: 600, labelY: 380 },
  { iso2: "SD", iso3: "SDN", name: "Sudan", nameFr: "Soudan", flag: "🇸🇩", capital: "Khartoum", region: "North", mapId: "SD", labelX: 580, labelY: 300 },
  { iso2: "SZ", iso3: "SWZ", name: "Eswatini", nameFr: "Eswatini", flag: "🇸🇿", capital: "Mbabane", region: "Southern", mapId: "SZ", labelX: 560, labelY: 640 },
  { iso2: "TZ", iso3: "TZA", name: "Tanzania", nameFr: "Tanzanie", flag: "🇹🇿", capital: "Dodoma", region: "East", mapId: "TZ", labelX: 625, labelY: 500 },
  { iso2: "TG", iso3: "TGO", name: "Togo", nameFr: "Togo", flag: "🇹🇬", capital: "Lomé", region: "West", mapId: "TG", labelX: 340, labelY: 365 },
  { iso2: "TN", iso3: "TUN", name: "Tunisia", nameFr: "Tunisie", flag: "🇹🇳", capital: "Tunis", region: "North", mapId: "TN", labelX: 420, labelY: 200 },
  { iso2: "UG", iso3: "UGA", name: "Uganda", nameFr: "Ouganda", flag: "🇺🇬", capital: "Kampala", region: "East", mapId: "UG", labelX: 615, labelY: 430 },
  { iso2: "ZM", iso3: "ZMB", name: "Zambia", nameFr: "Zambie", flag: "🇿🇲", capital: "Lusaka", region: "Southern", mapId: "ZM", labelX: 560, labelY: 555 },
  { iso2: "ZW", iso3: "ZWE", name: "Zimbabwe", nameFr: "Zimbabwe", flag: "🇿🇼", capital: "Harare", region: "Southern", mapId: "ZW", labelX: 570, labelY: 595 },
  { iso2: "ER", iso3: "ERI", name: "Eritrea", nameFr: "Érythrée", flag: "🇪🇷", capital: "Asmara", region: "East", mapId: "ER", labelX: 640, labelY: 350 },
  { iso2: "GQ", iso3: "GNQ", name: "Equatorial Guinea", nameFr: "Guinée équatoriale", flag: "🇬🇾", capital: "Malabo", region: "Central", mapId: "GQ", labelX: 520, labelY: 470 },
  { iso2: "EH", iso3: "ESH", name: "Western Sahara", nameFr: "Sahara occidental", flag: "🇪🇭", capital: "El Aaiún", region: "North", mapId: "EH", labelX: 250, labelY: 250 },
];

const CITIES_DATA = [
  { name: "Cotonou", countryIso2: "BJ" },
  { name: "Porto-Novo", countryIso2: "BJ" },
  { name: "Lomé", countryIso2: "TG" },
  { name: "Accra", countryIso2: "GH" },
  { name: "Lagos", countryIso2: "NG" },
  { name: "Abuja", countryIso2: "NG" },
  { name: "Dakar", countryIso2: "SN" },
  { name: "Abidjan", countryIso2: "CI" },
  { name: "Douala", countryIso2: "CM" },
  { name: "Yaoundé", countryIso2: "CM" },
  { name: "Nairobi", countryIso2: "KE" },
  { name: "Kigali", countryIso2: "RW" },
  { name: "Cape Town", countryIso2: "ZA" },
  { name: "Johannesburg", countryIso2: "ZA" },
  { name: "Kinshasa", countryIso2: "CD" },
  { name: "Addis Ababa", countryIso2: "ET" },
  { name: "Cairo", countryIso2: "EG" },
  { name: "Casablanca", countryIso2: "MA" },
  { name: "Tunis", countryIso2: "TN" },
  { name: "Algiers", countryIso2: "DZ" },
  { name: "Bamako", countryIso2: "ML" },
  { name: "Ouagadougou", countryIso2: "BF" },
  { name: "Kampala", countryIso2: "UG" },
  { name: "Dar es Salaam", countryIso2: "TZ" },
  { name: "Maputo", countryIso2: "MZ" },
  { name: "Luanda", countryIso2: "AO" },
  { name: "Brazzaville", countryIso2: "CG" },
  { name: "Libreville", countryIso2: "GA" },
  { name: "Niamey", countryIso2: "NE" },
  { name: "Conakry", countryIso2: "GN" },
];

const SKILLS_DATA = [
  { name: "React", category: "TECHNOLOGY" },
  { name: "Next.js", category: "TECHNOLOGY" },
  { name: "TypeScript", category: "TECHNOLOGY" },
  { name: "JavaScript", category: "TECHNOLOGY" },
  { name: "Node.js", category: "TECHNOLOGY" },
  { name: "NestJS", category: "TECHNOLOGY" },
  { name: "PostgreSQL", category: "TECHNOLOGY" },
  { name: "Python", category: "TECHNOLOGY" },
  { name: "Django", category: "TECHNOLOGY" },
  { name: "PHP", category: "TECHNOLOGY" },
  { name: "Laravel", category: "TECHNOLOGY" },
  { name: "Java", category: "TECHNOLOGY" },
  { name: "Kotlin", category: "TECHNOLOGY" },
  { name: "Swift", category: "TECHNOLOGY" },
  { name: "Flutter", category: "TECHNOLOGY" },
  { name: "React Native", category: "TECHNOLOGY" },
  { name: "Go", category: "TECHNOLOGY" },
  { name: "Rust", category: "TECHNOLOGY" },
  { name: "Docker", category: "TECHNOLOGY" },
  { name: "Kubernetes", category: "TECHNOLOGY" },
  { name: "AWS", category: "TECHNOLOGY" },
  { name: "Figma", category: "DESIGN" },
  { name: "Adobe XD", category: "DESIGN" },
  { name: "UI Design", category: "DESIGN" },
  { name: "UX Design", category: "DESIGN" },
  { name: "Graphic Design", category: "DESIGN" },
  { name: "Illustration", category: "DESIGN" },
  { name: "Motion Design", category: "DESIGN" },
  { name: "Branding", category: "DESIGN" },
  { name: "Marketing Digital", category: "MARKETING" },
  { name: "SEO", category: "MARKETING" },
  { name: "Content Marketing", category: "MARKETING" },
  { name: "Social Media", category: "MARKETING" },
  { name: "Community Management", category: "MARKETING" },
  { name: "Public Relations", category: "MARKETING" },
  { name: "Sales", category: "BUSINESS" },
  { name: "Business Development", category: "BUSINESS" },
  { name: "Project Management", category: "BUSINESS" },
  { name: "Product Management", category: "BUSINESS" },
  { name: "Agile", category: "BUSINESS" },
  { name: "Scrum", category: "BUSINESS" },
  { name: "Finance", category: "FINANCE" },
  { name: "Accounting", category: "FINANCE" },
  { name: "Bookkeeping", category: "FINANCE" },
  { name: "Translation", category: "COMMUNICATION" },
  { name: "Copywriting", category: "COMMUNICATION" },
  { name: "Journalism", category: "COMMUNICATION" },
  { name: "Photography", category: "CREATIVE" },
  { name: "Videography", category: "CREATIVE" },
  { name: "Music Production", category: "CREATIVE" },
  { name: "Teaching", category: "EDUCATION" },
  { name: "Tutoring", category: "EDUCATION" },
  { name: "Curriculum Design", category: "EDUCATION" },
  { name: "Nursing", category: "HEALTH" },
  { name: "Public Health", category: "HEALTH" },
  { name: "Electrical Engineering", category: "ENGINEERING" },
  { name: "Civil Engineering", category: "ENGINEERING" },
  { name: "Mechanical Engineering", category: "ENGINEERING" },
  { name: "Architecture", category: "ENGINEERING" },
  { name: "Carpentry", category: "CRAFT" },
  { name: "Tailoring", category: "CRAFT" },
  { name: "Pottery", category: "CRAFT" },
  { name: "Cooking", category: "CRAFT" },
  { name: "Baking", category: "CRAFT" },
  { name: "Agriculture", category: "AGRICULTURE" },
  { name: "Legal Consulting", category: "LEGAL" },
  { name: "Human Resources", category: "BUSINESS" },
  { name: "Customer Service", category: "COMMUNICATION" },
  { name: "Data Analysis", category: "TECHNOLOGY" },
  { name: "Machine Learning", category: "TECHNOLOGY" },
  { name: "DevOps", category: "TECHNOLOGY" },
  { name: "Cybersecurity", category: "TECHNOLOGY" },
];

const TALENTS_DATA = [
  {
    email: "graca.onesim@bovan.dev",
    firstName: "Grâce",
    lastName: "Onesim",
    headline: "Développeur Web Full Stack",
    profession: "Développeur",
    country: "BJ",
    city: "Cotonou",
    availability: "AVAILABLE",
    experienceLevel: "MID",
    yearsExperience: 4,
    bio: "Développeur passionné par les technologies web modernes. Spécialisé en React, Next.js et Node.js. Je cherche à contribuer à des projets ambitieux sur le continent africain.",
    remotePreference: "ANY",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    experiences: [
      { company: "TechBenin", position: "Développeur Full Stack", years: 3, current: true },
      { company: "StartupLomé", position: "Développeur Front-end", years: 1, current: false },
    ],
    portfolio: [
      { title: "Employra RH", category: "SaaS", tech: ["Next.js", "NestJS", "PostgreSQL"] },
      { title: "AgriMarket", category: "E-commerce", tech: ["React", "Node.js"] },
    ],
  },
  {
    email: "aisha.diallo@bovan.dev",
    firstName: "Aisha",
    lastName: "Diallo",
    headline: "UX/UI Designer & Researcher",
    profession: "Designer",
    country: "SN",
    city: "Dakar",
    availability: "OPEN_TO_OPPORTUNITIES",
    experienceLevel: "SENIOR",
    yearsExperience: 7,
    bio: "Designer senior avec 7 ans d'expérience. Passionnée par la création d'expériences digitales inclusives pour l'Afrique.",
    remotePreference: "REMOTE",
    skills: ["Figma", "UI Design", "UX Design", "User Research", "Branding"],
    experiences: [
      { company: "Wave Senegal", position: "Lead Designer", years: 4, current: true },
    ],
    portfolio: [
      { title: "SenWallet App", category: "Fintech", tech: ["Figma"] },
    ],
  },
  {
    email: "kwame.mensah@bovan.dev",
    firstName: "Kwame",
    lastName: "Mensah",
    headline: "Data Scientist",
    profession: "Data Scientist",
    country: "GH",
    city: "Accra",
    availability: "AVAILABLE",
    experienceLevel: "MID",
    yearsExperience: 5,
    bio: "Data scientist avec une passion pour l'IA appliquée à l'agriculture et à la santé en Afrique.",
    remotePreference: "ANY",
    skills: ["Python", "Machine Learning", "Data Analysis", "PostgreSQL"],
    experiences: [
      { company: "GhanaAI Labs", position: "Data Scientist", years: 3, current: true },
    ],
    portfolio: [
      { title: "CropPredict", category: "AgriTech", tech: ["Python", "TensorFlow"] },
    ],
  },
  {
    email: "fatou.ndiaye@bovan.dev",
    firstName: "Fatou",
    lastName: "Ndiaye",
    headline: "Marketing Digital & Community Manager",
    profession: "Marketing",
    country: "SN",
    city: "Dakar",
    availability: "AVAILABLE",
    experienceLevel: "MID",
    yearsExperience: 4,
    bio: "Spécialiste en marketing digital et gestion de communauté. J'aide les marques africaines à rayonner.",
    remotePreference: "HYBRID",
    skills: ["Social Media", "Content Marketing", "Community Management", "SEO"],
    experiences: [
      { company: "AfricaMedia", position: "Head of Social", years: 3, current: true },
    ],
    portfolio: [],
  },
  {
    email: "ibrahim.ouedraogo@bovan.dev",
    firstName: "Ibrahim",
    lastName: "Ouedraogo",
    headline: "Développeur Mobile Flutter",
    profession: "Développeur Mobile",
    country: "BF",
    city: "Ouagadougou",
    availability: "OPEN_TO_OPPORTUNITIES",
    experienceLevel: "MID",
    yearsExperience: 3,
    bio: "Développeur mobile Flutter, créateur d'applications pour le marché africain.",
    remotePreference: "REMOTE",
    skills: ["Flutter", "Dart", "Firebase", "React Native"],
    experiences: [
      { company: "BF Mobile", position: "Mobile Developer", years: 2, current: true },
    ],
    portfolio: [
      { title: "SukuL Mobile", category: "E-commerce", tech: ["Flutter"] },
    ],
  },
  {
    email: "chioma.okeke@bovan.dev",
    firstName: "Chioma",
    lastName: "Okeke",
    headline: "Product Manager",
    profession: "Product Manager",
    country: "NG",
    city: "Lagos",
    availability: "OPEN_TO_OPPORTUNITIES",
    experienceLevel: "SENIOR",
    yearsExperience: 6,
    bio: "Product Manager avec expérience en fintech et e-commerce à travers l'Afrique.",
    remotePreference: "HYBRID",
    skills: ["Product Management", "Agile", "Scrum", "Business Development"],
    experiences: [
      { company: "Paystack", position: "Senior PM", years: 3, current: true },
    ],
    portfolio: [],
  },
  {
    email: "amadou.toure@bovan.dev",
    firstName: "Amadou",
    lastName: "Touré",
    headline: "Ingénieur DevOps",
    profession: "DevOps",
    country: "CI",
    city: "Abidjan",
    availability: "AVAILABLE",
    experienceLevel: "SENIOR",
    yearsExperience: 6,
    bio: "Ingénieur DevOps, expert cloud AWS et Kubernetes. Passionné par l'automatisation.",
    remotePreference: "REMOTE",
    skills: ["DevOps", "Docker", "Kubernetes", "AWS", "Python"],
    experiences: [
      { company: "CIV Cloud", position: "DevOps Lead", years: 4, current: true },
    ],
    portfolio: [],
  },
  {
    email: "wanjiku.kariuki@bovan.dev",
    firstName: "Wanjiku",
    lastName: "Kariuki",
    headline: "Content Writer & Translator",
    profession: "Rédactrice",
    country: "KE",
    city: "Nairobi",
    availability: "AVAILABLE",
    experienceLevel: "JUNIOR",
    yearsExperience: 2,
    bio: "Rédactrice et traductrice anglais-français-swahili. Spécialisée en contenu tech et lifestyle.",
    remotePreference: "REMOTE",
    skills: ["Copywriting", "Translation", "Content Marketing"],
    experiences: [
      { company: "Savannah Content", position: "Content Writer", years: 2, current: true },
    ],
    portfolio: [],
  },
];

const COMPANIES_DATA = [
  {
    email: "hr@wave-senegal.com",
    name: "Wave Senegal",
    slug: "wave-senegal",
    industry: "Fintech",
    description: "Wave est une plateforme fintech qui rend l'argent mobile accessible à tous en Afrique de l'Ouest.",
    website: "https://wave.com",
    country: "SN",
    city: "Dakar",
    employeeCount: 250,
    foundedYear: 2018,
    verification: "VERIFIED",
  },
  {
    email: "careers@kebetu.tech",
    name: "Kebetu Tech",
    slug: "kebetu-tech",
    industry: "Technologie",
    description: "Kebetu Tech construit des solutions SaaS pour les entreprises africaines.",
    website: "https://kebetu.tech",
    country: "BJ",
    city: "Cotonou",
    employeeCount: 35,
    foundedYear: 2021,
    verification: "VERIFIED",
  },
  {
    email: "hello@agrimarket.africa",
    name: "AgriMarket Africa",
    slug: "agrimarket-africa",
    industry: "AgriTech",
    description: "AgriMarket connecte les producteurs agricoles aux marchés urbains.",
    website: "https://agrimarket.africa",
    country: "CI",
    city: "Abidjan",
    employeeCount: 80,
    foundedYear: 2019,
    verification: "VERIFIED",
  },
  {
    email: "team@nairobilabs.io",
    name: "Nairobi Labs",
    slug: "nairobi-labs",
    industry: "Intelligence Artificielle",
    description: "Nairobi Labs développe des solutions d'IA pour la santé et l'agriculture en Afrique de l'Est.",
    website: "https://nairobilabs.io",
    country: "KE",
    city: "Nairobi",
    employeeCount: 45,
    foundedYear: 2020,
    verification: "VERIFIED",
  },
  {
    email: "people@lagoshub.co",
    name: "Lagos Hub",
    slug: "lagos-hub",
    industry: "Coworking",
    description: "Lagos Hub est le plus grand espace de coworking et d'innovation d'Afrique de l'Ouest.",
    website: "https://lagoshub.co",
    country: "NG",
    city: "Lagos",
    employeeCount: 60,
    foundedYear: 2017,
    verification: "VERIFIED",
  },
  {
    email: "recrutement@sunubytravel.com",
    name: "SunuBy Travel",
    slug: "sunuby-travel",
    industry: "Tourisme",
    description: "SunuBy Travel promeut le tourisme intra-africain via une plateforme digitale.",
    website: "https://sunubytravel.com",
    country: "SN",
    city: "Dakar",
    employeeCount: 22,
    foundedYear: 2022,
    verification: "PENDING",
  },
];

const OPPORTUNITIES_DATA = [
  {
    company: "wave-senegal",
    title: "Développeur Full Stack Senior",
    description: "Rejoignez notre équipe tech pour construire la prochaine génération de services financiers mobiles. Vous travaillerez sur des systèmes à fort trafic servant des millions d'utilisateurs.",
    location: "Dakar, Sénégal",
    country: "SN",
    employmentType: "FULL_TIME",
    experienceLevel: "SENIOR",
    salaryMin: 30000,
    salaryMax: 50000,
    currency: "USD",
    remote: false,
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
  },
  {
    company: "kebetu-tech",
    title: "Frontend Developer Next.js",
    description: "Nous cherchons un développeur Frontend passionné pour rejoindre notre équipe SaaS. Vous travaillerez sur des produits utilisés par des milliers d'entreprises en Afrique de l'Ouest.",
    location: "Cotonou, Bénin",
    country: "BJ",
    employmentType: "FULL_TIME",
    experienceLevel: "MID",
    salaryMin: 18000,
    salaryMax: 28000,
    currency: "USD",
    remote: true,
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    company: "agrimarket-africa",
    title: "UX Designer",
    description: "Concevez des expériences utilisateur exceptionnelles pour notre plateforme AgriMarket. Vous collaborerez avec des agriculteurs, des coopératives et des consommateurs.",
    location: "Abidjan, Côte d'Ivoire",
    country: "CI",
    employmentType: "FULL_TIME",
    experienceLevel: "MID",
    salaryMin: 20000,
    salaryMax: 32000,
    currency: "USD",
    remote: false,
    skills: ["Figma", "UI Design", "UX Design"],
  },
  {
    company: "nairobi-labs",
    title: "Data Scientist - Santé",
    description: "Travaillez sur des modèles de ML pour prédire les épidémies en Afrique de l'Est. Collaboration étroite avec les ministères de la santé.",
    location: "Nairobi, Kenya",
    country: "KE",
    employmentType: "FULL_TIME",
    experienceLevel: "MID",
    salaryMin: 25000,
    salaryMax: 40000,
    currency: "USD",
    remote: true,
    skills: ["Python", "Machine Learning", "Data Analysis"],
  },
  {
    company: "lagos-hub",
    title: "Community Manager",
    description: "Animez la communauté de Lagos Hub et organisez nos événements tech mensuels. Vous serez la voix de notre écosystème.",
    location: "Lagos, Nigeria",
    country: "NG",
    employmentType: "FULL_TIME",
    experienceLevel: "ENTRY",
    salaryMin: 12000,
    salaryMax: 18000,
    currency: "USD",
    remote: false,
    skills: ["Community Management", "Social Media", "Content Marketing"],
  },
  {
    company: "kebetu-tech",
    title: "Stage - Développeur Mobile Flutter",
    description: "Stage de 6 mois pour développer des applications mobiles au sein de notre équipe produit.",
    location: "Cotonou, Bénin",
    country: "BJ",
    employmentType: "INTERNSHIP",
    experienceLevel: "INTERN",
    salaryMin: 300,
    salaryMax: 500,
    currency: "USD",
    remote: false,
    skills: ["Flutter", "Dart"],
  },
  {
    company: "sunuby-travel",
    title: "Freelance - Photographe/Vidéaste",
    description: "Réalisez des contenus visuels pour promouvoir les destinations touristiques africaines. Mission de 3 mois.",
    location: "Dakar, Sénégal",
    country: "SN",
    employmentType: "FREELANCE",
    experienceLevel: "MID",
    salaryMin: 5000,
    salaryMax: 12000,
    currency: "USD",
    remote: true,
    skills: ["Photography", "Videography"],
  },
  {
    company: "wave-senegal",
    title: "Product Manager - Paiements",
    description: "Définissez la roadmap produit de notre service de paiement. Vous travaillerez avec les équipes engineering, design et compliance.",
    location: "Dakar, Sénégal",
    country: "SN",
    employmentType: "FULL_TIME",
    experienceLevel: "SENIOR",
    salaryMin: 35000,
    salaryMax: 55000,
    currency: "USD",
    remote: false,
    skills: ["Product Management", "Agile", "Scrum"],
  },
];

export async function runSeed() {
  console.log("🌍 Seeding OCD database...");

  // Wipe in dependency order
  await db.execute(sql`TRUNCATE TABLE
    messages, conversations, applications, opportunities, portfolio_items,
    experiences, talent_skills, talent_profiles, companies, skills, cities,
    countries, sessions, notifications, favorites, reports, users
    RESTART IDENTITY CASCADE`);

  // Countries
  await db.insert(countries).values(COUNTRIES_DATA);
  const countryRows = await db.select().from(countries);
  const countryByIso = new Map(countryRows.map((c) => [c.iso2, c]));

  // Cities
  const cityValues = CITIES_DATA.map((c) => ({
    name: c.name,
    countryId: countryByIso.get(c.countryIso2)!.id,
  }));
  await db.insert(cities).values(cityValues);
  const cityRows = await db.select().from(cities);
  const cityByName = new Map(
    cityRows.map((c) => [c.name, c])
  );

  // Skills
  await db.insert(skills).values(
    SKILLS_DATA.map((s) => ({
      name: s.name,
      slug: slugify(s.name),
      category: s.category as
        | "TECHNOLOGY"
        | "DESIGN"
        | "MARKETING"
        | "BUSINESS"
        | "COMMUNICATION"
        | "ENGINEERING"
        | "CRAFT"
        | "AGRICULTURE"
        | "HEALTH"
        | "EDUCATION"
        | "FINANCE"
        | "LEGAL"
        | "CREATIVE"
        | "OTHER",
    }))
  );
  const skillRows = await db.select().from(skills);
  const skillByName = new Map(skillRows.map((s) => [s.name, s]));

  // Talents
  for (const t of TALENTS_DATA) {
    const pw = hashPassword("password123");
    const [u] = await db
      .insert(users)
      .values({
        email: t.email,
        passwordHash: pw,
        role: "TALENT",
        firstName: t.firstName,
        lastName: t.lastName,
        avatarUrl: null,
        countryId: countryByIso.get(t.country)!.id,
        cityId: cityByName.get(t.city)?.id,
        isVerified: true,
        isActive: true,
        isEmailVerified: true,
      })
      .returning();

    const [tp] = await db
      .insert(talentProfiles)
      .values({
        userId: u.id,
        slug: slugify(`${t.firstName}-${t.lastName}`),
        headline: t.headline,
        biography: t.bio,
        profession: t.profession,
        availability: t.availability as
          | "AVAILABLE"
          | "OPEN_TO_OPPORTUNITIES"
          | "EMPLOYED"
          | "NOT_AVAILABLE",
        experienceLevel: t.experienceLevel as
          | "JUNIOR"
          | "MID"
          | "SENIOR"
          | "LEAD"
          | "EXECUTIVE"
          | "INTERN"
          | "ENTRY",
        yearsExperience: t.yearsExperience,
        salaryExpectation: 25000,
        currency: "USD",
        remotePreference: t.remotePreference as
          | "ON_SITE"
          | "HYBRID"
          | "REMOTE"
          | "ANY",
        profileVisibility: "PUBLIC",
        completionScore: 85,
        isSpontaneous: true,
        viewsCount: Math.floor(Math.random() * 200) + 20,
      })
      .returning();

    // Skills
    for (const skillName of t.skills) {
      const skill = skillByName.get(skillName);
      if (skill) {
        await db.insert(talentSkills).values({
          talentId: tp.id,
          skillId: skill.id,
          level: Math.floor(Math.random() * 3) + 3,
        });
      }
    }

    // Experiences
    for (const exp of t.experiences) {
      const start = new Date();
      start.setFullYear(start.getFullYear() - exp.years);
      const end = exp.current ? null : new Date();
      await db.insert(experiences).values({
        talentId: tp.id,
        company: exp.company,
        position: exp.position,
        description: `Rôle clé au sein de ${exp.company}.`,
        startDate: start,
        endDate: end,
        isCurrent: exp.current,
      });
    }

    // Portfolio
    for (const p of t.portfolio) {
      await db.insert(portfolioItems).values({
        talentId: tp.id,
        title: p.title,
        description: `Découvrez ${p.title}, un projet de catégorie ${p.category}.`,
        category: p.category,
        technologies: p.tech,
        published: true,
      });
    }
  }

  // Companies
  const companySlugToId: Record<string, string> = {};
  for (const c of COMPANIES_DATA) {
    const pw = hashPassword("password123");
    const [u] = await db
      .insert(users)
      .values({
        email: c.email,
        passwordHash: pw,
        role: "COMPANY",
        firstName: c.name,
        lastName: "Recruteur",
        countryId: countryByIso.get(c.country)!.id,
        cityId: cityByName.get(c.city)?.id,
        isVerified: true,
        isActive: true,
        isEmailVerified: true,
      })
      .returning();

    const [co] = await db
      .insert(companies)
      .values({
        ownerId: u.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        industry: c.industry,
        website: c.website,
        email: c.email,
        countryId: countryByIso.get(c.country)!.id,
        cityId: cityByName.get(c.city)?.id,
        employeeCount: c.employeeCount,
        foundedYear: c.foundedYear,
        verification: c.verification as "PENDING" | "VERIFIED" | "REJECTED",
      })
      .returning();
    companySlugToId[c.slug] = co.id;
  }

  // Opportunities
  const usedOppSlugs = new Set<string>();
  for (const o of OPPORTUNITIES_DATA) {
    let baseSlug = slugify(`${o.company}-${o.title}`);
    let slug = baseSlug;
    let i = 1;
    while (usedOppSlugs.has(slug)) {
      slug = `${baseSlug}-${i++}`;
    }
    usedOppSlugs.add(slug);
    await db.insert(opportunities).values({
      companyId: companySlugToId[o.company],
      title: o.title,
      slug,
      description: o.description,
      location: o.location,
      countryId: countryByIso.get(o.country)?.id,
      employmentType: o.employmentType as
        | "FULL_TIME"
        | "PART_TIME"
        | "FREELANCE"
        | "INTERNSHIP"
        | "CONTRACT"
        | "VOLUNTEER"
        | "PROJECT"
        | "REMOTE",
      experienceLevel: o.experienceLevel as
        | "JUNIOR"
        | "MID"
        | "SENIOR"
        | "LEAD"
        | "EXECUTIVE"
        | "INTERN"
        | "ENTRY",
      salaryMin: o.salaryMin,
      salaryMax: o.salaryMax,
      currency: o.currency,
      remote: o.remote,
      status: "PUBLISHED",
      publishedAt: new Date(),
      skills: o.skills,
      viewsCount: Math.floor(Math.random() * 150),
    });
  }

  // A few applications
  const allTalents = await db.select().from(talentProfiles);
  const allOpps = await db.select().from(opportunities);
  for (let i = 0; i < 12; i++) {
    const t = allTalents[i % allTalents.length];
    const o = allOpps[i % allOpps.length];
    if (t && o) {
      try {
        await db.insert(applications).values({
          talentId: t.id,
          opportunityId: o.id,
          coverLetter:
            "Bonjour, je suis très intéressé par cette opportunité et j'aimerais contribuer à votre équipe.",
          status: "SUBMITTED",
        });
      } catch {
        // ignore duplicate
      }
    }
  }

  console.log("✅ Seed complete!");
}
