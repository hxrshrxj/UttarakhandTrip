# Uttarakhand Trip Companion

A no-build, mobile-first trip guide for 18–22 October 2026. It can be installed as a Progressive Web App and keeps the itinerary shell available offline after its first successful load. The app opens on the current trip day, remembers your day selection and stop progress, and shows progress in the day navigator. While online, use **Save photos offline** on a day to cache its destination photos; the app keeps up to 48 third-party photos, so older cached images may be replaced. The offline photo status reflects the photos currently in cache. Maps and uncached third-party images still need a connection.

Tickets are stored in this browser on this device. Use **Export backup** and **Import backup** in the ticket wallet to move them between devices. Backups contain the original files and notes as unencrypted JSON; keep them somewhere private.

## Preview locally

From this folder, run:

```powershell
node server.js
```

Then open <http://127.0.0.1:4173>. Use localhost or HTTPS for PWA installation and service-worker support; opening `index.html` directly as a file will not enable the PWA features.

## Publish with GitHub Pages

1. Create a GitHub repository and upload the contents of this folder, including the hidden `.github` folder and `.nojekyll` file.
2. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source.
3. Push to the repository's default branch. The workflow deploys the static files automatically; you can follow progress in the **Actions** tab.
4. Once deployment completes, open the Pages URL shown in the workflow run. GitHub Pages serves the site over HTTPS, so the install prompt and offline support can work there.

All app assets use relative paths, so this works both at a user-site root and under a project path such as `https://USERNAME.github.io/REPOSITORY/`. There is no package install or build step.

## Before making the repository public

The itinerary contains exact travel dates, hotel names and lodging addresses. Review those details before publishing publicly; use a private repository if you do not want them visible in the source or on the live site. Also recheck time-sensitive opening, bridge and price notes before travel.
