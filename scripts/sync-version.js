/* make the version in manifest.json match package.json */
const fs = require("fs");
const paths = require("../config/paths");

const packageJSON = JSON.parse(fs.readFileSync(paths.appPackageJson, "utf-8"));
let manifestJSON = JSON.parse(fs.readFileSync(paths.appManifestJSON, "utf-8"));
const newVersion = packageJSON.version;

console.log(`${manifestJSON.version} -> ${newVersion}`);
manifestJSON.version = newVersion;

fs.writeFileSync(paths.appManifestJSON, JSON.stringify(manifestJSON, null, 2));
