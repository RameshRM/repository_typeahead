'use strict';

const Assert = require('assert');

describe('Shoud Test Mod Utils', function() {
  const ModUtils = require('../Lib/mod-utils');

  it('Should return undefined on empty json ', function(done) {
    Assert.ok(ModUtils.tryJsonStringify() === undefined);
    done();
  });
  
  it('Should return empty string on invalid json stringify', function(done) {
    Assert.ok(ModUtils.tryJsonStringify({
      foo: 1
    }) === '{"foo":1}');
    done();
  });

});
