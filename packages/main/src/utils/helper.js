import { dialog } from 'electron';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import fetch from 'node-fetch';
import gitconfig from 'gitconfiglocal';

export async function readJson(params) {
  const { cwd, file } = typeof params === 'string' ? { cwd: params } : params;

  const path = join(cwd, file || 'package.json');
  const result = JSON.parse(await readFile(path));

  return result;
}

export function getRepository(path) {
  return new Promise((resolve) => {
    gitconfig(path, (err, config) => {
      if (err) return resolve('');

      const repository = config.remote?.origin?.url ?? '';

      resolve(repository.replace(/\.git$/, ''));
    });
  });
}

export async function selectProjectDirectory() {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });

    if (canceled) return { canceled };

    const [path] = filePaths;
    const config = await readJson(path);
    const repository = await getRepository(path);

    return {
      path,
      repository,
      name: config.name || path.split('\\').pop(),
    };
  } catch (error) {
    console.error(error);
    throw new Error('Can\'t find package.json file');
  }
}

export async function fetchNPMRegistry(path) {
  try {
    const response = await fetch(`https://registry.npmjs.org${path}`);
    const result = await response.json();

    return result;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getPackageManager(path) {
  const pkgManagers = [
    { name: 'yarn', file: 'yarn.lock' },
    { name: 'npm', file: 'package-lock.json' },
    { name: 'pnpm', file: 'pnpm-lock.yaml' },
  ];

  for (const { file, name } of pkgManagers) {
    const filePath = join(path, file);

    if (existsSync(filePath)) return name;
  }

  return 'npm';
}
