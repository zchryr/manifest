const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

// Get the input values from the workflow YAML file
const manifestPath = core.getInput('manifest');
const ignoreDirs = core.getInput('manifest_ignore')
  ? core.getInput('manifest_ignore').split(',')
  : [];

function isIgnored(directory) {
  return ignoreDirs.some((ignoreDir) => {
    const ignoreParts = ignoreDir.split('/').filter((part) => part.length > 0);
    const directoryParts = directory
      .split('/')
      .filter((part) => part.length > 0);

    // Check if the directory path matches the 'manifest_ignore' path
    if (
      ignoreParts.length > 0 &&
      ignoreParts.every((part, index) => part === directoryParts[index])
    ) {
      return true; // The directory should be ignored
    }

    return false; // The directory should not be ignored
  });
}

// Function to search for files and directories in the current directory and subdirectories
function searchForFiles(directory, resultArray) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Check if the directory should be ignored
      if (!isIgnored(filePath)) {
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

// Get the current working directory
const currentDirectory = process.cwd();
const foundFiles = [];

// Start the search for files and directories
searchForFiles(currentDirectory, foundFiles);

// Convert the foundFiles array to a JSON string
const matrix = JSON.stringify(foundFiles, null, 2);

// Set the 'matrix' output to the JSON string
// core.setOutput('matrix', matrix);

// Print the JSON string to the console
console.log(matrix);
