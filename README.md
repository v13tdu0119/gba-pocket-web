# GBA Pocket Web

Web app to browse and play **your own** Game Boy Advance dumps locally. ROMs stay on the machine that runs Vite — they are not bundled or published.

## Run locally

```bash
npm install
npm run dev
```

Put `.gba` or `.zip` files in `src/downloaded_roms`. `npm run dev` rebuilds the catalog from that folder.

This repo does not include Nintendo BIOS, commercial ROMs, or a dump inventory. Use files you are allowed to have.
