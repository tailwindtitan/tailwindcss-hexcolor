# tailwind-plugin-hexcolor

A powerful Tailwind CSS plugin that scans your template files recursively, extracts arbitrary hex color utility classes, and dynamically registers them as custom utilities using Tailwind's `matchUtilities` engine.

Support is provided out-of-the-box for **Tailwind CSS v4** (CSS-first config) and **Tailwind CSS v3** (JS-based config).

---

## Key Features

 - **Multiple Color Formats**: Write classes using **HEX**, **RGB**, **RGBA**, **HSL**, or **HSLA** values (e.g. `bg-fff`, `text-rgb-255-0-0`, `border-rgba-0-0-255-0_5`, `bg-hsl-200-100-50`, `text-hsla-120-100-40-0_8`).
- **16 Core CSS Prefixes Supported**: From backgrounds and text to gradients, borders, shadows, outline, accents, placeholder, caret, and divide.
- **Virtually Every Template Extension Scanned**: Automatically scans HTML, JS, JSX, TS, TSX, Vue, Svelte, Astro, PHP, Blade templates, Twig templates, ERB, Liquid, MDX, and standard Markdown.
- **Native Watcher & Automatic Rebuilding**: Starts a lightweight recursive watcher in development, updating the cache and triggering a Tailwind rebuild whenever you update your templates.

---

## Supported Utility Classes

Any arbitrary HEX, RGB, RGBA, HSL, or HSLA code can be combined with the following prefixes:

### Color Formats
1. **HEX**: `333`, `fff`, `ff0000`, `ff000080` (e.g. `bg-333`, `text-ff000080`)
2. **RGB**: `rgb-r-g-b` or `rgb_r_g_b` (e.g. `bg-rgb-255-0-0`, `bg-rgb_255_0_0` -> `rgb(255, 0, 0)`)
3. **RGBA**: `rgba-r-g-b-a` or `rgba_r_g_b_a` (e.g. `bg-rgba-255-0-0-0.5`, `bg-rgba_255_0_0_0_5` -> `rgba(255, 0, 0, 0.5)`)
4. **HSL**: `hsl-h-s-l` or `hsl_h_s_l` (e.g. `bg-hsl-200-100-50` -> `hsl(200, 100%, 50%)`)
5. **HSLA**: `hsla-h-s-l-a` or `hsla_h_s_l_a` (e.g. `bg-hsla-120-100-40-0.8`, `bg-hsla_120_100_40_0_8` -> `hsla(120, 100%, 40%, 0.8)`)

*Note: For alpha channels in RGBA/HSLA, underscores `_` are converted to decimals (dots) dynamically (e.g., `0_5` -> `0.5`).*

### Supported Prefixes

| Class Prefix | CSS Generated Style | Example |
| :--- | :--- | :--- |
| `bg-` | `background-color` | `bg-5746af` |
| `text-` | `color` | `text-ff0000` |
| `border-` | `border-color` | `border-ffb900` |
| `outline-` | `outline-color` | `outline-444444` |
| `ring-` | `--tw-ring-color` | `ring-555555` |
| `shadow-` | `--tw-shadow-color` | `shadow-666666` |
| `fill-` | `fill` | `fill-777777` |
| `stroke-` | `stroke` | `stroke-888888` |
| `accent-` | `accent-color` | `accent-999999` |
| `caret-` | `caret-color` | `caret-aaaaaa` |
| `decoration-` | `text-decoration-color` | `decoration-bbbbbb` |
| `placeholder-` | `::placeholder { color: ... }` | `placeholder-cccccc` |
| `divide-` | `> :not([hidden]) ~ :not([hidden]) { border-color: ... }` | `divide-dddddd` |
| `from-` | Gradient start color and stops setup | `from-eeeeee` |
| `via-` | Gradient middle color and stops setup | `via-112233` |
| `to-` | Gradient end color and stops setup | `to-445566` |

---

## Installation

### Method 1: Using NPM (via GitHub repository link)
Add this package to your project's `dependencies` by running:
```bash
npm install github:username/tailwind-plugin-hexcolor --save-dev
```
*(Replace `username/tailwind-plugin-hexcolor` with your repository URL).*

### Method 2: Manual Download
Simply download the `index.js` file from the repository and place it in your project (e.g., in a `/plugins` folder).

---

## Setup & Usage

### 1. In Tailwind CSS v4 (CSS-First config)
Import the plugin directly into your input CSS file using the `@plugin` directive:

```css
/* src/input.css */
@import "tailwindcss";

@plugin "tailwind-plugin-hexcolor" {
  srcDir: "./src";
  cachePath: "./colors-cache.json";
  inputCssPath: "./src/input.css";
};
```
*If you manually downloaded the file, point the plugin path to the local file:*
```css
@plugin "../plugins/index.js" {
  srcDir: "./src";
  cachePath: "./colors-cache.json";
  inputCssPath: "./src/input.css";
};
```

### 2. In Tailwind CSS v3 (JS-First config)
Register the plugin inside your `tailwind.config.js` file:

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,vue,svelte}"],
  plugins: [
    require('tailwind-plugin-hexcolor')({
      srcDir: "./src",
      cachePath: "./colors-cache.json",
      inputCssPath: "./src/input.css"
    })
  ]
}
```

---

## Configuration Options

You can pass the following optional parameters (as shown in the configuration examples above):

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `srcDir` | `string` | `path.join(process.cwd(), "src")` | Directory to scan recursively for template files. |
| `cachePath` | `string` | `path.join(process.cwd(), "colors-cache.json")` | Path where the extracted colors cache JSON file will be stored. |
| `inputCssPath` | `string` | `path.join(process.cwd(), "src/input.css")` | Path to your input CSS file. Touched to trigger rebuilds on changes. |

---

## Under the Hood

1. **Scanning**: When you trigger a build or update a file, the plugin recursively crawls your `srcDir` directory, reading code files with valid extensions.
2. **Regex Parsing**: It parses any class matching `(prefix)-([0-9a-fA-F]{3,8})` and checks them against a strict hexadecimal regex.
3. **Caching**: Extracted color classes are grouped and written to a cache file (`colors-cache.json`). The cache prevents unnecessary compiler cycles.
4. **Watcher**: A filesystem watcher listens for modifications to files in your template directory. When a file is modified, it runs a diff against the cache. If new colors are introduced or unused ones removed, it saves the cache and touches the input CSS file to trigger a Tailwind compiler run.

---

## License

This project is licensed under the [MIT License](LICENSE).
