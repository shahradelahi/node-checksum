import { promises } from 'node:fs';
import { resolve } from 'node:path';

export async function fsAccess(path: string): Promise<boolean> {
  try {
    await promises.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stat = await promises.stat(path);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

type AuditedFile = {
  path: string;
  directory: boolean;
  symlink: boolean;
};

async function auditFiles(paths: string[]): Promise<AuditedFile[]> {
  const results = [];
  for (const path of paths) {
    const stats = await promises.stat(resolve(path));
    results.push({
      path,
      directory: stats.isDirectory(),
      symlink: stats.isSymbolicLink(),
    });
  }
  return results;
}

export async function readDirectory(path: string, recursive = false): Promise<AuditedFile[]> {
  const files = await promises.readdir(path);

  if (!recursive) {
    return auditFiles(files);
  }

  const results: AuditedFile[] = [];
  for (const file of files) {
    const filePath = resolve(path, file);
    if (await isDirectory(filePath)) {
      results.push(...(await readDirectory(filePath, recursive)));
    } else {
      results.push(...(await auditFiles([filePath])));
    }
  }

  return results;
}
