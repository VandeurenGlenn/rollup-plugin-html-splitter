'use strict';
import { createFilter } from 'rollup-pluginutils';
import bundler from './bundler';
import { readFile } from 'fs';
import path from 'path';

export default ({bundleHtml = true, include = null, exclude = ['node_modules']}) => {

  const output = {
    bundle: {}
  };

  // merge include, exclude
  const filter = createFilter(include, exclude)
  let entry;

  return {

    name: 'htmlBundler',

    options(options) {
      entry = options.entry.replace('.html', '.js');
      options.entry = entry;

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
      const href = path.join(path.dirname(options.dest), output.bundle.bundleHref)
      options.dest = href.replace('.html', '.js');
      options.bundle.write(options);
      bundler.write(options.dest.replace('.js', '.html'), output.bundle.index);
      bundler.write(href, output.bundle.app);
      bundler.write(href.replace('.html', '.css'), output.bundle.css);
    }
  }
}
