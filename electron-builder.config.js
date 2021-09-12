const packageJSON = require('./package.json');

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.kholid060.projectile',
  directories: {
    output: 'dist',
    buildResources: 'buildResources',
  },
  files: [
    'packages/**/dist/**',
  ],
  extraMetadata: {
    version: packageJSON.version,
  },
  mac: {
    category: 'public.app-category.developer-tools',
    darkModeSupport: true,
  },
  win: {
    target: 'nsis',
    artifactName: '${productName}Setup-${arch}-${version}.${ext}',
  },
  nsis: {
    allowToChangeInstallationDirectory: true,
    oneClick: false,
  },
};

module.exports = config;
