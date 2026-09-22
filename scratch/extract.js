const fs = require('fs');
const transcriptPath = 'C:/Users/Prateek/.gemini/antigravity/brain/38581513-1151-48d0-8ac4-d059eb97894b/.system_generated/logs/transcript_full.jsonl';
if (!fs.existsSync(transcriptPath)) {
  console.log('Transcript not found');
  process.exit(1);
}
const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.trim().split('\n');
console.log('Lines count:', lines.length);
for (let i = lines.length - 1; i >= 0; i--) {
  try {
    const item = JSON.parse(lines[i]);
    if (item.type === 'USER_INPUT') {
      console.log('Found user input at index', i);
      fs.writeFileSync('scratch/prompt.txt', item.content);
      console.log('Wrote scratch/prompt.txt, size:', item.content.length);
      break;
    }
  } catch (e) {}
}
