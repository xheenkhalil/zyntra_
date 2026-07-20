const fs = require('fs');
const path = require('path');

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
  const fullPath = path.join(__dirname, f);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Remove the old API_URL declaration
  content = content.replace(/const API_URL = import\.meta\.env\.VITE_BACKEND_URL \? import\.meta\.env\.VITE_BACKEND_URL\.replace\(\/\\\/api\\\/\?\$\/, \'\'\) : \'\';\n?/g, '');
  content = content.replace(/const API_URL = import\.meta\.env\.VITE_BACKEND_URL \|\| \'http:\/\/localhost:5000\/api\';\n?/g, ''); // Just in case

  // Safely replace usages
  // 1. Single quotes: API_URL + '/api/something' -> API_BASE_URL + '/something'
  content = content.replace(/API_URL \+ \'\/api\//g, "API_BASE_URL + '/");
  
  // 2. Backticks: `${API_URL}/api/something` -> `${API_BASE_URL}/something`
  content = content.replace(/\$\{API_URL\}\/api\//g, "${API_BASE_URL}/");

  // Determine relative path to config
  const depth = (f.match(/\//g) || []).length;
  const relativePath = depth === 2 ? '../config' : '../../config';

  // Add the import if missing
  if (!content.includes('import { API_BASE_URL }')) {
    content = content.replace("import axios from 'axios';", `import axios from 'axios';\nimport { API_BASE_URL } from '${relativePath}';`);
  }

  fs.writeFileSync(fullPath, content);
});

console.log("Replaced securely without touching quotes");
