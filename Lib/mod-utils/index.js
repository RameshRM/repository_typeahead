'use strict';

const Debug = require('debug')('typeahead');

module.exports.tryJsonStringify = function tryJsonStringify(input) {
  try {
    return JSON.stringify(input);
  } catch (e) {
    Debug('Unable to get Json.stringify', input);
    return '';
  }
};
