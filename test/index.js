'use strict';

const bundler = require('./../lib/bundler-node.js');
const rollup = require('rollup')

describe('html-splitter test suite', () => {
  it('test defaults', done => {
    rollup.rollup({
      entry: 'test/templates/index.html',
      external: 'bower_components/backed/backed.html,test',
      plugins: [
        bundler()
      ]
    }).then(function(bundle) {
      bundle.write({
        format: 'iife',
        moduleName: 'test',
        dest: '.tmp/index.html'
      }).then(result => { done(); })
      .catch((err) => { console.error(err); })
    }).catch((err) => { console.error(err); })
  });

  it('builds element', done => {
    rollup.rollup({
      entry: 'test/templates/imported-app.html',
      external: 'bower_components/backed/backed.html,test',
      plugins: [
        bundler()
      ]
    }).then(function(bundle) {
      bundle.write({
        format: 'iife',
        moduleName: 'test',
        dest: '.tmp/imported-app.html'
      })
      .then(result => { done(); })
      .catch(err => { console.error(err); })
    }).catch(err => { console.error(err); })
  });
});
