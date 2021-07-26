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
  publish: {
    provider: 'github',
    owner: 'kholid060',
    token: process.env.GITHUB_TOKEN,
  },
  files: [
    'packages/**/dist/**',
  ],
  extraMetadata: {
    version: packageJSON.version,
  },
  win: {
    target: 'nsis',
    artifactName: '${productName}Setup-${arch}-${version}.${ext}',
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
  },
};

module.exports = config;
