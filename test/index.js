var URLSearchParams = require('../cjs');
var USP = global.URLSearchParams || URLSearchParams;
var wru = {
  assert: function (why, what) {
    console.assert(what, why);
  }
};
test();

// for code coverage sake
delete require.cache[require.resolve('../cjs')];
if (global.URLSearchParams)
  delete global.URLSearchParams.prototype.forEach;
global.URLSearchParams = function () { throw {}; };
URLSearchParams = require('../cjs');
test();

delete require.cache[require.resolve('../cjs')];
global.URLSearchParams = function (query) {
  if (typeof query === 'object')
    throw {};
  return {get: function () { return '+'; }};
};
URLSearchParams = require('../cjs');
test();

delete require.cache[require.resolve('../cjs')];
global.URLSearchParams = function (query) {
  if (Array.isArray(query))
    throw {};
  return {get: function () { return '+'; }};
};
URLSearchParams = require('../cjs');
test();

delete require.cache[require.resolve('../cjs')];
global.URLSearchParams = function (query) {
  if (Array.isArray(query))
    throw {};
  return {get: function () { return '-'; }};
};
URLSearchParams = require('../cjs');
test();

delete require.cache[require.resolve('../cjs')];
global.URLSearchParams = USP;
URLSearchParams = require('../cjs');
testExtras();

if (typeof process === 'object') {
  delete require.cache[require.resolve('../cjs')];
  delete global.URLSearchParams.prototype.forEach;
  delete global.URLSearchParams.prototype.keys;
  delete global.URLSearchParams.prototype.values;
  delete global.URLSearchParams.prototype.entries;
  delete global.URLSearchParams.prototype.sort;
  delete USP.prototype.forEach;
  delete USP.prototype.keys;
  delete USP.prototype.values;
  delete USP.prototype.entries;
  delete USP.prototype.sort;
  global.Symbol = {};
  URLSearchParams = require('../cjs');
  testExtras();
}

