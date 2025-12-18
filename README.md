# MRI Visualizer

This repository contains a web based MRI DICOM viewer designed to make medical imaging easier to access, view, and share through a browser.

## Prerequisites

Before setting up the project, make sure you have the following installed on your computer:

* Node.js (LTS version recommended, 18.x works best)
* npm (comes with Node.js)
* Git

You can verify your installations by running:

```bash
node -v
npm -v
git --version
```

## Clone the Repository

Clone the repo to your local machine:

```bash
git clone https://github.com/lsuhs-lumbarlab/mri-visualizer.git
cd mri-visualizer
```

## Install Dependencies

This project uses older dependencies (Material UI v4) that conflict with newer React peer dependency checks. To avoid install errors, use legacy peer dependency resolution.

From the project root:

```bash
npm install --legacy-peer-deps
```

If you see errors related to peer dependencies and React, this is expected without the flag.

### Optional: Make legacy peer deps the default

If you work on older projects often, you can set this once on your machine:

```bash
npm config set legacy-peer-deps true
```

Then future installs can run with:

```bash
npm install
```

## Running the App

After dependencies are installed, start the development server:

```bash
npm start
```

The app will run locally and should automatically open in your browser at:

```
http://localhost:3000
```

If it does not open automatically, open the URL manually.

## Common Issues

### Dependency Resolution Errors

If you see an error mentioning `ERESOLVE unable to resolve dependency tree`, make sure you:

1. Deleted `node_modules` and `package-lock.json`
2. Reinstalled using:

   ```bash
   npm install --legacy-peer-deps
   ```

### Port Already in Use

If port 3000 is already in use, npm will prompt you to use another port. Type `Y` to accept.

## Notes

* This project is intended for development and research use.
* MRI files are expected to be DICOM format.
* The viewer runs entirely in the browser.

## Troubleshooting

If setup fails on a new machine, try the following:

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start
```

If problems persist, verify your Node.js version and dependency installation.
