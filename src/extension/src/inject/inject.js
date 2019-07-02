
var script = document.createElement('script');
script.src = chrome.extension.getURL('/src/inject/content.js');

document.head.appendChild(script);

script.onload = function () {
  script.parentNode.removeChild(script);
};
