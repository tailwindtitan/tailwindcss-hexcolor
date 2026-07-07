const fs = require("fs");
const path = require("path");
const plugin = require("tailwindcss/plugin");

const HEX_REGEX = /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function parseAlpha(a) {
  let val = a.replace(/_/g, ".");
  if (/^\d+$/.test(val)) {
    const num = parseFloat(val);
    if (num > 1 && num <= 100) {
      return `${num}%`;
    }
  }
  return val;
}

function parseColorUnit(val) {
  return val.replace(/_/g, ".");
}

function parseColorClass(value) {
  // 1. HEX
  if (HEX_REGEX.test(value)) {
    return `#${value}`;
  }

  // 2. RGB
  const rgbMatch = value.match(/^rgb(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9]+(?:[._][0-9]+)?%?)$/i);
  if (rgbMatch) {
    const r = parseColorUnit(rgbMatch[1]);
    const g = parseColorUnit(rgbMatch[2]);
    const b = parseColorUnit(rgbMatch[3]);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // 3. RGBA
  const rgbaMatch = value.match(/^rgba(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9a-zA-Z._%]+)$/i);
  if (rgbaMatch) {
    const r = parseColorUnit(rgbaMatch[1]);
    const g = parseColorUnit(rgbaMatch[2]);
    const b = parseColorUnit(rgbaMatch[3]);
    const a = parseAlpha(rgbaMatch[4]);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // 4. HSL
  const hslMatch = value.match(/^hsl(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9]+(?:[._][0-9]+)?%?)$/i);
  if (hslMatch) {
    const h = parseColorUnit(hslMatch[1]);
    let s = parseColorUnit(hslMatch[2]);
    let l = parseColorUnit(hslMatch[3]);
    if (/^[0-9.]+(?:%|deg|rad|turn)?$/.test(s) && !s.endsWith("%")) s += "%";
    if (/^[0-9.]+(?:%|deg|rad|turn)?$/.test(l) && !l.endsWith("%")) l += "%";
    return `hsl(${h}, ${s}, ${l})`;
  }

  // 5. HSLA
  const hslaMatch = value.match(/^hsla(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9]+(?:[._][0-9]+)?%?)(?:-|_)([0-9a-zA-Z._%]+)$/i);
  if (hslaMatch) {
    const h = parseColorUnit(hslaMatch[1]);
    let s = parseColorUnit(hslaMatch[2]);
    let l = parseColorUnit(hslaMatch[3]);
    const a = parseAlpha(hslaMatch[4]);
    if (/^[0-9.]+(?:%|deg|rad|turn)?$/.test(s) && !s.endsWith("%")) s += "%";
    if (/^[0-9.]+(?:%|deg|rad|turn)?$/.test(l) && !l.endsWith("%")) l += "%";
    return `hsla(${h}, ${s}, ${l}, ${a})`;
  }

  return null;
}

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
  
  const classRegex = new RegExp(`(${PREFIXES.join("|")})-([0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla)(?:-|_)[0-9a-zA-Z._%-]+)\\b`, "g");

  files.forEach((file) => {
    if (hasValidExtension(file)) {
      const content = fs.readFileSync(file, "utf8");
      let match;
      classRegex.lastIndex = 0;
      while ((match = classRegex.exec(content)) !== null) {
        const type = match[1];
        const value = match[2];
        if (parseColorClass(value) !== null) {
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

module.exports = plugin.withOptions(
  function (options = {}) {
    return function ({ matchUtilities }) {
      const srcDir = options.srcDir ? path.resolve(options.srcDir) : path.join(process.cwd(), "src");
      const foundColors = extractHexColorsByType(srcDir);

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
        (foundColors[prefix] || []).forEach((colorClass) => {
          const parsedColor = parseColorClass(colorClass);
          if (parsedColor) {
            values[colorClass] = parsedColor;
          }
        });

        matchUtilities(
          {
            [prefix]: (value) => {
              let colorVal = value;
              if (!colorVal.startsWith("#") && HEX_REGEX.test(colorVal)) {
                colorVal = `#${colorVal}`;
              } else {
                const parsed = parseColorClass(colorVal);
                if (parsed) {
                  colorVal = parsed;
                }
              }

              return builder(colorVal);
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
