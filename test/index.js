'use strict';

const bundler = require('./../lib/bundler-node.js');
const rollup = require('rollup')

describe('html-splitter test suite', () => {
  it('test defaults', done => {
    rollup.rollup({
      entry: 'test/templates/index.html',
      plugins: [
        bundler({})
      ]
    }).then(function(bundle) {
      bundle.write({
        format: 'iife',
        moduleName: 'test',
        dest: '.tmp/index.html'
      }).then(function(result) {
        done();
      }).catch((err) => {
        console.error(err);
      })
    }).catch((err) => {
      console.error(err);
    })
  });
});
