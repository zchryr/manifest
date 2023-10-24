const fs = require('fs');

const inputObjectPath = process.argv[2];
const localJsonPath = process.argv[3];

// Read and adjust the string to make it valid JSON
const rawObjectData = fs
  .readFileSync(inputObjectPath, 'utf-8')
  .replace(/(\w+):/g, '"$1":') // wrap keys without quotes with quotes
  .replace(/: ([^"]\S*[^"]),/g, ': "$1",') // wrap values without quotes with quotes
  .replace(/: ([^"]\S*[^"])\n/g, ': "$1"\n'); // wrap values without quotes that end on a newline with quotes

// Now it should be a valid JSON string, so we parse it
const translatedObject = JSON.parse(rawObjectData);

// Read and parse the local JSON file
const rawJsonData = fs.readFileSync(localJsonPath, 'utf-8');
const localJson = JSON.parse(rawJsonData);

// Compare the two parsed objects
if (JSON.stringify(translatedObject) === JSON.stringify(localJson)) {
  console.log('Matched!');
} else {
  console.error("JSON objects don't match!");
  process.exit(1);
}
