import { readFile } from 'fs/promises';
import { join } from 'path';

export default function (path) {
  const packageJSONPath = join(path, 'package.json');
  const packageJSON = JSON.parse(await readFile(packageJSONPath));

  return packageJSON;
}
