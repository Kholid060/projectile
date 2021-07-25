import maxSatisfying from 'semver/ranges/max-satisfying';
import semverLt from 'semver/functions/lt';
import semverValid from 'semver/functions/valid';

export function getLatestVersion(currentVersion, versions) {
  const validVersion = semverValid(currentVersion);

  if (versions[currentVersion] || !validVersion) {
    return {
      isLatest: true,
      latestVersion: !validVersion ? '-' : versions[currentVersion],
    };
  }

  const latestVersion =
    maxSatisfying(Object.values(versions), `>=${currentVersion}`) ||
    currentVersion;
  const isLessThanLatest = semverLt(currentVersion, latestVersion);

  return {
    latestVersion: latestVersion || '-',
    isLatest: currentVersion === latestVersion || !isLessThanLatest,
  };
}

export default function (name, version = 'latest') {
  return new Promise((resolve, reject) => {
    window.electron.ipcRenderer
      .callMain('fetch-npm-registry', `/-/package/${name}/dist-tags`)
      .then((versions) => {
        if (typeof versions === 'string') return reject(versions);

        const latestVersion = getLatestVersion(version, versions);

        resolve({ latestVersion, distTags: versions });
      })
      .catch(reject);
  });
}
