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
  
  // Fix the mismatched quote issue:
  // e.g. axios.post(`${API_URL}/upload/image', ... -> axios.post(`${API_URL}/upload/image`, ...
  content = content.replace(/(\`\$\{API_URL\}\/[^\']*)\'/g, '$1`');
  
  // also fix double quotes if any: e.g. axios.post(`${API_URL}/upload/image", ... -> axios.post(`${API_URL}/upload/image`, ...
  content = content.replace(/(\`\$\{API_URL\}\/[^\"]*)\"/g, '$1`');
  
  fs.writeFileSync(f, content);
});

console.log("Quotes fixed");
