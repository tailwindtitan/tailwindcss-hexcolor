<div align="center">

# 🎨 tailwindcss-hexcolor

Write arbitrary color utilities in Tailwind CSS **without square bracket syntax (`[]`)**.

Supports **HEX**, **RGB**, **RGBA**, **HSL**, **HSLA**, and **CSS `color-mix()`** for **Tailwind CSS v3 & v4**.

<p align="center">

[![NPM Version](https://img.shields.io/npm/v/tailwindcss-hexcolor?style=flat-square&logo=npm)](https://www.npmjs.com/package/tailwindcss-hexcolor)
[![NPM Downloads](https://img.shields.io/npm/dt/tailwindcss-hexcolor?style=flat-square&logo=npm)](https://www.npmjs.com/package/tailwindcss-hexcolor)
[![License](https://img.shields.io/npm/l/tailwindcss-hexcolor?style=flat-square)](LICENSE)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3%20%26%20v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![GitHub Stars](https://img.shields.io/github/stars/SnehMoradia/tailwindcss-hexcolor?style=flat-square)](https://github.com/SnehMoradia/tailwindcss-hexcolor/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/SnehMoradia/tailwindcss-hexcolor?style=flat-square)](https://github.com/SnehMoradia/tailwindcss-hexcolor/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/SnehMoradia/tailwindcss-hexcolor?style=flat-square)](https://github.com/SnehMoradia/tailwindcss-hexcolor/issues)

</p>

**✨ Clean Syntax • 🚀 Zero Configuration • ⚡ Smart Caching • 🎨 Multiple Color Formats**

</div>

---

## ✨ Features

- 🚀 No `[]` syntax
- 🎨 Supports HEX, RGB(A), HSL(A), `color-mix()`
- ⚡ Zero configuration
- 🔄 Automatic scanning & rebuilds
- 💾 Smart caching
- ✅ Tailwind CSS v3 & v4 compatible

## 📦 Installation

```bash
npm install tailwindcss-hexcolor
```

## 🚀 Setup

### Tailwind CSS v4

```css
@import "tailwindcss";

@plugin "tailwindcss-hexcolor";
```

### Tailwind CSS v3

```js
module.exports = {
  plugins: [
    require("tailwindcss-hexcolor")(),
  ],
};
```

## 🎨 Examples

### HEX

```html
<div class="bg-6366f1 text-ffffff border-e5e7eb"></div>
```

```css
background-color: #6366f1;
color: #ffffff;
border-color: #e5e7eb;
```

---

### RGB

```html
<div class="bg-rgb-59-130-246"></div>
```

```css
background-color: rgb(59,130,246);
```

---

### RGBA

```html
<div class="bg-rgba-59-130-246-0.5"></div>
```

```css
background-color: rgba(59,130,246,0.5);
```

---

### HSL

```html
<div class="text-hsl-220-100-50"></div>
```

```css
color: hsl(220,100%,50%);
```

---

### HSLA

```html
<div class="border-hsla-220-100-50-0.5"></div>
```

```css
border-color: hsla(220,100%,50%,0.5);
```

---

### CSS `color-mix()`

```html
<div class="bg-mix-in-srgb--red-40--blue"></div>
```

```css
background-color: color-mix(in srgb, red 40%, blue);
```

## 🛠 Supported Utilities

| Utility | CSS Property |
|----------|--------------|
| `bg-*` | Background Color |
| `text-*` | Text Color |
| `border-*` | Border Color |
| `outline-*` | Outline Color |
| `ring-*` | Ring Color |
| `shadow-*` | Shadow Color |
| `fill-*` | SVG Fill |
| `stroke-*` | SVG Stroke |
| `accent-*` | Accent Color |
| `caret-*` | Caret Color |
| `decoration-*` | Text Decoration Color |
| `placeholder-*` | Placeholder Color |
| `divide-*` | Divide Color |
| `from-*` | Gradient Start |
| `via-*` | Gradient Middle |
| `to-*` | Gradient End |

## 🤝 Contributing

Contributions and feature requests are welcome!

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a Pull Request

## 📄 License

MIT License.

---

<div align="center">

### Made with ❤️ by **Sneh Moradia**

⭐ **If this project helped you, consider giving it a star!**

<a href="https://github.com/SnehMoradia/tailwindcss-hexcolor">
<img src="https://img.shields.io/github/stars/SnehMoradia/tailwindcss-hexcolor?style=for-the-badge&logo=github" alt="GitHub Stars">
</a>

</div>
