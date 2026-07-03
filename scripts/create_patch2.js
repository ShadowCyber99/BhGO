const fs = require('fs');
const path = require('path');

const files = [
  'src/constants/logo.js',
  'src/screens/RiderHomeScreen.js',
  'src/screens/DriverHomeScreen.js'
];

let pythonCode = `import base64
import os

print("Applying Patch 2 (Logo Fixes, Modal Contrast, and Realtime Movement)...")

files_to_write = {
`;

for (let file of files) {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const b64 = Buffer.from(content).toString('base64');
  pythonCode += `    "/home/ubuntu/BharatOne-app/frontend/${file}": "${b64}",\n`;
}

pythonCode += `}

for filepath, b64_content in files_to_write.items():
    try:
        content = base64.b64decode(b64_content).decode('utf-8')
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Successfully updated {filepath}")
    except Exception as e:
        print(f"❌ Error updating {filepath}: {e}")

print("\\nPatch 2 applied successfully! Now run 'npm run build' again.\\n")
`;

fs.writeFileSync(path.join(__dirname, '../../brain/66d98c81-2784-45c5-ab74-b7c88cb99aa3/artifacts/patch2.py'), pythonCode);
console.log('Created patch2.py artifact');
