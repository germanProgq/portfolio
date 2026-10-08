# portfolio

My personal portfolio site. It is a single-page React app built with Vite, with motion handled by GSAP and Lenis, and a custom cursor effect compiled to WebAssembly.

## Tech

- React 18 and Vite 6
- GSAP and `@gsap/react` for animation, Lenis for smooth scrolling
- `use-scramble` for text effects, `simple-icons` for logos
- A cursor engine under `src/wasm/cursor-engine` loaded as WebAssembly

## Run it

```sh
npm install
npm run dev
```

Then open the URL Vite prints.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production into `dist` |
| `npm run preview` | Serve the production build locally |

## Layout

```
src/
  components/   UI sections (Hero, Projects, Experience, Contact, and more)
  context/      shared React context
  data/         site content (text, projects, links)
  hooks/        custom hooks
  styles/       styling
  utils/        helpers
  wasm/         cursor engine
public/         static assets (CV PDFs, favicon, robots.txt, sitemap.xml)
```

Content lives in `src/data/content.js`, so most text and project entries can be edited there.
