'use strict';

const Lib = require('./Lib');
const express = require('express');
const server = Lib.ViewHelper(express());

const Debug = require('debug')('typeahead');
const HTTP_PORT = process.env.HTTP_PORT || 0;
const dateFormat = require('dateformat');
const Async = require('async');
const Util = require('util');

server.use('/static', express.static(__dirname));

Lib.build({}, function(err, result) {

  server.use(function(req, res, next) {
    req._trie = {
      search: function(keywords) {
        if (result && result.trie && result.trie.TrieEntity) {
          return result.trie.TrieEntity.search(keywords);
        }
      }
    };
    req._trie = result && result.trie && result.trie.TrieEntity;
    next();
  });

  server.get('/search/', function(req, res) {
    return res.send(req._trie.search(req.query.keywords));
  });

  server.get('/', function(req, res) {
    return res.render('index', {});
  });

  server.get('/:name', function(req, res) {

    Async.parallel({
      repos: Lib.Repos.findByName.bind(this, {
        name: req.query.full_name
      }),
      contributors: Lib.Repos.contributors.bind(this, {
        name: Util.format('%s/contributors', req.query.full_name)
      }),
    }, function(err, result) {
      result.repos.created_at = getDtFormatted(result.repos && result.repos.created_at);
      return res.render('detail', result);
    });

  });


  server.listen(HTTP_PORT, function(err) {
    Debug('Server Running on Port ', HTTP_PORT, err ? err.message : true);
  });

});

function getDtFormatted(input) {
  return input && dateFormat(input, "mm-dd-yyyy");
}
