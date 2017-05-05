'use strict';
import { createFilter } from 'rollup-pluginutils';
import bundler from './bundler';
import { readFile } from 'fs';
import { join, dirname, basename } from 'path';

export default ({bundleHtml = true, include = null, exclude = ['node_modules']}) => {

  const output = {
    bundle: {},
    bundled: ''
  };

  const bundlePath = (path, dest) => {
    return join(dirname(path), dest, basename(path));
  }

  const bundledPath = path => {
    console.log(bundlePath(path, 'bundled'));
    return bundlePath(path, 'bundled');
  }

  const unBundledPath = path => {
    console.log(bundlePath(path, 'unbundled'));
    return bundlePath(path, 'unbundled');
  }

  // merge include, exclude
  const filter = createFilter(include, exclude);

  let bundled;
  let unbundled;
  let entry;
  let written = false;

  return {

    name: 'htmlBundler',

    options(options) {
      entry = options.entry.replace('.html', '.js');
      options.entry = entry;
      bundled = options.bundled || true;
      unbundled = options.unbundled || true;

      // return options;
    },

    resolveId(id) {
      return id
    },

    load(id) {
      // chck if id matches entry
      if (id === entry) {
        return new Promise((resolve, reject) => {
          bundler.split(entry.replace('.js', '.html')).then(bundle => {
            output.bundle = bundle;
            resolve(bundle.js)
          });
        });
      }
      // checks bundle.scripts for id & return its content
      return new Promise((resolve, reject) => {
        if (output.bundle)
          if (output.bundle.scripts && output.bundle.scripts[id])
            resolve(output.bundle.scripts[id]);
          else if (output.bundle.imports && output.bundle.imports[id])
            resolve(output.bundle.imports[id]);
      });
    },

    onwrite(options) {
      const _dest = options.dest;
      const href = unBundledPath(join(dirname(options.dest), output.bundle.bundleHref));
      options.dest = href.replace('.html', '.js');
      if (!written) {
				written = true;

        options.bundle.write(options);
        output.bundled = bundler.bundle({index: output.bundle.index, app: output.bundle.app, css: output.bundle.css, js: output.bundle.js});

        if (bundled) {
          bundler.write(bundledPath(_dest), output.bundled);
        }

        if (unbundled) {
          bundler.write(unBundledPath(_dest), output.bundle.index);
          bundler.write(href, output.bundle.app);
          bundler.write(href.replace('.html', '.css'), output.bundle.css);
        }
      }
    }
  }
}
