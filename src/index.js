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
    return bundlePath(path, 'bundled');
  }

  const unBundledPath = path => {
    return bundlePath(path, 'unbundled');
  }

	const transformIndex = (source, href, css, js) => {
		if (css) source = source.replace(/\n(.*)<link rel="stylesheet" href="(.*)">/g, '');
		source = source.replace(/\n(.*)<link rel="import" href="(.*)">/g, '');
		if (js) source = source.replace(/\n(.*)<script src="(.*)"><\/script>/g, '');

		return source
	}

  // merge include, exclude
  const filter = createFilter(include, exclude);

  let bundled;
  let unbundled;
  let entry;
  let written = false;
  let writ = 0
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
      // options.dest = options.dest.replace('.html', '.js');
      if (!written) {
				let href = unBundledPath(join(dirname(options.dest), output.bundle.bundleHref));
	      let _dest = options.dest;
        written = true;
	        if (unbundled) {
						options.bundle.write({dest: href.replace('.html', '.js'), format: options.format, moduleName: options.moduleName});
	        // options.bundle.write(options);
	          bundler.write(unBundledPath(_dest), output.bundle.index);
	          bundler.write(href, output.bundle.app);
	          bundler.write(href.replace('.html', '.css'), output.bundle.css);
	        }
					if (bundled) {
		       return options.bundle.write({dest: options.dest, format: options.format, moduleName: options.moduleName}).then(() => {
             return new Promise((resolve, reject) => {
               return readFile(options.dest, 'utf-8', (error, contents) => {
                 if (error) reject(error);
                 output.bundled = bundler.bundle({index: output.bundle.index, app: output.bundle.app, css: output.bundle.css, js: contents});
                 transformIndex(output.bundled, href, Boolean(output.bundle.css), Boolean(output.bundle.js));
                 bundler.write(bundledPath(_dest).replace('.js', '.html'), output.bundled).then(() => {
                   resolve();
                 });
               });
             });
            });
	        }
      }
    }
  }
}
