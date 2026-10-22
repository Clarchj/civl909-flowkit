# Putting the app on an iPhone 12 (no App Store, no Swift)

The app is a web page. `python build.py --subject subjects/civl909` makes everything it needs in `dist/`:
`index.html` (the page), `civl909_media/` (the lecture slides and tutorial pages), `manifest.webmanifest`, `sw.js` (makes it open offline), and the icons. **Upload the whole `dist/` folder, not just the html.**

## 1. Host it somewhere private (free)
The pictures are your lecture slides and tutorial sheets, so do not put them on a public link.

**Cloudflare Pages + Access (recommended, free).** Workers & Pages, Create, Upload assets, drag `dist`. Then Zero Trust, Access, Applications, add the Pages address, policy "emails ending in your address", login by one-time PIN. Only you get in.
**Netlify Drop** (app.netlify.com/drop): drag `dist`. A password needs the paid plan, so the link is public to anyone who knows it: fine for your own use if you do not share it, not for sharing.
**GitHub Pages:** free plan needs a public repository. Do not use it for the slides.
**Home Wi-Fi only (testing):** on the PC run `python -m http.server 8766` inside `dist`, open `http://<the PC's address>:8766` in Safari on the phone. It works while the PC is on and you are on the same Wi-Fi; iOS will not run the offline worker on plain http, so it does not work offline this way.

## GitHub
The code is in the private repository **Clarchj/civl909-flowkit**. Every push runs `.github/workflows/pages.yml`: it rebuilds `dist/` in the cloud (Python only) and
1. saves it as a downloadable artifact (repository, Actions, the latest run, Artifacts: `civl909-app`): unzip it and upload the folder to Cloudflare Pages (above);
2. publishes it to **GitHub Pages** if Pages is available. **On a free account Pages works only for a public repository, and a public repository would publish the lecture slides and tutorial pages.** So the deploy step fails while the repository is private on the free plan: that is expected. Choose one: keep it private and use Cloudflare Pages with the artifact, or upgrade to GitHub Pro (private Pages), or make the repository public (Settings, Danger zone) after deciding you are happy to publish the slides, then Settings, Pages, Source: GitHub Actions.

## 2. Install on the iPhone
1. Open the address in **Safari** (not Chrome: only Safari can add Home Screen apps on iOS).
2. Share button, **Add to Home Screen**, Add. The "909" icon appears.
3. Open it from the Home Screen once **while online**: it saves the page and all 139 pictures (about 4 MB).
4. Test: Settings, Airplane mode on, open the app. It should work, including the pictures.
It opens full screen, with the tabs (Map, Library, Notation, Quiz, Exam) as a bottom bar.

## 3. Updating
Rebuild, upload `dist/` again. The app checks for a new version when it opens online: close it fully (swipe up) and open it twice to get the new one.

## On the phone
- **Map:** opens on step 1; the step bar (‹ ›) walks through the working. Pinch to zoom, drag to move. **⋯** has the rest of the toolbar.
- **Gates:** the line under the toolbar is the result of every either / or; **Open gates** shows them all and lets you preview a different branch.
- **Companion** (Question, Picture, Solution, Teardown, Lecture, Notes): the reading happens here; tap a slide to enlarge it.
