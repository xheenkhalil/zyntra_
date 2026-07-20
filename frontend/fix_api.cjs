const fs = require('fs');
const files = [
  'src/pages/CourseViewerPage.tsx',
  'src/pages/SuperAdminCertifications.tsx',
  'src/pages/SuperAdminCreateCertification.tsx',
  'src/pages/SuperAdminCreateGuestQuiz.tsx',
  'src/pages/SuperAdminEditGuestQuiz.tsx',
  'src/components/certification/ModuleAssessment.tsx',
  'src/components/home/CertificationCoursesSection.tsx',
  'src/pages/SuperAdminManageQuizQuestions.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('const API_URL')) {
    content = content.replace("import axios from 'axios';", "import axios from 'axios';\n\nconst API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';");
  }
  
  // Replace axios.get('/api/...) with axios.get(`${API_URL}/...)
  // and handle single quotes
  content = content.replace(/axios\.(get|post|put|delete)\(\'\/api\//g, 'axios.$1(`${API_URL}/');
  // Handle template literals
  content = content.replace(/axios\.(get|post|put|delete)\(\`\/api\//g, 'axios.$1(`${API_URL}/');
  
  fs.writeFileSync(f, content);
});

console.log("Done");
