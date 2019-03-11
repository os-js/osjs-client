import Websocket from '../src/websocket.js';

const createSocket = (options = {}) => new Websocket('Test', 'ws://null', options);

it('Should open connection', () => {
  const ws = createSocket();
  const onopen = jest.fn(() => {});
  ws.on('open', onopen);
  ws.open();
  setTimeout(() => expect(onopen).toBeCalled(), 10);
});

it('Should send message', () => {
  const ws = createSocket();
  ws.send({foo: 'bar'});
});

it('Should close', () => {
  const ws = createSocket();
  const onclose = jest.fn(() => {});
  ws.on('close', onclose);
  ws.close();
  expect(onclose).toBeCalled();
});
