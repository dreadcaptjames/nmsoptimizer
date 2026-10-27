# ATLAS MAX — Universal static web app

This is one complete, host-independent website. It uses relative asset paths and requires no backend, build process, package manager, API keys, or framework. All website files belong in the published site root.

## GitHub Pages

1. Extract the ZIP and upload **the extracted files** (including `index.html`, `.nojekyll`, CSS and JavaScript files) to the **root of your GitHub repository**. Do not upload the ZIP itself as the website.
2. Commit the files to your default branch (for example, `main`).
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**; select your branch and **/(root)**, then save.
4. Open the Pages URL displayed in Settings → Pages. For a project repository, it will typically look like `https://USERNAME.github.io/REPOSITORY/`.

No custom domain, `base` URL, build command, or Actions workflow is required. GitHub Pages deployment can take a few minutes after a push.

## Netlify

Drag and drop this ZIP into Netlify's manual deploy area, or deploy the extracted files from a connected Git repository. Set the publish directory to the project root; no build command is needed.

## Other static hosts

Upload the extracted contents to the public document root of any host that serves static HTML, CSS, and JavaScript. The site works at the domain root or under a subdirectory because local asset URLs are relative.

## Notes

- The theme selector remembers the selected color using browser local storage.
- Equipment builds still start fresh on page reload, and must be exported/imported to preserve them.
- The Crafting & Refining link opens an external site in a new tab.
- The app does not need server-side code or a database.
- Opening `index.html` directly from disk may have browser-specific restrictions; use a static host for reliable behavior.
