const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");

const prisma = new PrismaClient();

const USERS = [
  {
    name: "Admin User",
    email: "admin@trusthire.dev",
    phone: "+919000000001",
    password: "Admin@123",
    role: "ADMIN",
  },
  {
    name: "John Candidate",
    email: "candidate@trusthire.dev",
    phone: "+919000000002",
    password: "Candidate@123",
    role: "CANDIDATE",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    experience: 3,
    education: "B.Tech Computer Science",
    bio: "Full-stack developer with 3 years of experience building scalable web applications.",
  },
  {
    name: "Jane Recruiter",
    email: "recruiter@trusthire.dev",
    phone: "+919000000003",
    password: "Recruiter@123",
    role: "RECRUITER",
  },
];

const COMPANIES = [
  { name: "Tata Consultancy Services", city: "Mumbai", state: "Maharashtra", industry: "IT Services" },
  { name: "Infosys Limited", city: "Bangalore", state: "Karnataka", industry: "IT Services" },
  { name: "Wipro Limited", city: "Bangalore", state: "Karnataka", industry: "IT Services" },
  { name: "HCL Technologies", city: "Noida", state: "Uttar Pradesh", industry: "IT Services" },
  { name: "Tech Mahindra", city: "Pune", state: "Maharashtra", industry: "IT Services" },
  { name: "Reliance Jio", city: "Mumbai", state: "Maharashtra", industry: "Telecommunications" },
  { name: "Flipkart", city: "Bangalore", state: "Karnataka", industry: "E-Commerce" },
  { name: "Zomato", city: "Gurugram", state: "Haryana", industry: "Food Tech" },
  { name: "Paytm", city: "Noida", state: "Uttar Pradesh", industry: "Fintech" },
  { name: " Razorpay", city: "Bangalore", state: "Karnataka", industry: "Fintech" },
  { name: "Swiggy", city: "Bangalore", state: "Karnataka", industry: "Food Tech" },
  { name: "Ola", city: "Bangalore", state: "Karnataka", industry: "Transportation" },
  { name: "PhonePe", city: "Bangalore", state: "Karnataka", industry: "Fintech" },
  { name: "Freshworks", city: "Chennai", state: "Tamil Nadu", industry: "SaaS" },
  { name: "Zoho Corporation", city: "Chennai", state: "Tamil Nadu", industry: "SaaS" },
  { name: "Mindtree", city: "Bangalore", state: "Karnataka", industry: "IT Services" },
  { name: "Mphasis", city: "Bangalore", state: "Karnataka", industry: "IT Services" },
  { name: "L&T Infotech", city: "Mumbai", state: "Maharashtra", industry: "IT Services" },
  { name: "Persistent Systems", city: "Pune", state: "Maharashtra", industry: "IT Services" },
  { name: "Cognizant India", city: "Chennai", state: "Tamil Nadu", industry: "IT Services" },
  { name: "BYJU'S", city: "Bangalore", state: "Karnataka", industry: "EdTech" },
  { name: "Unacademy", city: "Bangalore", state: "Karnataka", industry: "EdTech" },
  { name: "Dream11", city: "Mumbai", state: "Maharashtra", industry: "Sports Tech" },
  { name: "PolicyBazaar", city: "Gurugram", state: "Haryana", industry: "InsurTech" },
  { name: "Nykaa", city: "Mumbai", state: "Maharashtra", industry: "E-Commerce" },
  { name: "MakeMyTrip", city: "Gurugram", state: "Haryana", industry: "Travel Tech" },
  { name: "Urban Company", city: "Gurugram", state: "Haryana", industry: "Home Services" },
  { name: "Cars24", city: "Gurugram", state: "Haryana", industry: "Automotive" },
  { name: "Meesho", city: "Bangalore", state: "Karnataka", industry: "E-Commerce" },
  { name: "CRED", city: "Bangalore", state: "Karnataka", industry: "Fintech" },
  { name: " Groww", city: "Bangalore", state: "Karnataka", industry: "Fintech" },
  { name: "Slice", city: "Bangalore", state: "Karnataka", industry: "Fintech" },
  { name: "Atlassian India", city: "Bangalore", state: "Karnataka", industry: "SaaS" },
  { name: "SAP Labs India", city: "Bangalore", state: "Karnataka", industry: "SaaS" },
  { name: "Google India", city: "Bangalore", state: "Karnataka", industry: "Technology" },
  { name: "Microsoft India", city: "Hyderabad", state: "Telangana", industry: "Technology" },
  { name: "Amazon India", city: "Bangalore", state: "Karnataka", industry: "E-Commerce" },
  { name: "Uber India", city: "Hyderabad", state: "Telangana", industry: "Transportation" },
  { name: "LinkedIn India", city: "Bangalore", state: "Karnataka", industry: "Social Media" },
  { name: "Adobe India", city: "Noida", state: "Uttar Pradesh", industry: "Software" },
  { name: "Salesforce India", city: "Hyderabad", state: "Telangana", industry: "SaaS" },
  { name: "Intel India", city: "Bangalore", state: "Karnataka", industry: "Semiconductor" },
  { name: "Goldman Sachs India", city: "Bangalore", state: "Karnataka", industry: "Finance" },
  { name: "JP Morgan India", city: "Mumbai", state: "Maharashtra", industry: "Finance" },
  { name: "VMware India", city: "Bangalore", state: "Karnataka", industry: "Cloud" },
  { name: "Cisco India", city: "Bangalore", state: "Karnataka", industry: "Networking" },
  { name: "Nvidia India", city: "Hyderabad", state: "Telangana", industry: "AI/GPU" },
  { name: "Dell India", city: "Bangalore", state: "Karnataka", industry: "Hardware" },
  { name: "Samsung India", city: "Noida", state: "Uttar Pradesh", industry: "Electronics" },
  { name: "Siemens India", city: "Pune", state: "Maharashtra", industry: "Industrial" },
];

