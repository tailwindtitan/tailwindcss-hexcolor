const fs = require("fs");
const path = require("path");
const plugin = require("tailwindcss/plugin");

const HEX_REGEX = /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const PREFIXES = [
  "bg",
  "text",
  "border",
  "outline",
  "ring",
  "shadow",
  "fill",
  "stroke",
  "accent",
  "caret",
  "decoration",
  "placeholder",
  "divide",
  "from",
  "via",
  "to",
];

function createDefaultCache() {
  const cache = {};
  PREFIXES.forEach((prefix) => {
    cache[prefix] = [];
  });
  return cache;
}

const VALID_EXTENSIONS = [
  ".html",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".vue",
  ".svelte",
  ".astro",
  ".php",
  ".blade.php",
  ".twig",
  ".erb",
  ".liquid",
  ".mdx",
  ".md"
];

function hasValidExtension(filename) {
  const lower = filename.toLowerCase();
  return VALID_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function getFilesRecursively(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      files = files.concat(getFilesRecursively(filePath));
    } else {
      files.push(filePath);
    }
  });
  return files;
}

function extractHexColorsByType(srcDir) {
  const result = {};
  PREFIXES.forEach((prefix) => {
    result[prefix] = new Set();
  });
  const files = getFilesRecursively(srcDir);
  
  const classRegex = new RegExp(`(${PREFIXES.join("|")})-([0-9a-fA-F]{3,8})\\b`, "g");

  files.forEach((file) => {
    if (hasValidExtension(file)) {
      const content = fs.readFileSync(file, "utf8");
      let match;
      classRegex.lastIndex = 0;
      while ((match = classRegex.exec(content)) !== null) {
        const type = match[1];
        const value = match[2];
        if (HEX_REGEX.test(value)) {
          result[type].add(value);
        }
      }
    }
  });

  const returnedResult = {};
  PREFIXES.forEach((prefix) => {
    returnedResult[prefix] = Array.from(result[prefix]);
  });
  return returnedResult;
}

const areColorsEqual = (c1, c2) => {
  if (!c1 || !c2) return false;
  for (const key of PREFIXES) {
    const arr1 = c1[key] || [];
    const arr2 = c2[key] || [];
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    if (!sorted1.every((val, index) => val === sorted2[index])) {
      return false;
    }
  }
  return true;
};

// Automatic file watcher to monitor HTML and JS files in src directory
function startWatcher(srcDir, cachePath, inputCssPath) {
  if (!fs.existsSync(srcDir)) return;

  const watcherKey = `hexColorWatcher_${srcDir}`;
  if (global[watcherKey]) {
    try {
      global[watcherKey].close();
    } catch (e) {}
    delete global[watcherKey];
  }

  let timeoutId = null;
  const onChange = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const foundColors = extractHexColorsByType(srcDir);
      
      let cachedColors = createDefaultCache();
      if (fs.existsSync(cachePath)) {
        try {
          cachedColors = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        } catch (e) {}
      }

      if (!areColorsEqual(foundColors, cachedColors)) {
        // Update cache
        try {
          fs.writeFileSync(cachePath, JSON.stringify(foundColors, null, 2), "utf8");
        } catch (err) {}
        
        // Touch input.css to trigger Tailwind CLI watch build
        if (fs.existsSync(inputCssPath)) {
          try {
            const now = new Date();
            fs.utimesSync(inputCssPath, now, now);
          } catch (err) {
            try {
              let cssContent = fs.readFileSync(inputCssPath, "utf8");
              cssContent = cssContent.replace(/\/\*\s*last-update:\s*\d+\s*\*\//g, "");
              cssContent += `\n/* last-update: ${Date.now()} */`;
              fs.writeFileSync(inputCssPath, cssContent, "utf8");
            } catch (e) {
              console.error("Failed to reload tailwind build in watcher", e);
            }
          }
        }
      }
    }, 100);
  };

  try {
    const watcher = fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
      if (filename) {
        if (hasValidExtension(filename)) {
          onChange();
        }
      } else {
        onChange();
      }
    });
    if (typeof watcher.unref === "function") {
      watcher.unref();
    }
    global[watcherKey] = watcher;
  } catch (err) {
    console.error(`Failed to start hexColor watch utility for ${srcDir}:`, err);
  }
}

