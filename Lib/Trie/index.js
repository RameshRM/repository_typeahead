'use strict';

const FS = require('fs');
const Path = require('path');

const modUtils = require('../mod-utils');
const DATASET_PATH = process.env.DATASET_PATH || process.cwd();
const Debug = require('debug')('typeahead');

module.exports = Trie;

function Trie() {
  this.root = new TrieNode();
  this.dataSetFlatMap = {};

  this.buildDataSetFlatMap = function(input) {
    this.dataSetFlatMap = Array.isArray(input) && input.length > 0 && input.reduce(function reduce(acc, inputItem) {
      acc[inputItem.name.toLowerCase()] = inputItem;
      return acc;
    }, {});
  };
}

Trie.prototype.save = function save(callback) {
  let _this = this;
  FS.writeFile(Path.join(DATASET_PATH, 'trie.json'), modUtils.tryJsonStringify(this), function(err) {
    Debug('Stored Trie DataSet', Path.join(DATASET_PATH, 'trie.json'), err ? err.message : 200);
    return callback(undefined, {
      TrieEntity: _this
    });
  });

};

Trie.prototype.search = function(keywords) {

  let searchResults = [];
  let node = this.root;
  let matchIdx;
  let matchNode;

  function _buildSearchResult(node, word) {
    word += node.name;
    if (node.isWord) {
      searchResults.push(word);
    }
    let children = Object.keys(node.ref || {});
    if (Array.isArray(children) && children.length > 0) {
      for (var i = 0; i < children.length; i++) {
        node.ref[children[i]].name = children[i];
        node.name = children[i];
        _buildSearchResult(node.ref[children[i]], word);
      }
    }
    return;
  }


  for (var i = 0; i < keywords.length; i++) {
    if (node.ref[keywords[i]]) {
      matchIdx = i;
      matchNode = node.ref;
      node = node.ref[keywords[i]];
    }
  }

  if (matchNode && matchIdx > -1) {
    matchNode = matchNode[keywords[matchIdx]];

    matchNode.name = keywords.substring(0, matchIdx + 1);

    _buildSearchResult(matchNode, '');
    let dataSetMap = this.dataSetFlatMap;
    searchResults = searchResults.sort();
    let dataSetItem;
    return Array.isArray(searchResults) && searchResults.map(function map(item) {
      dataSetItem = dataSetMap[item] && dataSetMap[item.toLowerCase()].owner && dataSetMap[item];
      return {
        name: item,
        avatar_url: dataSetItem.owner.avatar_url || 'https://github.com/identicons/jasonlong.png',
        full_name: dataSetItem.full_name
      };
    });

  } else {
    return [];
  }
};

Trie.prototype.buildList = function buildList(inputList) {
  let _this = this;
  inputList.reduce(function reduce(acc, item) {
    _this.build(item);
    return acc;
  }, undefined);
};

Trie.prototype.build = function build(input) {
  let trieNode = this.root;
  for (var i = 0; i < input.length; i++) {
    if (!trieNode.ref[input[i]]) {
      trieNode.ref[input[i]] = new TrieNode();
      trieNode = trieNode.ref[input[i]];
    } else {
      trieNode = trieNode.ref[input[i]];
    }
  }
  trieNode.isWord = true;
};

Trie.buildDataSet = function(input, callback) {

  let trie = new Trie();
  if (input) {
    trie.buildDataSetFlatMap(input);
    trie.buildList(input.map(function map(item) {
      Debug('Building Trie', item.name);
      return item.name;
    }));
  }
  return trie.save(callback);
};

function TrieNode() {
  this.ref = {};
  this.isWord;
}
