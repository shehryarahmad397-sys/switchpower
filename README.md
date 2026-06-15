# Switch Power Co (static site)

A **static** (HTML, CSS, JavaScript) company profile for **Switch Power Co**, suitable for **free hosting** such as [GitHub Pages](https://pages.github.com/), Netlify, or Cloudflare Pages. No backend server is required.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home: hero, about preview, client marquee, **top products** (above services), services, contact strip, CTA, footer |
| `about.html` | About: three content sections |
| `contact.html` | Contact: visit/call plus WhatsApp |
| `privacy.html` | Privacy Policy for KSA lighting and electrical retail |

## Before you publish

1. **WhatsApp:** In `js/main.js`, set `WHATSAPP_NUMBER` to your full international number **without** `+` or spaces (Saudi example: `966501234567`).
2. **Contact page:** Update address, phone, and email in `contact.html` to match your business.
3. **Images:** Swap `placehold.co` URLs for your own product and brand photography when available.

## GitHub Pages (project site)

If the site is served from `https://<user>.github.io/<repo>/`, keep asset paths as they are (`css/`, `js/`) and open **`index.html` at the repository root**, or set the published branch/folder to the project root in **Settings → Pages**.

## Local preview

Open `index.html` in a browser, or run a simple static server from this folder, for example:

```bash
npx --yes serve .
```

---

© Switch Power Co. Update business details to match your live operation.