module.exports = plugin.withOptions(
  function (options = {}) {
    return function ({ matchUtilities }) {
      const srcDir = options.srcDir ? path.resolve(options.srcDir) : path.join(process.cwd(), "src");
      const cachePath = options.cachePath ? path.resolve(options.cachePath) : path.join(process.cwd(), "colors-cache.json");
      const inputCssPath = options.inputCssPath ? path.resolve(options.inputCssPath) : path.join(process.cwd(), "src/input.css");
      
      // Start watching for changes automatically on load
      startWatcher(srcDir, cachePath, inputCssPath);

      const foundColors = extractHexColorsByType(srcDir);

      // Cache check
      let cachedColors = createDefaultCache();
      if (fs.existsSync(cachePath)) {
        try {
          cachedColors = JSON.parse(fs.readFileSync(cachePath, "utf8"));
        } catch (e) {
          cachedColors = createDefaultCache();
        }
      }

      if (!areColorsEqual(foundColors, cachedColors)) {
        // Update cache
        try {
          fs.writeFileSync(cachePath, JSON.stringify(foundColors, null, 2), "utf8");
        } catch (err) {
          console.error("Error writing to cachePath:", err);
        }
        
        // In Tailwind v4, we touch src/input.css to trigger a rebuild
        if (fs.existsSync(inputCssPath)) {
          try {
            const now = new Date();
            fs.utimesSync(inputCssPath, now, now);
          } catch (err) {
            // Fallback: update timestamp comment inside CSS file
            try {
              let cssContent = fs.readFileSync(inputCssPath, "utf8");
              cssContent = cssContent.replace(/\/\*\s*last-update:\s*\d+\s*\*\//g, "");
              cssContent += `\n/* last-update: ${Date.now()} */`;
              fs.writeFileSync(inputCssPath, cssContent, "utf8");
            } catch (e) {
              console.error("Failed to reload tailwind build", e);
            }
          }
        }
      }

      const prefixBuilders = {
        bg: (hex) => ({ 'background-color': hex }),
        text: (hex) => ({ 'color': hex }),
        border: (hex) => ({ 'border-color': hex }),
        outline: (hex) => ({ 'outline-color': hex }),
        ring: (hex) => ({ '--tw-ring-color': hex }),
        shadow: (hex) => ({ '--tw-shadow-color': hex }),
        fill: (hex) => ({ 'fill': hex }),
        stroke: (hex) => ({ 'stroke': hex }),
        accent: (hex) => ({ 'accent-color': hex }),
        caret: (hex) => ({ 'caret-color': hex }),
        decoration: (hex) => ({ 'text-decoration-color': hex }),
        placeholder: (hex) => ({
          '&::placeholder': {
            'color': hex,
          },
        }),
        divide: (hex) => ({
          '& > :not([hidden]) ~ :not([hidden])': {
            'border-color': hex,
          },
        }),
        from: (hex) => ({
          '--tw-gradient-from': hex,
          '--tw-gradient-stops': 'var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))',
        }),
        via: (hex) => ({
          '--tw-gradient-via': hex,
          '--tw-gradient-via-stops': 'var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position), var(--tw-gradient-to) var(--tw-gradient-to-position)',
          '--tw-gradient-stops': 'var(--tw-gradient-via-stops)',
        }),
        to: (hex) => ({
          '--tw-gradient-to': hex,
          '--tw-gradient-stops': 'var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))',
        }),
      };

      Object.entries(prefixBuilders).forEach(([prefix, builder]) => {
        const values = {};
        (foundColors[prefix] || []).forEach((color) => {
          values[color] = `#${color}`;
        });

        matchUtilities(
          {
            [prefix]: (value) => {
              let hex = value;
              if (!hex.startsWith("#") && HEX_REGEX.test(hex)) {
                hex = `#${hex}`;
              }

              if (!hex.startsWith("#")) {
                return {};
              }

              return builder(hex);
            },
          },
          {
            values: values,
            type: "any",
          }
        );
      });
    };
  }
);

// Clear require cache for this module so Node loads it fresh on every rebuild
try {
  delete require.cache[require.resolve(__filename)];
} catch (e) {}