function test() {
  var usp = new URLSearchParams('a=1&b=2&c');
  wru.assert('has keys', usp.has('a') && usp.has('b') && usp.has('c'));
  wru.assert('a returns right value', usp.get('a') === '1');
  wru.assert('b returns right value', usp.get('b') === '2');
  wru.assert('c returns right value', usp.get('c') === '');
  wru.assert('a getAll returns right value', usp.getAll('a').join(',') === '1');
  wru.assert('b getAll returns right value', usp.getAll('b').join(',') === '2');
  wru.assert('c getAll returns right value', usp.getAll('c').join(',') === '');
  usp.append('a', '3');
  wru.assert('append adds values', usp.getAll('a').join(',') === '1,3');
  wru.assert('append preserves get', usp.get('a') === '1');
  wru.assert('append does not affect others', usp.getAll('b').join(',') === '2' && usp.getAll('c').join(',') === '');
  usp.set('a', '4');
  wru.assert('set overwrites known values', usp.getAll('a').join(',') === '4');
  usp['delete']('a');
  wru.assert('usp can delete', usp.has('a') === false);
  wru.assert('usp can return null', usp.get('a') === null);
  wru.assert('usp to string works as expected', usp.toString() === 'b=2&c=');
  usp = new URLSearchParams('?a=1&b=2');
  wru.assert('has keys', usp.has('a') && usp.has('b'));
  wru.assert('a returns right value', usp.get('a') === '1');
  wru.assert('b returns right value', usp.get('b') === '2');
  wru.assert('a getAll returns right value', usp.getAll('a').join(',') === '1');
  wru.assert('b getAll returns right value', usp.getAll('b').join(',') === '2');
  usp.append('a', '3');
  wru.assert('append adds values', usp.getAll('a').join(',') === '1,3');
  wru.assert('append preserves get', usp.get('a') === '1');
  wru.assert('append does not affect others', usp.getAll('b').join(',') === '2');
  usp.set('a', '4');
  wru.assert('set overwrites known values', usp.getAll('a').join(',') === '4');
  usp['delete']('a');
  wru.assert('usp can delete', usp.has('a') === false);
  wru.assert('usp can return null', usp.get('a') === null);
  wru.assert('usp to string works as expected', usp.toString() === 'b=2');
  usp = new URLSearchParams();
  var badString = '\x20\x21\x27\x28\x29\x7E';
  usp.append('a', badString);
  wru.assert('correct a value', usp.get('a') === badString);
  wru.assert('correct a escaping', usp.toString() === 'a=+%21%27%28%29%7E');
  usp.append(badString, badString);
  wru.assert('correct badString value', usp.get(badString) === badString);
  usp['delete']('a');
  wru.assert('usp can delete', usp.has('a') === false);
  wru.assert('usp can return null', usp.get('a') === null);
  wru.assert('correct badString escaping', usp.toString() === '+%21%27%28%29%7E=+%21%27%28%29%7E');
  var unescaped = '!';
  var escaped = encodeURIComponent(unescaped);
  usp = new URLSearchParams(escaped + '=' + unescaped);
  wru.assert('correct ! escaping', usp.toString() === '%21=%21');
  wru.assert('correct ! key', usp.has('!'));
  wru.assert('correct ! value', usp.get('!') === '!');
  unescaped = '&';
  escaped = encodeURIComponent(unescaped);
  usp = new URLSearchParams(escaped + '=' + unescaped);
  wru.assert('correct & escaping', usp.toString() === '%26=');
  wru.assert('correct & key', usp.has('&'));
  wru.assert('correct & value', usp.get('&') === '');
  usp = new URLSearchParams('a=12=3');
  wru.assert('correct escaping', usp.toString() === 'a=12%3D3');
  wru.assert('correct value', usp.get('a') === '12=3');
  usp = new URLSearchParams('a=%zx');
  wru.assert('correct & value', usp.get('a') === '%zx');
  usp = new URLSearchParams([['a', 'b']]);
  console.assert(usp.get('a') === 'b', 'constructing via Array');
  usp = new URLSearchParams({'a': 'b'});
  console.assert(usp.get('a') === 'b', 'constructing via Object');
  var fake = {
    forEach: function (callback, context) {
      callback.call(context, 'b', 'a');
    }
  };
  try {
    fake[Symbol.iterator] = function () {
      return [['a', 'b']][Symbol.iterator]();
    };
  } catch (meh) {}
  usp = new URLSearchParams(fake);
  console.assert(JSON.stringify(usp).length, 'JSON does not throw');
  console.assert(usp.getAll('b').length === 0, 'unknown keys return empty array');
  var tmp = {};
  usp.forEach(function (value, key, self) {
    console.assert(this === tmp);
    console.assert(value === 'b');
    console.assert(key === 'a');
    console.assert(self === usp);
  }, tmp);
  usp.append('c', [1, 2]);
}

