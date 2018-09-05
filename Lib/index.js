'use strict';

const Async = require('async');
const Repos = require('./Repos');
const Trie = require('./Trie');

module.exports.ViewHelper = require('./view-helper');
module.exports.Repos = Repos;

module.exports.build = function build(options, callback) {

  Async.waterfall([
    Repos.all({
      pages: 1
    }).bind(this, options || {}),
    function(repos, next) {
      return Async.parallel({
        save_repos: Repos.save.bind(this, repos),
        trie: Trie.buildDataSet.bind(this, repos),
      }, next);
    }
  ], callback);

};
