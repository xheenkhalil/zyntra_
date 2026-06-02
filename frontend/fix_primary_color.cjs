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
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(directoryPath);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix hover states first
    content = content.replace(/hover:bg-\[\#1A1F91\]/gi, 'hover:bg-[#080D2B]');
    content = content.replace(/'&:hover':\s*\{\s*bgcolor:\s*'#1a1f91'\s*\}/gi, "'&:hover': { bgcolor: '#080D2B' }");
    
    // Fix all remaining primary color references to the correct #111A50
    content = content.replace(/#1A1F91/gi, '#111A50');
    // Also, if any 3c4dce were still left somehow (maybe in rgba string)
    content = content.replace(/3C4DCE/gi, '111A50');
    content = content.replace(/60,\s*77,\s*206/gi, '17, 26, 80'); // rgba conversion for 111a50

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed primary color in:', file);
    }
});
