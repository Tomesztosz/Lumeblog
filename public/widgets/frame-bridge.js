/* Shared by the journal and its own models. No cross-origin message channel. */
(function () {
  'use strict';
  var origin = window.location.origin;
  var maxHeight = 6000;

  function dataObject(data) {
    return data !== null && typeof data === 'object' && !Array.isArray(data);
  }

  function localModel(frame) {
    try {
      var url = new URL(frame.getAttribute('src'), window.location.href);
      return url.origin === origin && /^\/widgets\/[a-z0-9-]+\.html$/.test(url.pathname);
    } catch (_) { return false; }
  }

  function bindParent(isDark) {
    function tell(frame) {
      if (localModel(frame) && frame.contentWindow) {
        frame.contentWindow.postMessage({ type: 'lume:lights', dark: isDark() }, origin);
      }
    }
    function broadcast() { document.querySelectorAll('iframe').forEach(tell); }
    window.addEventListener('message', function (event) {
      if (event.origin !== origin || !dataObject(event.data)) return;
      var frame = Array.from(document.querySelectorAll('iframe')).find(function (candidate) {
        return candidate.contentWindow === event.source && localModel(candidate);
      });
      if (!frame) return;
      if (event.data.type === 'lume:ready') tell(frame);
      if (event.data.type === 'lume:height') {
        var height = event.data.height;
        if (typeof height === 'number' && Number.isFinite(height) && height > 0 && height <= maxHeight) {
          frame.style.height = Math.ceil(height) + 'px';
        }
      }
    });
    return { broadcast: broadcast };
  }

  function bindChild(setDark, padding, embeddedClass) {
    if (window.parent === window) return;
    if (embeddedClass) document.body.classList.add('embedded');
    window.addEventListener('message', function (event) {
      if (event.origin !== origin || event.source !== window.parent || !dataObject(event.data)) return;
      if (event.data.type === 'lume:lights' && typeof event.data.dark === 'boolean') setDark(event.data.dark);
    });
    var card = document.querySelector('.card');
    var previous = 0;
    function report() {
      if (!card) return;
      var height = Math.ceil(card.getBoundingClientRect().height) + padding;
      if (Number.isFinite(height) && height > 0 && height <= maxHeight && height !== previous) {
        previous = height;
        window.parent.postMessage({ type: 'lume:height', height: height }, origin);
      }
    }
    if (card) new ResizeObserver(report).observe(card);
    window.addEventListener('load', report);
    report();
    window.parent.postMessage({ type: 'lume:ready' }, origin);
  }
  window.LumeFrames = Object.freeze({ bindParent: bindParent, bindChild: bindChild });
})();
