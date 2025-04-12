const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svgBuffer = fs.readFileSync(path.join(__dirname, "../assets/logo.svg"));

sharp(svgBuffer)
  .png()
  .resize(512, 512)
  .toFile(path.join(__dirname, "../assets/logo.png"))
  .then(() => console.log("Logo converted successfully"))
  .catch((err) => console.error("Error converting logo:", err));
