const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

// Function to retrieve inputs.
// This abstracts the difference between running inside GitHub Actions and running locally.
function getInput(inputName) {
  // If running within GitHub Actions, use the @actions/core package.
  if (process.env.GITHUB_ACTION) {
    return core.getInput(inputName);
  }
  // If running locally, fetch the input from environment variables.
  else {
    return process.env[inputName.toUpperCase()];
  }
}

// Retrieve the name of the manifest file to search for.
const manifestFileName = path.basename(getInput('manifest'));

// Retrieve the directories to ignore.
// This splits the input based on commas, and trims any whitespace.
// If the input isn't provided, defaults to an empty array.
const ignoreDirs = getInput('ignore_dirs')
  ? getInput('ignore_dirs')
      .split(',')
      .map((item) => item.trim())
  : [];

// Check if the root directory should be ignored.
// Convert the input to lowercase and check if it's 'true'.
// This allows for flexibility in the provided value, e.g., True, TRUE, etc.
const ignoreRoot = (getInput('IGNORE_ROOT') || '').toLowerCase() === 'true';

// Function to determine if a directory should be ignored.
function isIgnored(directory) {
  return ignoreDirs.some((ignoreDir) => {
    // Formulate a complete path for the directory to ignore.
    const fullIgnorePath = path.join(process.cwd(), ignoreDir);
    // Check if the directory starts with the ignored path.
    return directory.startsWith(fullIgnorePath);
  });
}

// Recursive function to search for the manifest file in a directory and its subdirectories.
function searchForFiles(directory, resultArray) {
  try {
    // Read all files and directories within the current directory.
    const files = fs.readdirSync(directory);

    for (const file of files) {
      // Formulate a full path for the file or directory.
      const filePath = path.join(directory, file);
      // Get details like if it's a file or directory.
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // If it's a directory and not in the ignore list, search within it.
        if (!isIgnored(filePath)) {
          searchForFiles(filePath, resultArray);
        }
      }
      // If it's the manifest file and we're either not ignoring the root
      // or the current directory isn't the root, add its details to the result.
      else if (file === manifestFileName) {
        if (!ignoreRoot || directory !== process.cwd()) {
          resultArray.push({
            // Only the directory path, not including the manifest file name.
            relativePath: path.relative(process.cwd(), directory),
            fullPath: filePath,
            cd: path.dirname(filePath),
          });
        }
      }
    }
  } catch (error) {
    // In case of an error (like permission issues), log it.
    console.error(
      `Error processing directory: ${directory}. Reason: ${error.message}`
    );
  }
}

// Start the search from the current working directory.
const currentDirectory = process.cwd();

// This array will store details of all the found manifest files.
const foundFiles = [];

// Kick off the search.
searchForFiles(currentDirectory, foundFiles);

// Convert the foundFiles array to a pretty-formatted JSON string.
const matrix = JSON.stringify(foundFiles, null, 2);

// If we're in GitHub Actions, set the matrix as an output.
if (process.env.GITHUB_ACTION) {
  core.setOutput('matrix', matrix);
} else {
  // Print the JSON string for visualization (useful both locally and in GitHub Actions logs).
  console.log(matrix);
}
