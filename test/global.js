function loadScript(src, then) {
  var s = document.createElement('script');
  var after = true;
  s.type = 'text/javascript';
  s.onload = onload;
  s.onreadystatechange = function () {
    if (/loaded|complete/.test(s.readyState))
      setTimeout(onload);
  };
  s.src = src;
  document.documentElement.appendChild(s);
  function onload() {
    if (after) {
      after = false;
      then();
    }
  }
}

function loadTest(what, message) {
  requiring(what);
  loadScript('./index.js?_=' + Math.random(), function () {
    alert(message || 'OK');
  });
}

function requiring(what) {
  function require() { return what; }
  require.cache = {};
  require.resolve = require;
  window.require = require;
  window.global = window;
}
