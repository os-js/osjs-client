class MockWebSocket {
  constructor(uri) {
    this.onmessage = () => {};
    this.onopen = () => {};
    this.onerror = () => {};

    this.onopen();
    setTimeout(() => this.onopen(), 1);
  }

  close() {
    this.onclose();
  }

  send(...args) {}
}


const noop = () => {};

const fetchMocks = {
  text: {

  },
  json: {
    '/metadata.json': [{
      name: 'ValidApplication',
      mimes: ['valid/bazz'],
      files: []
    }]
  }
};

global.fetch = (url) => {
  return Promise.resolve({
    ok: true,
    headers: {
      get: () => ''
    },
    text: () => Promise.resolve(fetchMocks.text[url] || ''),
    json: () => Promise.resolve(fetchMocks.json[url] || {})
  });
};

console.debug = noop;
console.group = noop;
console.groupEnd = noop;

window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.matchMedia = () => false;
window.WebSocket = MockWebSocket;
