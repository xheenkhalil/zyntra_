const fs = require('fs');

const files = [
  'src/components/certification/ModuleAssessment.tsx',
  'src/components/home/CertificationCoursesSection.tsx',
  'src/pages/CourseViewerPage.tsx',
  'src/pages/SuperAdminCertifications.tsx',
  'src/pages/SuperAdminCreateCertification.tsx',
  'src/pages/SuperAdminCreateGuestQuiz.tsx',
  'src/pages/SuperAdminEditGuestQuiz.tsx',
  'src/pages/SuperAdminManageQuizQuestions.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Insert API_URL if not exists
  if (!content.includes('const API_URL =')) {
    content = content.replace("import axios from 'axios';", "import axios from 'axios';\n\nconst API_URL = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.replace(/\\/api\\/?$/, '') : '';");
  }

  // Safely replace exact strings for single quotes
  content = content.replace(/axios\.([a-z]+)\(\'\/api\//g, "axios.$1(API_URL + '/api/");
  
  // Safely replace exact strings for backticks
  content = content.replace(/axios\.([a-z]+)\(\`\/api\//g, "axios.$1(`${API_URL}/api/");

  fs.writeFileSync(f, content);
});

console.log("Done safely");
