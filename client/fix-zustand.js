const fs = require("fs");
const path = require("path");

const filesToFix = [
  path.join(__dirname, "node_modules", "zustand", "esm", "middleware.mjs"),
  path.join(__dirname, "node_modules", "zustand", "esm", "index.mjs"),
  path.join(__dirname, "node_modules", "zustand", "esm", "vanilla.mjs"),
  path.join(__dirname, "node_modules", "zustand", "esm", "context.mjs"),
  path.join(__dirname, "node_modules", "zustand", "esm", "shallow.mjs"),
];

filesToFix.forEach((file) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf8");
    if (content.includes("import.meta.env")) {
      // Replace import.meta.env safely
      content = content.replace(/import\.meta\.env/g, "(typeof process !== 'undefined' ? process.env : {})");
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed import.meta in ${file}`);
    }
  }
});
