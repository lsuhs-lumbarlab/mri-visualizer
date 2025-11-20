# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE and Editor files
.vscode/

*.swp
*.swo
*~
.idea/

# Conda environment
.conda/
*.conda

# OS files
Thumbs.db
Desktop.ini

# Python files (if using any Python tools)
__pycache__/
*.py[cod]
*.pyc

# Logs
logs/
*.log

# Package manager lock files (optional - some prefer to commit these)
# package-lock.json
# yarn.lock

# Debug files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Environment variables
.env
.env.local
.env.*.local

# Test files
*.test.js.snap
```

# config-overrides.js

```js
module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
  };
  return config;
};
```

# package.json

```json
{
  "name": "mri-visualizer",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@material-ui/core": "^4.12.4",
    "@material-ui/icons": "^4.11.3",
    "@material-ui/lab": "^4.0.0-alpha.56",
    "@mdi/js": "^5.9.55",
    "@mdi/react": "^1.6.1",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^0.19.2",
    "blob-util": "^2.0.2",
    "cornerstone-core": "^2.6.1",
    "cornerstone-file-image-loader": "^0.3.0",
    "cornerstone-math": "^0.1.10",
    "cornerstone-tools": "^4.22.1",
    "cornerstone-wado-image-loader": "github:webnamics/cornerstoneWADOImageLoader",
    "cornerstone-web-image-loader": "^2.1.1",
    "daikon": "^1.2.46",
    "dexie": "^3.2.7",
    "dicom-parser": "^1.8.21",
    "file-saver": "^2.0.5",
    "hammerjs": "^2.0.8",
    "jszip": "^3.10.1",
    "lodash": "^4.17.21",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-perfect-scrollbar": "^1.5.8",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "react-app-rewired": "^2.2.1"
  }
}

```

# public\favicon.ico

This is a binary file of the type: Binary

# public\index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>

```

# public\logo192.png

This is a binary file of the type: Image

# public\logo512.png

This is a binary file of the type: Image

# public\manifest.json

```json
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}

```

# public\robots.txt

```txt
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

```

# README.md

```md
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

```

# src\App.css

```css
.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

```

# src\App.js

```js
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline, Box, CircularProgress } from '@material-ui/core';
import theme from './theme/theme';
import MainLayout from './components/Layout/MainLayout';
import Header from './components/Layout/Header';
import StudyExplorer from './components/StudyExplorer/StudyExplorer';
import CornerstoneViewport from './components/Viewport/CornerstoneViewport';
import FileUploader from './components/FileUpload/FileUploader';
import { initCornerstone } from './services/cornerstoneInit';
import { loadDicomFile, loadSeriesImageStack, isDicomFile } from './services/dicomLoader';
import db from './database/db';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFiles, setHasFiles] = useState(false);
  const [viewportData, setViewportData] = useState({
    sagittal: { imageIds: [], seriesDescription: '' },
    axial: { imageIds: [], seriesDescription: '' },
    coronal: { imageIds: [], seriesDescription: '' },
  });

  useEffect(() => {
    // Initialize Cornerstone
    initCornerstone();
    setIsInitialized(true);

    // Clear database on app start (don't persist across refreshes)
    clearDatabase();
  }, []);

  const clearDatabase = async () => {
    try {
      await db.files.clear();
      await db.series.clear();
      await db.studies.clear();
      await db.images.clear();
      setHasFiles(false);
      console.log('Database cleared on app start');
    } catch (error) {
      console.error('Error clearing database:', error);
    }
  };

  const handleFilesSelected = async (files) => {
    setIsLoading(true);
    try {
      // Load all DICOM files
      let loadedCount = 0;
      for (const file of files) {
        // Check if file is DICOM by content, not just extension
        const isDicom = await isDicomFile(file);
        if (isDicom) {
          await loadDicomFile(file);
          loadedCount++;
        }
      }
      
      if (loadedCount > 0) {
        setHasFiles(true);
        console.log(`Loaded ${loadedCount} DICOM file(s)`);
      } else {
        alert('No valid DICOM files found in the selected files.');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      alert('Error loading DICOM files. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeriesSelect = async (series) => {
    try {
      const imageIds = await loadSeriesImageStack(series.seriesInstanceUID);
      const orientation = series.orientation.toLowerCase();

      setViewportData((prev) => ({
        ...prev,
        [orientation]: {
          imageIds: imageIds,
          seriesDescription: series.seriesDescription,
        },
      }));
    } catch (error) {
      console.error('Error loading series:', error);
      alert('Error loading series. Check console for details.');
    }
  };

  if (!isInitialized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout
        header={<Header onOpenFiles={handleFilesSelected} />}
        sidebar={
          hasFiles ? (
            <StudyExplorer onSeriesSelect={handleSeriesSelect} />
          ) : (
            <FileUploader onFilesSelected={handleFilesSelected} />
          )
        }
        viewports={[
          <CornerstoneViewport
            key="sagittal"
            imageIds={viewportData.sagittal.imageIds}
            orientation="SAGITTAL"
            seriesDescription={viewportData.sagittal.seriesDescription}
          />,
          <CornerstoneViewport
            key="axial"
            imageIds={viewportData.axial.imageIds}
            orientation="AXIAL"
            seriesDescription={viewportData.axial.seriesDescription}
          />,
          <CornerstoneViewport
            key="coronal"
            imageIds={viewportData.coronal.imageIds}
            orientation="CORONAL"
            seriesDescription={viewportData.coronal.seriesDescription}
          />
        ]}
      />
      {isLoading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
          bgcolor="rgba(0,0,0,0.7)"
          zIndex={9999}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
```

