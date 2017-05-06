'use strict';
import { readFile, writeFile, mkdir } from 'fs';
import splitter from 'backed-splitter';
import _bundle from 'backed-bundler';
import { dirname } from 'path';

let virtualSet = {}

const promiseWrite = (dest, content) => {
}

const write = (dest = null, contents = null) => {
  return new Promise((resolve, reject) => {
    writeFile(dest, contents, error => {
      if (error)
        if (error.code === 'ENOENT')
        mkdir(dirname(dest), error => {
          if (error) reject(error);
          else return promiseWrite(dest, contents);
        });
        else reject(error);
      resolve();
    });
  });
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

/**
 * Bundle html
 */
const bundle = ({index = null, app = null, js = null, css = null}) => {
  const bun = _bundle({entry: index, html: app, js: js, css: css})
  return `<!DOCTYPE html>
  <html>
    ${bun}
</html>`;
}

export default {
  bundle: bundle,
  split: split,
  write: write
}
