'use strict';

const SuperAgent = require('superagent');
const GIT_REPOS_API = process.env.GIT_REPOS_API;
const Debug = require('debug')('typeahead');
const Util = require('util');
const Path = require('path');
const FS = require('fs');
const Qs = require('qs');

const DATASET_PATH = process.env.DATASET_PATH || process.cwd();

const Repos_Cache = {};
/**
all - Retrieves all the Public Git Repositories using GitHub API and returns the Response Body.
**/
module.exports.all = function(maxPages) {
  return function(options, callback) {
    return makeRequest(maxPages.pages)({
      query: options.query || {},
      pageCount: 1
    }, callback);

  };
};

/**
save - Stores the Repositories in file "repos.json" in FilePath: process.cwd()+'/dataset/'
**/
module.exports.save = function save(repos, callback) {
  FS.writeFile(Path.join(DATASET_PATH, 'repos.json'), tryJsonStringify(repos), callback);
};

/**
findByName - Find Repository By Name
Finds the Repository Details by FullName & Caches the Information
**/
module.exports.findByName = function findByName(options, callback) {
  if (!options || !options.name) {
    return callback();
  }

  if (Repos_Cache[options.name]) {
    return callback(undefined, getFromCache(options.name));
  }

  return SuperAgent.get(Util.format('%s/%s', process.env.GET_REPO_API, options.name), function(err, response) {
    Debug('Get Repo', err ? err.message : response && response.statusCode);
    if (response && response.statusCode === 200) {
      addToCache(options.name, response.body);
    }

    return callback(err, response && response.body);
  });
};

module.exports.contributors = function contributors(options,callback){
  if (!options || !options.name) {
    return callback();
  }

  if (Repos_Cache[options.name]) {
    return callback(undefined, getFromCache(options.name));
  }

  return SuperAgent.get(Util.format('%s/%s', process.env.GET_REPO_API, options.name), function(err, response) {
    Debug('Get Repo', err ? err.message : response && response.statusCode);
    if (response && response.statusCode === 200) {
      addToCache(options.name, response.body);
    }

    return callback(err, response && response.body);
  });
};

function tryJsonStringify(input) {
  try {
    return JSON.stringify(input);
  } catch (e) {
    Debug('Unable to get Json.stringify', input);
    return '';
  }
}

function getFromCache(key) {
  Debug('Get Repo Returned from Cache', key);
  return Repos_Cache[key];
}

function addToCache(key, body) {
  Repos_Cache[key] = body;
}

function makeRequest(maxPages) {
  return function(options, callback) {
    let repos_url = Util.format('%s?%s', GIT_REPOS_API, options && options.query ? Qs.stringify(options.query) : '1=2');

    return SuperAgent.get(repos_url).end(function(err, response) {

      Debug('Git Repos', err ? err.message : response && response.statusCode);

      if (err || response && response.statusCode !== 200) {
        return callback(undefined, tryGetLocalRepos());
      }

      let args = Object.assign({}, options);
      if (!args.returnResult) {
        args.returnResult = (response && response.body);
      } else {
        args.returnResult = options.returnResult.concat(response && response.body);
      }


      if (response.statusCode === 200 && Array.isArray(response.body) && response.headers.link && options.pageCount <= maxPages) {

        args.query.since = response.body.length > 0 && response.body[response.body.length - 1].id;
        return makeRequest(maxPages)({
          query: args.query,
          pageCount: args.pageCount + 1,
          max: args.max,
          returnResult: args.returnResult
        }, callback);
      } else {
        return callback(err, args.returnResult);
      }
    });
  };
}

function tryGetLocalRepos() {
  try {
    return require(Path.join(DATASET_PATH, 'repos.json'));
  } catch (e) {
    Debug('Local Repos not found', e);
  }
}
