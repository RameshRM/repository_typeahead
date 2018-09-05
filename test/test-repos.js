'use strict';

const Assert = require('assert');
const Path = require('path');
const FS = require('fs');

describe('Should download and persist repos', function() {
  let server = require('express')();
  let listener;
  let repos_fixtures = require('./.dataset/repos_fixtures');
  let Repos;

  before(function(done) {

    process.env.DATASET_PATH = Path.join(__dirname, '.dataset');
    process.env.GIT_REPOS_API = 'http://127.0.0.1:3333/repositories';

    Repos = require('../Lib/Repos');

    listener = server.listen(3333, function(err) {
      done();
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
    Repos.all({
      pages: 1
    })({}, function(err, result) {
      Assert.ok(!err);
      Assert.ok(result);

      Repos.save(result, function(err, saveResult) {
        Assert.ok(!err);
        Assert.ok(FS.existsSync(Path.join(process.env.DATASET_PATH, 'repos.json')));
        done();
      });

    });
  });

});