const JOB_TEMPLATES = [
  { title: "Software Engineer", skills: ["JavaScript", "TypeScript", "React", "Node.js"], desc: "Develop and maintain web applications using modern JavaScript frameworks." },
  { title: "Frontend Developer", skills: ["React", "Angular", "CSS", "HTML", "TypeScript"], desc: "Build responsive and performant user interfaces for web applications." },
  { title: "Backend Developer", skills: ["Node.js", "Python", "Java", "PostgreSQL", "REST APIs"], desc: "Design and implement scalable backend services and APIs." },
  { title: "Full Stack Developer", skills: ["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL"], desc: "Work across the entire stack building end-to-end features." },
  { title: "DevOps Engineer", skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"], desc: "Manage cloud infrastructure and streamline deployment pipelines." },
  { title: "Data Scientist", skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"], desc: "Analyze complex datasets and build predictive models." },
  { title: "Product Manager", skills: ["Agile", "Product Strategy", "Data Analysis", "Roadmapping"], desc: "Lead product development from ideation to launch." },
  { title: "UI/UX Designer", skills: ["Figma", "Adobe XD", "User Research", "Prototyping"], desc: "Design intuitive and visually appealing user experiences." },
  { title: "QA Engineer", skills: ["Selenium", "Jest", "Cypress", "Manual Testing", "API Testing"], desc: "Ensure software quality through automated and manual testing." },
  { title: "Cloud Architect", skills: ["AWS", "Azure", "GCP", "Microservices", "Architecture"], desc: "Design and oversee cloud-based infrastructure solutions." },
  { title: "Mobile Developer", skills: ["React Native", "Flutter", "Swift", "Kotlin"], desc: "Build cross-platform mobile applications." },
  { title: "Data Engineer", skills: ["Python", "Apache Spark", "SQL", "Airflow", "ETL"], desc: "Build and maintain data pipelines and warehousing solutions." },
  { title: "Security Engineer", skills: ["Cybersecurity", "Penetration Testing", "SIEM", "OWASP"], desc: "Protect systems and data from security threats." },
  { title: "Machine Learning Engineer", skills: ["Python", "PyTorch", "TensorFlow", "MLOps", "AWS SageMaker"], desc: "Deploy and optimize machine learning models in production." },
  { title: "Technical Lead", skills: ["Java", "System Design", "Leadership", "Architecture"], desc: "Lead engineering teams and drive technical decisions." },
];

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"];
const SALARY_RANGES = [
  [300000, 600000], [400000, 800000], [500000, 1000000],
  [600000, 1200000], [800000, 1500000], [1000000, 2000000],
  [1200000, 2500000], [1500000, 3000000], [2000000, 4000000],
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateJobs(companyId, count) {
  const jobs = [];
  for (let i = 0; i < count; i++) {
    const template = pick(JOB_TEMPLATES);
    const salary = pick(SALARY_RANGES);
    const expMin = randInt(0, 5);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + randInt(15, 90));

    jobs.push({
      companyId,
      title: template.title,
      description: template.desc,
      responsibilities: [
        "Collaborate with cross-functional teams",
        "Write clean, maintainable code",
        "Participate in code reviews",
        "Contribute to technical documentation",
      ],
      requirements: [
        `${expMin}+ years of experience`,
        "Strong problem-solving skills",
        "Good communication skills",
        "Bachelor's degree in CS or related field",
      ],
      skills: template.skills,
      salaryMin: salary[0],
      salaryMax: salary[1],
      experienceMin: expMin,
      experienceMax: expMin + randInt(2, 6),
      location: pick(["Bangalore", "Mumbai", "Hyderabad", "Pune", "Chennai", "Gurugram", "Noida", "Remote"]),
      jobType: pick(JOB_TYPES),
      vacancies: randInt(1, 5),
      deadline,
      isActive: true,
      isUrgent: Math.random() > 0.8,
    });
  }
  return jobs;
}

async function main() {
  console.log("Seeding database...\n");

  // Seed users
  console.log("--- Users ---");
  let recruiterUser;
  for (const user of USERS) {
    const hashedPassword = await argon2.hash(user.password);
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      console.log(`  Skipping ${user.email} (already exists)`);
      if (user.role === "RECRUITER") recruiterUser = existing;
      continue;
    }
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: hashedPassword,
        role: user.role,
        verificationStatus: "FULLY_VERIFIED",
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        skills: user.skills || [],
        experience: user.experience || null,
        education: user.education || null,
        bio: user.bio || null,
      },
    });
    console.log(`  Created ${created.role}: ${created.email}`);
    if (user.role === "RECRUITER") recruiterUser = created;
  }

  // Seed companies
  console.log("\n--- Companies ---");
  const existingCompanyCount = await prisma.company.count();
  if (existingCompanyCount >= 50) {
    console.log(`  Skipping companies (${existingCompanyCount} already exist)`);
  } else {
    let companyIndex = 0;
    for (const c of COMPANIES) {
      companyIndex++;
      const regNum = `U74${String(companyIndex).padStart(4, "0")}MH2024PTC${String(companyIndex + 10000).padStart(7, "0")}`;
      const gstNum = `27AABCT${String(companyIndex).padStart(4, "0")}1Z1Z${String(companyIndex).padStart(2, "0")}`;

      const existing = await prisma.company.findFirst({
        where: { OR: [{ name: c.name }, { registrationNumber: regNum }] },
      });
      if (existing) {
        console.log(`  Skipping ${c.name} (already exists)`);
        continue;
      }

      const company = await prisma.company.create({
        data: {
          name: c.name,
          registrationNumber: regNum,
          gstNumber: gstNum,
          pan: `AABCT${String(companyIndex).padStart(4, "0")}1`,
          website: `https://${c.name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
          companyEmail: `hr@${c.name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
          address: `${randInt(1, 200)}, ${pick(["MG Road", "Park Street", "Station Road", "Main Street", "Ring Road"])}`,
          city: c.city,
          state: c.state,
          pincode: `${randInt(100000, 999999)}`,
          status: "APPROVED",
          verifiedAt: new Date(),
          documents: [],
        },
      });

      const jobCount = randInt(2, 4);
      const jobs = generateJobs(company.id, jobCount);
      await prisma.job.createMany({ data: jobs });

      console.log(`  Created ${c.name} (${c.city}) — ${jobCount} jobs`);
    }
  }

  // Link recruiter to first company
  if (recruiterUser) {
    const firstCompany = await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });
    const existingRecruiter = await prisma.recruiter.findUnique({ where: { userId: recruiterUser.id } });
    if (firstCompany && !existingRecruiter) {
      await prisma.recruiter.create({
        data: {
          userId: recruiterUser.id,
          companyId: firstCompany.id,
          name: recruiterUser.name,
          email: recruiterUser.email,
          phone: recruiterUser.phone,
          designation: "HR Manager",
          identityVerified: true,
        },
      });
      console.log(`\n  Linked recruiter ${recruiterUser.email} → ${firstCompany.name}`);
    }
  }

  const totalCompanies = await prisma.company.count();
  const totalJobs = await prisma.job.count();
  console.log(`\nDone! Total: ${totalCompanies} companies, ${totalJobs} jobs\n`);

  console.log("Test credentials:\n");
  console.log("  Role        Email                      Password");
  console.log("  ─────────   ────────────────────────   ──────────────");
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(11)} ${u.email.padEnd(24)} ${u.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
