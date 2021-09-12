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
    target: 'default',
    category: 'public.app-category.developer-tools',
    darkModeSupport: true,
  },
  win: {
    target: 'nsis',
    artifactName: '${productName}Setup-${arch}-${version}.${ext}',
  },
};

module.exports = config;