# src\components\FileUpload\FileUploader.js

```js
import React, { useCallback } from 'react';
import { Box, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

const useStyles = makeStyles((theme) => ({
  dropZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: 400,
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(4),
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.light,
    },
  },
  icon: {
    fontSize: 64,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
}));

const FileUploader = ({ onFilesSelected }) => {
  const classes = useStyles();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = true;
    input.accept = '.dcm';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    };
    input.click();
  };

  return (
    <Paper
      className={classes.dropZone}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
    >
      <CloudUploadIcon className={classes.icon} />
      <Typography variant="h5" gutterBottom>
        Drop DICOM files here
      </Typography>
      <Typography variant="body2" color="textSecondary">
        or click to browse
      </Typography>
    </Paper>
  );
};

export default FileUploader;
```

# src\components\Layout\Header.js

```js
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  title: {
    flexGrow: 1,
  },
}));

const Header = ({ onOpenFiles }) => {
  const classes = useStyles();

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0 && onOpenFiles) {
      onOpenFiles(files);
    }
  };

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          MRI Visualizer - Lumbar Spine
        </Typography>
        <input
          accept=".dcm"
          style={{ display: 'none' }}
          id="upload-button"
          multiple
          type="file"
          webkitdirectory=""
          directory=""
          onChange={handleFileSelect}
        />
        <label htmlFor="upload-button">
          <IconButton color="inherit" component="span">
            <FolderOpenIcon />
          </IconButton>
        </label>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
```

# src\components\Layout\MainLayout.js

```js
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 200,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
  viewportArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
  },
}));

const MainLayout = ({ header, sidebar, viewports }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      {header}
      <Box className={classes.content}>
        {sidebar && <Box className={classes.sidebar}>{sidebar}</Box>}
        <Box className={classes.viewportArea}>{viewports}</Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
```

# src\components\StudyExplorer\StudyExplorer.js

