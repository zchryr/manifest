const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

const manifestPath = core.getInput('manifest');
const ignoreDirs = core.getInput('manifest_ignore')
  ? core.getInput('manifest_ignore').split(',')
  : [];

function searchForFiles(directory, resultArray) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        searchForFiles(filePath, resultArray); // Recursively search in subdirectories
      }
    } else if (file === manifestPath) {
      resultArray.push({
        relativePath: path.relative(process.cwd(), filePath),
        fullPath: filePath,
        cd: path.dirname(filePath),
      });
    }
  }
}

const currentDirectory = process.cwd();
const foundFiles = [];

searchForFiles(currentDirectory, foundFiles);

// Convert the foundFiles array to a JSON string
const matrix = JSON.stringify(foundFiles, null, 2);

core.setOutput('matrix', matrix);
console.log(matrix);
