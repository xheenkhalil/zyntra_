const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(directoryPath);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace Tailwind background gradients with specific brand colors
    content = content.replace(/bg-gradient-to-[a-z]+ from-[a-z]+-[0-9]+ to-[a-z]+-[0-9]+/g, 'bg-[#3C4DCE]');
    content = content.replace(/hover:from-[a-z]+-[0-9]+ hover:to-[a-z]+-[0-9]+/g, 'hover:bg-[#2C31B9]');
    
    // Replace text gradients
    content = content.replace(/bg-clip-text text-transparent/g, 'text-[#3C4DCE]');

    // Replace specific inline linear-gradients
    content = content.replace(/linear-gradient\([^)]+\)/g, '#3C4DCE');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed gradients in:', file);
    }
});
