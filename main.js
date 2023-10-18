const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to retrieve inputs.
// This function abstracts the difference between running inside GitHub Actions and running locally.
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

// Retrieve the pattern for the manifest files to search for.
// This can include wildcards, e.g., "*.csproj".
const manifestPattern = getInput('manifest');

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

// Function to search for files matching the manifest pattern in a directory and its subdirectories.
function searchForFiles(directory, resultArray, currentWorkingDirectory) {
  // Use the glob package to search for files matching the manifest pattern.
  // Note: ** matches all directories; * matches within the current directory.
  glob.sync(`${directory}/**/${manifestPattern}`).forEach((filePath) => {
    const directoryOfFoundFile = path.dirname(filePath);

    // Calculate the relative path from the current working directory to the directory
    // where the found file is located. This helps determine the location of the file
    // relative to the current working directory.
    let relativePath = path.relative(
      currentWorkingDirectory,
      directoryOfFoundFile
    );

    // If the relativePath is empty (current working directory), set it to '.'
    if (!relativePath) {
      relativePath = '.';
    }

    if (
      !isIgnored(directoryOfFoundFile) &&
      (!ignoreRoot || directoryOfFoundFile !== currentWorkingDirectory)
    ) {
      // Adjust relativePath when found in the current working directory
      if (relativePath === '.') {
        relativePath = path.basename(currentWorkingDirectory);
      }

      resultArray.push({
        relativePath: relativePath,
        fullPath: filePath,
        cd: directoryOfFoundFile,
      });
    }
  });
}

// Get the current working directory
const currentDirectory = process.cwd();

// Initialize an array to store details of all the found manifest files
const foundFiles = [];

// Kick off the search
searchForFiles(currentDirectory, foundFiles, currentDirectory);

// Convert the foundFiles array to a pretty-formatted JSON string
const matrix = JSON.stringify(foundFiles, null, 2);

// If we're in GitHub Actions, set the matrix as an output
// Otherwise, print the JSON string for visualization when running locally
if (process.env.GITHUB_ACTION) {
  core.setOutput('matrix', matrix);
} else {
  console.log(matrix);
}
