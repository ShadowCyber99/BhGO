const fs = require('fs');
const path = require('path');

const excludeDirs = ['.git', 'node_modules', '.expo', 'dist', 'build', 'artifacts', '.tempmediaStorage'];
const excludeFiles = ['package-lock.json', 'cab_ride-DB.sql', 'rename.js'];

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!excludeDirs.includes(file)) {
        walkSync(fullPath, callback);
      }
    } else {
      if (!excludeFiles.includes(file) && !file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.svg')) {
        callback(fullPath);
      }
    }
  }
}

let modifiedCount = 0;

walkSync(__dirname, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replacements
  // Cab Ride -> BharatGo
  content = content.replace(/Cab Ride/g, 'BharatGo');
  // CabRide -> BharatGo
  content = content.replace(/CabRide/g, 'BharatGo');
  // cab-ride -> bharatgo
  content = content.replace(/cab-ride/g, 'bharatgo');
  // cabride -> bharatgo
  content = content.replace(/cabride/g, 'bharatgo');
  // cab_ride (except when it's DB_NAME=cab_ride or cab_ride in SQL context which we should probably avoid touching just in case, but let's carefully replace only UI mentions if any)
  
  // We need to protect the DB name so let's revert DB_NAME
  content = content.replace(/DB_NAME=bharatgo/g, 'DB_NAME=cab_ride');
  content = content.replace(/database: process.env.DB_NAME \|\| 'bharatgo'/g, "database: process.env.DB_NAME || 'cab_ride'");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    modifiedCount++;
  }
});

console.log(`Total files modified: ${modifiedCount}`);
