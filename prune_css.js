const fs = require('fs');
const lines = fs.readFileSync('styles.css', 'utf8').split('\n');
// Lines from findstr are 1-based. 3396 to 3704.
// splice(startIndex, deleteCount)
// 3396 is index 3395.
lines.splice(3395, 3704 - 3396 + 1);
fs.writeFileSync('styles.css', lines.join('\n'));
