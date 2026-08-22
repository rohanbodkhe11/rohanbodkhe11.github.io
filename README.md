# Rohan Bodkhe Portfolio

A responsive static portfolio for Rohan Bodkhe, deployed through GitHub Pages.

## Pages

- `index.html` is the public portfolio.
- `admin.html` is a browser-local CMS workspace.

## CMS mode

This repository is a static GitHub Pages site and has no server, database, storage bucket, or authentication runtime. The CMS uses `localStorage` for editing projects, certifications, gallery items, achievements, experience, education, skills, profile, settings, and messages in the current browser. It includes a first-use password gate, session logout, publish toggles, ordering, and 5 MB JPG/PNG/WEBP/PDF upload validation.

This local CMS is useful for previewing content changes. It is not a secure production admin system: the password and content are browser data, and they are not shared with other editors or visitors. Production use requires a backend with hashed credentials, authorization, database migrations, and object storage.

## Local preview

Open `index.html` directly, or serve the directory with any static HTTP server. Open `admin.html` to manage local content. No package manager or build step is required.

## Existing assets

Original portfolio images and font/vendor assets remain in `images/`, `fonts/`, `css/`, `js/`, and `lib/`.