```js
import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Collapse } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import db from '../../database/db';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  seriesItem: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  selected: {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StudyExplorer = ({ onSeriesSelect }) => {
  const classes = useStyles();
  const [studies, setStudies] = useState([]);
  const [openStudies, setOpenStudies] = useState({});
  const [selectedSeries, setSelectedSeries] = useState({});

  useEffect(() => {
    loadStudies();
  }, []);

  const loadStudies = async () => {
    const allStudies = await db.studies.toArray();
    const studiesWithSeries = await Promise.all(
      allStudies.map(async (study) => {
        const series = await db.series
          .where('studyInstanceUID')
          .equals(study.studyInstanceUID)
          .toArray();
        return { ...study, series };
      })
    );
    setStudies(studiesWithSeries);
    
    // Auto-expand first study
    if (studiesWithSeries.length > 0) {
      setOpenStudies({ [studiesWithSeries[0].studyInstanceUID]: true });
    }
  };

  const handleStudyClick = (studyUID) => {
    setOpenStudies((prev) => ({
      ...prev,
      [studyUID]: !prev[studyUID],
    }));
  };

  const handleSeriesClick = async (series) => {
    setSelectedSeries((prev) => ({
      ...prev,
      [series.orientation]: series.seriesInstanceUID,
    }));
    onSeriesSelect(series);
  };

  return (
    <Box className={classes.root}>
      <Box p={2}>
        <Typography variant="h6">Study Explorer</Typography>
      </Box>
      <List>
        {studies.map((study) => (
          <React.Fragment key={study.studyInstanceUID}>
            <ListItem button onClick={() => handleStudyClick(study.studyInstanceUID)}>
              <ListItemText
                primary={study.patientName || 'Unknown Patient'}
                secondary={`${study.studyDate || 'No date'} - ${
                  study.studyDescription || 'No description'
                }`}
              />
              {openStudies[study.studyInstanceUID] ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            
            <Collapse in={openStudies[study.studyInstanceUID]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {study.series.map((series) => (
                  <ListItem
                    key={series.seriesInstanceUID}
                    button
                    className={`${classes.nested} ${classes.seriesItem} ${
                      selectedSeries[series.orientation] === series.seriesInstanceUID
                        ? classes.selected
                        : ''
                    }`}
                    onClick={() => handleSeriesClick(series)}
                  >
                    <ListItemText
                      primary={`${series.orientation} - ${series.seriesDescription || 'No description'}`}
                      secondary={`Series ${series.seriesNumber || 'N/A'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default StudyExplorer;
```

# src\components\Viewport\CornerstoneViewport.js

```js
import React, { useEffect, useRef, useState } from 'react';
import { Box, Slider, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import { enableViewportTools } from '../../services/cornerstoneInit';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minWidth: '33%',
  },
  viewportWrapper: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewport: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    color: '#fff',
    pointerEvents: 'none',
    fontSize: '12px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
  },
  topLeft: {
    top: 5,
    left: 5,
  },
  topRight: {
    top: 5,
    right: 5,
    textAlign: 'right',
  },
  bottomLeft: {
    bottom: 5,
    left: 5,
  },
  bottomRight: {
    bottom: 5,
    right: 5,
    textAlign: 'right',
  },
  sliderContainer: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  slider: {
    flex: 1,
  },
  title: {
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const CornerstoneViewport = ({ 
  imageIds = [], 
  orientation = 'UNKNOWN',
  seriesDescription = ''
}) => {
  const classes = useStyles();
  const viewportRef = useRef(null);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [viewportData, setViewportData] = useState({
    zoom: 1,
    windowWidth: 0,
    windowCenter: 0,
  });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element || imageIds.length === 0) return;

    // Enable the element for cornerstone
    cornerstone.enable(element);

    // Load the first image
    cornerstone.loadImage(imageIds[0]).then((image) => {
      cornerstone.displayImage(element, image);

      // Set up the stack
      const stack = {
        currentImageIdIndex: 0,
        imageIds: imageIds,
      };
      cornerstoneTools.addStackStateManager(element, ['stack']);
      cornerstoneTools.addToolState(element, 'stack', stack);

      // Enable viewport tools
      enableViewportTools(element);

      // Update viewport data
      updateViewportData(element);

      // Listen to image rendered event
      element.addEventListener('cornerstoneimagerendered', () => {
        updateViewportData(element);
      });

      // Listen to stack scroll event
      element.addEventListener('cornerstonetoolsstackscroll', (e) => {
        const stackData = cornerstoneTools.getToolState(element, 'stack');
        if (stackData && stackData.data && stackData.data[0]) {
          setCurrentSlice(stackData.data[0].currentImageIdIndex);
        }
      });
    });

    return () => {
      cornerstone.disable(element);
    };
  }, [imageIds]);

  const updateViewportData = (element) => {
    const viewport = cornerstone.getViewport(element);
    const image = cornerstone.getImage(element);
    
    if (viewport && image) {
      setViewportData({
        zoom: viewport.scale.toFixed(2),
        windowWidth: Math.round(viewport.voi.windowWidth),
        windowCenter: Math.round(viewport.voi.windowCenter),
      });
    }
  };

  const handleSliceChange = (event, newValue) => {
    const element = viewportRef.current;
    if (!element) return;

    const stackData = cornerstoneTools.getToolState(element, 'stack');
    if (stackData && stackData.data && stackData.data[0]) {
      stackData.data[0].currentImageIdIndex = newValue;
      cornerstone.loadImage(imageIds[newValue]).then((image) => {
        cornerstone.displayImage(element, image);
        setCurrentSlice(newValue);
      });
    }
  };

  if (imageIds.length === 0) {
    return (
      <Paper className={classes.container}>
        <Box className={classes.title}>
          <Typography variant="subtitle2">
            {orientation} - {seriesDescription || 'No series loaded'}
          </Typography>
        </Box>
        <Box className={classes.viewportWrapper}>
          <Typography color="textSecondary">
            No images to display
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className={classes.container}>
      <Box className={classes.title}>
        <Typography variant="subtitle2">
          {orientation} - {seriesDescription}
        </Typography>
      </Box>
      
      <Box className={classes.viewportWrapper}>
        <div ref={viewportRef} className={classes.viewport} />
        
        {/* Overlays */}
        <Box className={`${classes.overlay} ${classes.topLeft}`}>
          <div>{orientation}</div>
          <div>{seriesDescription}</div>
        </Box>
        
        <Box className={`${classes.overlay} ${classes.bottomRight}`}>
          <div>Slice: {currentSlice + 1} / {imageIds.length}</div>
          <div>Zoom: {viewportData.zoom}</div>
          <div>W/L: {viewportData.windowWidth} / {viewportData.windowCenter}</div>
        </Box>
      </Box>

      {/* Slice Slider */}
      <Box className={classes.sliderContainer}>
        <Typography variant="caption">Slice:</Typography>
        <Slider
          className={classes.slider}
          value={currentSlice}
          min={0}
          max={imageIds.length - 1}
          onChange={handleSliceChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value + 1}/${imageIds.length}`}
        />
        <Typography variant="caption">
          {currentSlice + 1}/{imageIds.length}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CornerstoneViewport;
```

# src\database\db.js

```js
import Dexie from 'dexie';

const db = new Dexie('MRIVisualizerDB');

db.version(1).stores({
  files: '++id, name, type, sopInstanceUID, seriesInstanceUID, studyInstanceUID, imageId',
  series: 'seriesInstanceUID, studyInstanceUID, orientation, modality, seriesDescription, seriesNumber',
  studies: 'studyInstanceUID, patientName, patientID, studyDate, studyDescription',
  images: '++id, sopInstanceUID, imageData'
});

export default db;
```

# src\index.css

```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

```

# src\index.js

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

# src\services\cornerstoneInit.js

```js
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import Hammer from 'hammerjs';

let isInitialized = false;

export const initCornerstone = () => {
  if (isInitialized) return;

  // External dependencies for cornerstoneWADOImageLoader
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

  // Configure cornerstoneWADOImageLoader
  const config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
      },
    },
  };

  cornerstoneWADOImageLoader.webWorkerManager.initialize(config);

  // Initialize cornerstoneTools
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
  cornerstoneTools.external.Hammer = Hammer;

  // Initialize tools
  cornerstoneTools.init({
    mouseEnabled: true,
    touchEnabled: true,
    globalToolSyncEnabled: false,
    showSVGCursors: false,
  });

  // Add common tools
  cornerstoneTools.addTool(cornerstoneTools.PanTool);
  cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
  cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
  cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
  cornerstoneTools.addTool(cornerstoneTools.StackScrollTool);

  isInitialized = true;
  console.log('Cornerstone initialized successfully');
};

export const enableViewportTools = (element) => {
  // Add tools to this specific element
  cornerstoneTools.addToolForElement(element, cornerstoneTools.PanTool);
  cornerstoneTools.addToolForElement(element, cornerstoneTools.ZoomTool);
  cornerstoneTools.addToolForElement(element, cornerstoneTools.WwwcTool);
  cornerstoneTools.addToolForElement(element, cornerstoneTools.StackScrollMouseWheelTool);
  
  // Activate tools with mouse button bindings
  cornerstoneTools.setToolActiveForElement(element, 'Pan', { mouseButtonMask: 1 }); // Left click
  cornerstoneTools.setToolActiveForElement(element, 'Zoom', { mouseButtonMask: 4 }); // Middle click
  cornerstoneTools.setToolActiveForElement(element, 'Wwwc', { mouseButtonMask: 2 }); // Right click
  cornerstoneTools.setToolActiveForElement(element, 'StackScrollMouseWheel', {}); // Mouse wheel
  
  console.log('Viewport tools enabled for element:', element);
};
```

# src\services\dicomLoader.js

```js
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import db from '../database/db';

/**
 * Check if a file is a DICOM file by reading its header
 * DICOM files have 'DICM' at bytes 128-131
 */
export const isDicomFile = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        
        // Check for DICOM magic number 'DICM' at offset 128
        if (byteArray.length >= 132) {
          const dicm = String.fromCharCode(
            byteArray[128],
            byteArray[129],
            byteArray[130],
            byteArray[131]
          );
          
          if (dicm === 'DICM') {
            resolve(true);
            return;
          }
        }
        
        // Try parsing as DICOM (some files may not have the preamble)
        try {
          dicomParser.parseDicom(byteArray);
          resolve(true);
          return;
        } catch (e) {
          // Not a valid DICOM file
        }
        
        resolve(false);
      } catch (error) {
        resolve(false);
      }
    };
    
    reader.onerror = () => resolve(false);
    
    // Read first 1KB to check header
    reader.readAsArrayBuffer(file.slice(0, 1024));
  });
};

/**
 * Load DICOM file and extract metadata
 */
export const loadDicomFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // Parse DICOM file
        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);

        // Extract metadata
        const metadata = extractMetadata(dataSet);
        
        // Create image ID for cornerstone
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        
        // Store in IndexedDB
        await storeFileData(file, metadata, imageId, arrayBuffer);

        resolve({ imageId, metadata });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extract DICOM metadata
 */
const extractMetadata = (dataSet) => {
  const getString = (tag) => {
    try {
      const element = dataSet.elements[tag];
      return element ? dataSet.string(tag) : '';
    } catch (e) {
      return '';
    }
  };

  const getNumber = (tag) => {
    try {
      const element = dataSet.elements[tag];
      return element ? dataSet.floatString(tag) : null;
    } catch (e) {
      return null;
    }
  };

  return {
    // Patient Information
    patientName: getString('x00100010'),
    patientID: getString('x00100020'),
    patientBirthDate: getString('x00100030'),
    patientSex: getString('x00100040'),

    // Study Information
    studyInstanceUID: getString('x0020000d'),
    studyDate: getString('x00080020'),
    studyTime: getString('x00080030'),
    studyDescription: getString('x00081030'),

    // Series Information
    seriesInstanceUID: getString('x0020000e'),
    seriesNumber: getString('x00200011'),
    seriesDescription: getString('x0008103e'),
    modality: getString('x00080060'),

    // Image Information
    sopInstanceUID: getString('x00080018'),
    instanceNumber: getString('x00200013'),
    
    // Image Orientation and Position
    imageOrientationPatient: getString('x00200037'),
    imagePositionPatient: getString('x00200032'),
    sliceLocation: getNumber('x00201041'),
    sliceThickness: getNumber('x00180050'),

    // Image Dimensions
    rows: getNumber('x00280010'),
    columns: getNumber('x00280011'),
    pixelSpacing: getString('x00280030'),

    // Window/Level
    windowCenter: getNumber('x00281050'),
    windowWidth: getNumber('x00281051'),
  };
};

/**
 * Store file data in IndexedDB
 */
const storeFileData = async (file, metadata, imageId, arrayBuffer) => {
  // Store file reference
  await db.files.add({
    name: file.name,
    type: file.type,
    sopInstanceUID: metadata.sopInstanceUID,
    seriesInstanceUID: metadata.seriesInstanceUID,
    studyInstanceUID: metadata.studyInstanceUID,
    imageId: imageId,
  });

  // Store study
  await db.studies.put({
    studyInstanceUID: metadata.studyInstanceUID,
    patientName: metadata.patientName,
    patientID: metadata.patientID,
    studyDate: metadata.studyDate,
    studyDescription: metadata.studyDescription,
  });

  // Store series with orientation
  const orientation = determineOrientation(metadata.imageOrientationPatient);
  await db.series.put({
    seriesInstanceUID: metadata.seriesInstanceUID,
    studyInstanceUID: metadata.studyInstanceUID,
    seriesNumber: metadata.seriesNumber,
    seriesDescription: metadata.seriesDescription,
    modality: metadata.modality,
    orientation: orientation,
  });
};

/**
 * Determine image orientation (Sagittal, Axial, Coronal)
 */
const determineOrientation = (imageOrientationPatient) => {
  if (!imageOrientationPatient) return 'UNKNOWN';

  const values = imageOrientationPatient.split('\\').map(parseFloat);
  if (values.length !== 6) return 'UNKNOWN';

  const rowCosines = [values[0], values[1], values[2]];
  const colCosines = [values[3], values[4], values[5]];

  // Calculate cross product to get slice normal
  const normal = [
    rowCosines[1] * colCosines[2] - rowCosines[2] * colCosines[1],
    rowCosines[2] * colCosines[0] - rowCosines[0] * colCosines[2],
    rowCosines[0] * colCosines[1] - rowCosines[1] * colCosines[0],
  ];

  // Find dominant axis
  const absNormal = normal.map(Math.abs);
  const maxIndex = absNormal.indexOf(Math.max(...absNormal));

  // Determine orientation based on dominant axis
  if (maxIndex === 0) return 'SAGITTAL';  // X-axis (left-right)
  if (maxIndex === 1) return 'CORONAL';   // Y-axis (anterior-posterior)
  if (maxIndex === 2) return 'AXIAL';     // Z-axis (superior-inferior)

  return 'UNKNOWN';
};

/**
 * Load image stack for a series
 */
export const loadSeriesImageStack = async (seriesInstanceUID) => {
  // Get all files for this series
  const files = await db.files
    .where('seriesInstanceUID')
    .equals(seriesInstanceUID)
    .toArray();

  // Load images and sort by instance number or slice location
  const imagePromises = files.map(async (file) => {
    const image = await cornerstone.loadImage(file.imageId);
    return {
      imageId: file.imageId,
      image: image,
    };
  });

  const images = await Promise.all(imagePromises);

  // Sort by instance number (stored in image metadata)
  images.sort((a, b) => {
    const aInstance = parseInt(a.image.data.string('x00200013') || '0');
    const bInstance = parseInt(b.image.data.string('x00200013') || '0');
    return aInstance - bInstance;
  });

  return images.map(img => img.imageId);
};
```

# src\theme\theme.js

```js
import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
```

