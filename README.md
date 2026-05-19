# QR Code Generator

A lightweight, fully client-side QR code generator. No frameworks, no build tools — just open `index.html` in a browser and it works.

---

## Files

```
QR-CODE GENERATOR/
├── index.html   — markup and structure
├── style.css    — styling and responsive layout
└── script.js    — QR generation logic
```

---

## Features

- **5 content types** — URL, Text, Email, Phone, Wi-Fi
- **Customizable** — adjust size, foreground/background colors, and error correction level
- **Download** — save the QR code as a PNG
- **Copy** — copy the QR image directly to clipboard
- **Responsive** — works on desktop, tablet, and mobile
- **Dark mode** — respects system preference

---

## How to Run

1. Open the `QR-CODE GENERATOR` folder
2. Double-click `index.html` — it opens in your browser

Or in VS Code, right-click `index.html` → **Open with Live Server**.

---

## Dependencies

- [qrcodejs](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) — loaded via CDN, no installation needed. Requires an internet connection on first load.

---

## Browser Support

Works in all modern browsers — Chrome, Firefox, Safari, Edge.
