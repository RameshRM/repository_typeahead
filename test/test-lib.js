'use strict';

const Assert = require('assert');
const Path = require('path');
const FS = require('fs');

describe('Should download and persist repos', function() {
  let server = require('express')();
  let listener;
  let repos_fixtures = require('./.dataset/repos_fixtures');
  let Lib;
  let TrieEntity;
  before(function(done) {

    process.env.DATASET_PATH = Path.join(__dirname, '.dataset');
    process.env.GIT_REPOS_API = 'http://127.0.0.1:3333/repositories';

    Lib = require('../Lib/');

    listener = server.listen(3333, function(err) {
      Lib.build({}, function(err, result) {
        Assert.ok(!err);
        Assert.ok(result);
        Assert.ok(result && result.trie.TrieEntity.search("gr"));

        Assert.ok(FS.existsSync(Path.join(process.env.DATASET_PATH, 'repos.json')));
        Assert.ok(FS.existsSync(Path.join(process.env.DATASET_PATH, 'trie.json')));
        TrieEntity = result.trie.TrieEntity;
        done();
      });
    });

    server.get('/repositories', function(req, res) {
      res.send(repos_fixtures);
    });

  });

  after(function(done) {

    delete process.env.DATASET_PATH;
    delete process.env.GIT_REPOS_API;

    listener.close();
    done();

  });

  it('Should find all Repositories', function(done) {
    Assert.ok(TrieEntity)
    Assert.ok(TrieEntity.search("gr").length === 2);
    Assert.ok(TrieEntity.search("gr")[0].name === 'grit');
    done();
  });

});
