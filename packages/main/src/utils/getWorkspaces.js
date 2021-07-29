import globby from 'globby';
import { existsSync } from 'fs';
import { getPackages } from '@lerna/project';
import { join } from 'path';
import { readJson } from './helper';

async function formatWorkspace(path) {
  const config = await readJson(path);
  const name = config.name || path.split('\\').pop();

  return { path, name };
}

export default async function(cwd) {
  const pkg = await readJson(cwd);

  if (pkg.workspaces) {
    let workspaces = [];

    if (Array.isArray(pkg.workspaces)) {
      workspaces = pkg.workspaces;
    } else if (pkg.workspaces.packages) {
      workspaces = pkg.workspaces.packages;
    }

    const folders = await globby(workspaces, {
      cwd,
      onlyDirectories: true,
      absolute: true,
      expandDirectories: false,
    });

    const results = Promise.all(
      folders
        .sort()
        .filter((path) => existsSync(join(path, 'package.json')))
        .map(formatWorkspace),
    );

    return results;
  }

  const isLernaWorkspace = existsSync(join(cwd, 'lerna.json'));

  if (isLernaWorkspace) {
    const lernaFolders = (await getPackages(cwd)).map((pkg) => pkg.location);

    return Promise.all(lernaFolders.map(formatWorkspace));
  }

  return [];
}