function testExtras() {
  var usp = new URLSearchParams('a=1&a=2&b=3');
  var iterator = usp.keys()

  var next = iterator.next();
  wru.assert('correct iterator value', !next.done);
  wru.assert('correct iterator value', next.value === 'a');

  next = iterator.next();
  wru.assert('correct iterator value', !next.done);
  wru.assert('correct iterator value', next.value === 'a');

  next = iterator.next();
  wru.assert('correct iterator value', !next.done);
  wru.assert('correct iterator value', next.value === 'b');

  next = iterator.next();
  wru.assert('correct iterator value', next.done);
  wru.assert('correct iterator value', next.value === undefined);
  usp = new URLSearchParams('a=1&a=2&b=3');
  iterator = usp.values()

  next = iterator.next();
  wru.assert('correct iterator value', !next.done);
  wru.assert('correct iterator value', next.value === '1');

  next = iterator.next();
  wru.assert('correct iterator value', !next.done);
  wru.assert('correct iterator value', next.value === '2');

  next = iterator.next();
  wru.assert('correct iterator value', !next.done);
  wru.assert('correct iterator value', next.value === '3');

  next = iterator.next();
  wru.assert('correct iterator value', next.done);
  wru.assert('correct iterator value', next.value === undefined);
  usp = new URLSearchParams('a=1&a=2&b=3');
  iterator = usp.entries()

  next = iterator.next();
  wru.assert('correct iterator value', !next.done);
  wru.assert('correct iterator value', next.value[0] === 'a' && next.value[1] === '1');

  next = iterator.next();
  wru.assert('correct iterator value', !next.done);
  wru.assert('correct iterator value', next.value[0] === 'a' && next.value[1] === '2');

  next = iterator.next();
  wru.assert('correct iterator value', !next.done);
  wru.assert('correct iterator value', next.value[0] === 'b' && next.value[1] === '3');

  next = iterator.next();
  wru.assert('correct iterator value', next.done);
  wru.assert('correct iterator value', next.value === undefined);
  usp = new URLSearchParams('a=1&a=2&b=3');

  results = [];
  usp.forEach(function(value, key, object) {
    results.push({value: value, key: key, object: object});
  });

  wru.assert('correct loop count', results.length === 3);

  wru.assert('correct loop key', results[0].key === 'a');
  wru.assert('correct loop value', results[0].value === '1');
  wru.assert('correct loop object', results[0].object === usp);

  wru.assert('correct loop key', results[1].key === 'a');
  wru.assert('correct loop value', results[1].value === '2');
  wru.assert('correct loop object', results[1].object === usp);

  wru.assert('correct loop key', results[2].key === 'b');
  wru.assert('correct loop value', results[2].value === '3');
  wru.assert('correct loop object', results[2].object === usp);

  usp = new URLSearchParams();
  usp.append('a', 3);
  usp.append('b', 2);
  usp.append('a', 1);
  usp.sort();
  wru.assert('preserved order', usp.toString() === 'a=3&a=1&b=2');

  // https://url.spec.whatwg.org/#example-searchparams-sort
  usp = new URLSearchParams();
  usp.append('q', '🏳️‍🌈');
  usp.append('key', 'e1f7bc78');
  usp.sort();
  wru.assert('correct sort', usp.toString() === 'key=e1f7bc78&q=%F0%9F%8F%B3%EF%B8%8F%E2%80%8D%F0%9F%8C%88');

  usp = new URLSearchParams([['a', '1'], ['b', '3'], ['a', '2']]);

  var results = [];
  usp.forEach(function(value, key, object) {
    results.push({value: value, key: key, object: object});
  });

  wru.assert('correct loop count', results.length === 3);

  results.sort(function (a, b) {
    return a.key < b.key ? -1 : (a.key === b.key ? 0 : 1);
  });

  wru.assert('correct loop key', results[0].key === 'a');
  wru.assert('correct loop value', results[0].value === '1');
  wru.assert('correct loop object', results[0].object === usp);

  wru.assert('correct loop key', results[1].key === 'a');
  wru.assert('correct loop value', results[1].value === '2');
  wru.assert('correct loop object', results[1].object === usp);

  wru.assert('correct loop key', results[2].key === 'b');
  wru.assert('correct loop value', results[2].value === '3');
  wru.assert('correct loop object', results[2].object === usp);

  usp = new URLSearchParams({a: ['1', '2'], b: '3'});

  results = [];
  usp.forEach(function(value, key, object) {
    results.push({value: value, key: key, object: object});
  });

  wru.assert('correct loop count', results.length === 2);

  wru.assert('correct loop key', results[0].key === 'a');
  wru.assert('correct loop value', results[0].value === '1,2');
  wru.assert('correct loop object', results[0].object === usp);

  wru.assert('correct loop key', results[1].key === 'b');
  wru.assert('correct loop value', results[1].value === '3');
  wru.assert('correct loop object', results[1].object === usp);
}
