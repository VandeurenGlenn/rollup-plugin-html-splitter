'use strict';
import { readFile, writeFile } from 'fs';
import splitter from 'backed-splitter';

let virtualSet = {}

const promiseWrite = (dest, content) => {
  writeFile(dest, content, error => {
    if (error) throw console.error(error);
    return;
  });
}

const write = (dest = null, contents = null) => {
  async function runWrite(dest, contents) {
    await promiseWrite(dest, contents);
    return;
  }
  return runWrite(dest, contents);
}

const split = (entry = null) => {
  return new Promise((resolve, reject) => {
    splitter({entry: entry}).then(bundle => {
      try {
        for (let path of Object.keys(bundle.scripts)) {
          // write(path, bundle.scripts[path])
          virtualSet[path] = bundle.scripts[path];
          bundle.virtualSet = virtualSet;
        }
        resolve(bundle);
      } catch (error) {
        reject(error)
      }
    });
  });
}

export default {
  split: split,
  write: write
}
