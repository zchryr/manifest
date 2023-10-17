const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

// Function to retrieve inputs.
// If running within GitHub Actions, it fetches inputs using the @actions/core package.
// If running locally, it fetches values from environment variables.
function getInput(inputName) {
  if (process.env.GITHUB_ACTION) {
    // In GitHub Actions, fetch the input using the @actions/core package.
    return core.getInput(inputName);
  } else {
    // Locally, fetch the input from environment variables.
    return process.env[inputName.toUpperCase()];
  }
}

// Retrieve the name of the manifest file to search for.
const manifestFileName = path.basename(getInput('manifest'));

// Retrieve the directories to ignore, split by commas and remove any whitespace.
// Default to an empty array if the input isn't provided.
const ignoreDirs = getInput('manifest_ignore')
  ? getInput('manifest_ignore')
      .split(',')
      .map((item) => item.trim())
  : [];

// Check if the root directory should be ignored.
// Defaults to false if the input isn't provided or isn't "true".
const ignoreRoot = (getInput('IGNORE_ROOT') || '').toLowerCase() === 'true';

// Function to check if a directory is in the list of directories to ignore.
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
      // Get details (like if it's a file or directory).
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // If it's a directory and not in the ignore list, search within it.
        if (!isIgnored(filePath)) {
          searchForFiles(filePath, resultArray);
        }
      } else if (file === manifestFileName) {
        // If it's the manifest file and either we're not ignoring the root
        // or the current directory isn't the root, add its details to the result.
        if (!ignoreRoot || directory !== process.cwd()) {
          resultArray.push({
            relativePath: path.relative(process.cwd(), filePath), // Relative path from the current working directory.
            fullPath: filePath, // Full path of the file.
            cd: path.dirname(filePath), // Directory containing the file.
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
