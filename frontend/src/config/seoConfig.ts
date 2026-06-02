// SEO configuration for all public routes
// Each page has targeted title, description, and keywords for maximum search visibility
// Keywords cover: global, Nigeria/Africa, UK, US, India, and corporate segments

export interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  ogType?: string;
  structuredData?: Record<string, unknown>;
}

const seoConfig: Record<string, PageSEO> = {
  // ========================
  // CORE PAGES
  // ========================
  "/": {
    title: "AI-Powered Online Examination Platform",
    description:
      "ZYNTRA is the leading AI-powered online exam platform for schools, universities, and businesses. Features AI proctoring, auto-grading, biometric verification, and smart analytics. Start free with 50 credits — pay only for the exams you deliver.",
    keywords:
      "online exam platform, AI proctoring, online assessment platform, exam management system, digital examination platform, remote proctoring software, online test maker, exam software, assessment platform, proctored exams online, auto grading system, smart analytics, biometric verification, exam security software, anti-cheating software, LMS integration, education technology, edtech platform, certification exam platform, online quiz maker, CBT platform Nigeria, online exam UK, online exam USA, online exam India, employee assessment platform, corporate training assessment, free online quiz maker, practice tests online, exam builder software, question bank software, computer based test platform, school exam management, university exam software, JAMB CBT practice, WAEC exam preparation, GCSE revision platform, SAT practice tests free, JEE practice tests online, NEET exam platform",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "ZYNTRA — AI-Powered Online Examination Platform",
      description: "The all-in-one AI exam platform for schools, universities & businesses.",
      url: "https://zyntra.io",
    },
  },

  "/about": {
    title: "About ZYNTRA — Our Mission & Story",
    description:
      "Learn about ZYNTRA's mission to make world-class examination technology accessible to every institution. Built for educators, powered by AI, trusted by schools and universities worldwide.",
    keywords:
      "about ZYNTRA, ZYNTRA exam platform, online exam company, edtech startup, AI examination company, education technology company, exam platform story, who built ZYNTRA, ZYNTRA team, assessment technology company, Nigerian edtech company, online testing company",
  },

  "/pricing": {
    title: "Pricing — Pay Per Exam, Not Per Month",
    description:
      "ZYNTRA's credit-based pricing: 1 credit = 1 student, 1 exam. Start free with 50 credits/month. No lock-in. Subscription plans from $49/mo or pay-as-you-go credit bundles. Education discounts available for public schools.",
    keywords:
      "online exam pricing, exam platform cost, pay per exam pricing, exam software pricing, assessment platform pricing, cheap exam platform, affordable online exam, exam credits, pay as you go exam, exam platform free trial, free online exam platform, education discount exam software, school exam pricing, university exam cost, corporate assessment pricing, per student exam pricing, exam platform Nigeria price, exam platform UK pricing",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "ZYNTRA Exam Platform",
      description: "AI-powered online examination platform with credit-based pricing.",
      url: "https://zyntra.io/pricing",
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "0",
          priceCurrency: "USD",
          description: "Free plan with 50 credits per month",
        },
        {
          "@type": "Offer",
          name: "Growth",
          price: "49",
          priceCurrency: "USD",
          description: "500 credits per month for growing teams",
        },
        {
          "@type": "Offer",
          name: "Professional",
          price: "149",
          priceCurrency: "USD",
          description: "2,000 credits per month for schools",
        },
        {
          "@type": "Offer",
          name: "Institution",
          price: "399",
          priceCurrency: "USD",
          description: "10,000 credits per month for universities",
        },
      ],
    },
  },

  "/contact": {
    title: "Contact Us — Get in Touch with ZYNTRA",
    description:
      "Contact ZYNTRA for demos, enterprise quotes, education pricing, or support. We help schools, universities, and businesses set up their ideal exam platform.",
    keywords:
      "contact ZYNTRA, ZYNTRA support, exam platform demo, enterprise exam quote, education pricing request, ZYNTRA sales, online exam help, exam platform support, get started exam platform",
  },

  "/login": {
    title: "Sign In to ZYNTRA",
    description:
      "Log in to your ZYNTRA account to manage exams, view analytics, and access your exam dashboard. New user? Sign up free with 50 credits.",
    keywords:
      "ZYNTRA login, exam platform login, sign in online exam, exam dashboard access, ZYNTRA account",
    ogType: "website",
  },

  // ========================
  // SOLUTIONS PAGES
  // ========================
  "/solutions/schools-universities": {
    title: "Online Exam Platform for Schools & Universities",
    description:
      "ZYNTRA helps schools and universities manage exams at scale. Department-level control, student enrollment, LMS integration, AI proctoring, and compliance support. Trusted by educational institutions worldwide.",
    keywords:
      "online exam for schools, university exam platform, school exam management system, education exam software, academic examination platform, college exam platform, LMS exam integration, Canvas exam integration, Blackboard exam integration, Moodle exam integration, student exam management, department exam control, accreditation exam compliance, school CBT platform Nigeria, university exam UK, college exam USA, school exam India, JAMB CBT platform, WAEC exam platform, GCSE exam platform, A-level exam software, SAT exam practice platform, ACT exam preparation, JEE exam platform, NEET exam platform, university assessment system, school assessment software, academic integrity platform, exam management for universities, higher education exam software",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Online Exam Platform for Schools & Universities — ZYNTRA",
      description: "Exam management for academic institutions with AI proctoring and LMS integration.",
      url: "https://zyntra.io/solutions/schools-universities",
    },
  },

  "/solutions/corporate-training": {
    title: "Employee Assessment & Corporate Training Platform",
    description:
      "ZYNTRA helps businesses assess employees, manage compliance training, identify skills gaps, and benchmark performance. HR integration, team analytics, and automated certification.",
    keywords:
      "employee assessment platform, corporate training assessment, compliance testing software, skills gap analysis tool, onboarding evaluation platform, performance benchmarking software, team analytics assessment, HR assessment integration, pre-employment testing platform, workforce evaluation tool, corporate exam platform, employee certification system, compliance exam software, corporate CBT platform, training assessment tool, employee skills testing, corporate quiz platform, professional development assessment, enterprise assessment solution, talent assessment platform, employee competency testing",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Corporate Training & Employee Assessment — ZYNTRA",
      description: "Employee assessment, compliance testing, and skills gap analysis for businesses.",
      url: "https://zyntra.io/solutions/corporate-training",
    },
  },

  "/solutions/guest-quizzes": {
    title: "Free Online Quizzes — Practice Tests & Instant Scoring",
    description:
      "Take free online quizzes with instant scoring and detailed feedback. No registration required. 500+ quizzes across programming, science, business, and more. Compete on global leaderboards.",
    keywords:
      "free online quiz, free practice test, online quiz no registration, instant quiz scoring, free exam practice, online MCQ test free, quiz with answers, practice questions online, free CBT practice Nigeria, free GCSE practice UK, free SAT practice, free aptitude test, programming quiz online, science quiz free, general knowledge quiz, math quiz online, coding quiz, data science quiz, free certification practice test, skill assessment quiz free, online quiz maker free, quiz competition online, quiz leaderboard",
  },

  "/solutions/earn-badges": {
    title: "Earn Digital Badges & Certifications — Verify Your Skills",
    description:
      "Earn verified digital badges by demonstrating your knowledge. Build a professional skills portfolio, share achievements on LinkedIn, and get recognised by employers. Open Badges 3.0 standard.",
    keywords:
      "digital badges, online certifications, skill badges, verified credentials, digital credential platform, open badges, professional badges, skill verification, achievement badges, LinkedIn badges, portfolio building, badge categories, certification platform, micro-credentials, badge earner, skill validation, professional development badges, competency badges",
  },

  // ========================
  // FEATURES PAGES
  // ========================
  "/features/ai-proctoring": {
    title: "AI Proctoring — Real-Time Exam Monitoring & Cheating Detection",
    description:
      "ZYNTRA's AI proctoring monitors exams in real-time using facial recognition, gaze tracking, audio analysis, and tab-switch detection. Automated flagging with human review integration. Ensure exam integrity at scale.",
    keywords:
      "AI proctoring, online proctoring software, AI exam monitoring, cheating detection software, remote proctoring AI, facial recognition proctoring, gaze tracking exam, audio analysis proctoring, tab switch detection, automated proctoring, exam integrity software, anti-cheating AI, proctoring software for schools, proctoring software for universities, online exam monitoring, real-time exam surveillance, proctoring platform, AI-based exam security, proctoring Nigeria, proctoring UK, proctoring India, proctoring USA, cheap proctoring software, affordable AI proctoring",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AI Proctoring — ZYNTRA",
      description: "Real-time AI-powered exam monitoring with cheating detection.",
      url: "https://zyntra.io/features/ai-proctoring",
    },
  },

  "/features/smart-analytics": {
    title: "Smart Analytics — Exam Performance Dashboards & Insights",
    description:
      "Get deep insights into student performance with ZYNTRA's smart analytics. Performance dashboards, scoring trends, question difficulty analysis, comparative analytics, and exportable reports.",
    keywords:
      "exam analytics, performance dashboard, student progress tracking, question difficulty analysis, scoring trends, comparative analytics, exportable reports, predictive insights, exam data analytics, assessment analytics, learning analytics platform, student performance insights, exam reporting software, educational data analysis, grade analytics, test item analysis, exam statistics dashboard",
  },

  "/features/biometric-verification": {
    title: "Biometric Verification — Secure Identity Confirmation for Exams",
    description:
      "ZYNTRA's biometric verification uses facial recognition and liveness detection to confirm student identity before exams. Anti-spoofing technology, GDPR compliant, and secure data handling.",
    keywords:
      "biometric verification exam, facial recognition exam, identity verification online exam, liveness detection proctoring, anti-spoofing exam security, biometric authentication education, face verification exam, student identity check, exam identity confirmation, secure exam authentication, GDPR compliant biometric, biometric exam security",
  },

  "/features/mobile-compatible": {
    title: "Mobile Compatible — Take Exams on Any Device",
    description:
      "ZYNTRA works on every device — desktop, tablet, and mobile. Responsive design, offline mode, cross-device sync, touch-optimized interface, and bandwidth optimization for reliable exam delivery anywhere.",
    keywords:
      "mobile exam platform, take exams on phone, mobile compatible assessment, responsive exam software, offline exam mode, cross-device exam sync, touch optimized exam, mobile proctoring, exam on tablet, bandwidth optimized exam, mobile CBT platform, exam app mobile, assessment on mobile, phone exam platform",
  },

  "/features/cloud-integration": {
    title: "Cloud Integration — Seamless LMS & API Connectivity",
    description:
      "Connect ZYNTRA with your existing tools. Native LMS integrations (Canvas, Blackboard, Moodle), SSO support (SAML, OAuth), REST API, and 99.9% uptime SLA. Multi-region deployment worldwide.",
    keywords:
      "cloud exam integration, LMS integration exam, Canvas exam integration, Blackboard integration, Moodle exam integration, Google Classroom integration, SSO exam platform, SAML exam platform, OAuth exam, REST API assessment, exam API, cloud exam platform, multi-region exam deployment, 99.9 uptime exam, scalable exam infrastructure, SIS integration exam, exam data sync, cloud assessment platform",
  },

  "/features/auto-grading": {
    title: "Auto-Grading — Instant AI-Powered Exam Scoring",
    description:
      "ZYNTRA's auto-grading engine scores exams instantly using AI. Supports 15+ question types including essays, coding, and math. Rubric-based grading, partial credit, plagiarism detection, and detailed grade analytics.",
    keywords:
      "auto grading, AI grading, automated exam scoring, instant exam results, essay grading AI, rubric grading software, partial credit grading, plagiarism detection exam, grade analytics, automated assessment, AI exam scoring, NLP essay grading, code grading platform, math grading AI, multiple choice grading, automatic test grading, exam scoring software, instant feedback exam",
  },

  // ========================
  // LEGAL PAGES
  // ========================
  "/privacy-policy": {
    title: "Privacy Policy",
    description:
      "ZYNTRA's privacy policy explains how we collect, use, and protect your personal data. GDPR and data protection compliant.",
    keywords: "ZYNTRA privacy policy, exam platform privacy, data protection exam, GDPR exam platform",
  },

  "/terms-of-service": {
    title: "Terms of Service",
    description:
      "ZYNTRA's terms of service outline the rules and regulations for using our online examination platform.",
    keywords: "ZYNTRA terms of service, exam platform terms, online exam terms and conditions",
  },

  "/cookie-policy": {
    title: "Cookie Policy",
    description:
      "ZYNTRA's cookie policy explains what cookies we use, why we use them, and how you can control them.",
    keywords: "ZYNTRA cookie policy, exam platform cookies",
  },
};

export default seoConfig;
