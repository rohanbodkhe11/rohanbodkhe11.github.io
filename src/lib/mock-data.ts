
export const SKILLS = [
  {
    category: "Programming",
    items: [
      { title: "Python (Fundamentals)", icon: "Code" },
      { title: "JavaScript (Basics)", icon: "Zap" }
    ]
  },
  {
    category: "Web Development",
    items: [
      { title: "HTML", icon: "Layout" },
      { title: "CSS", icon: "Layout" },
      { title: "React", icon: "Code" },
      { title: "Next.js", icon: "ExternalLink" },
      { title: "Tailwind CSS", icon: "Target" }
    ]
  },
  {
    category: "Backend & Database",
    items: [
      { title: "Firebase (Auth, Firestore)", icon: "Cpu" },
      { title: "REST APIs", icon: "Globe" }
    ]
  },
  {
    category: "Tools & Platforms",
    items: [
      { title: "Git", icon: "Layout" },
      { title: "GitHub", icon: "ExternalLink" },
      { title: "VS Code", icon: "Smartphone" }
    ]
  },
  {
    category: "Core Interests",
    items: [
      { title: "Cybersecurity", icon: "Shield" },
      { title: "Web Applications", icon: "Globe" },
      { title: "UI/UX Design", icon: "Target" }
    ]
  }
];

export const PROJECTS = [
  {
    id: "p1",
    title: "Study Mate App",
    slug: "study-mate-app",
    shortDescription: "An educational platform providing notes and previous year question papers categorized by academic year with admin-controlled uploads.",
    category: "webdev",
    techStack: ["React", "Firebase", "Tailwind"],
    imageUrl: "https://picsum.photos/seed/studymate/800/450",
    githubUrl: "#",
    liveUrl: "#",
    featured: true,
    status: "completed"
  },
  {
    id: "p2",
    title: "MIT CSN Attendance App",
    slug: "mit-csn-attendance",
    shortDescription: "A role-based attendance management system with features like student/faculty login, course management, and attendance tracking.",
    category: "tools",
    techStack: ["React", "Firebase Auth", "Firestore"],
    imageUrl: "https://picsum.photos/seed/attendance/800/450",
    githubUrl: "#",
    liveUrl: "#",
    featured: true,
    status: "completed"
  },
  {
    id: "p3",
    title: "Portfolio Website with Admin Panel",
    slug: "portfolio-cms",
    shortDescription: "A modern, responsive portfolio with CMS functionality, 3D UI elements, and advanced design.",
    category: "webdev",
    techStack: ["Next.js", "Genkit AI", "Three.js", "Firebase"],
    imageUrl: "https://picsum.photos/seed/portfolio_v2/800/450",
    githubUrl: "#",
    liveUrl: "#",
    featured: true,
    status: "ongoing"
  }
];

export const EDUCATION = [
  {
    id: "edu1",
    institutionName: "Bachelor of Technology (B.Tech) in Electronics & Computer Science",
    degreeCourseName: "MIT College (Autonomous), Chhatrapati Sambhaji Nagar",
    startYear: 2024,
    endYear: null,
    isCurrent: true,
    cgpaPercentage: "8.90 (current)",
    description: "Currently pursuing my undergraduate degree with a current CGPA of 8.90, showcasing strong academic performance, dedication, and a keen interest in electronics and computing technologies.",
    order: 1
  },
  {
    id: "edu2",
    institutionName: "Higher Secondary Education",
    degreeCourseName: "Nath Junior College, Galleborgaon, Chhatrapati Sambhaji Nagar",
    startYear: 2022,
    endYear: 2024,
    isCurrent: false,
    cgpaPercentage: "74.33%",
    description: "Completed at Nath Junior College, Galleborgaon, Chhatrapati Sambhaji Nagar, with an overall score of 74.33%, demonstrating consistent effort and academic growth.",
    order: 2
  },
  {
    id: "edu3",
    institutionName: "Secondary Education",
    degreeCourseName: "G.S.V.M, Ellora, Chhatrapati Sambhaji Nagar",
    startYear: 2021,
    endYear: 2022,
    isCurrent: false,
    cgpaPercentage: "81.80%",
    description: "Completed at G.S.V.M, Ellora, Chhatrapati Sambhaji Nagar, achieving an overall score of 81.80%, reflecting a strong academic foundation.",
    order: 3
  }
];
