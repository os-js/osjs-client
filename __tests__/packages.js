import {createInstance} from 'osjs';
import Packages from '../src/packages.js';

// TODO: Blacklisted packges
// TODO: Group packages

let core;
let packages;

const packageList = [{
  name: 'Package1',
  mimes: [
    '^video'
  ]
}, {
  name: 'Package2',
  mimes: [
    'image/png',
    'video/mpeg',
    '^application'
  ]
}, {
  name: 'Package3',
  type: 'theme'
}];

const packageMatch = [
  {name: 'ValidApplication', type: 'application'},
  ...packageList.map(pkg => Object.assign({type: 'application'}, pkg))
];

beforeAll(() => createInstance().then(c => core = c));

afterAll(() => {
  packages.destroy();
  core.destroy();
});

it('Should create a new instance', () => {
  packages = new Packages(core);
});

it('Should initialize', () => {
  return expect(packages.init())
    .resolves
    .toBe(true);
});

it('Should add packages', () => {
  return expect(packages.addPackages(packageList))
    .toMatchObject(packageMatch);
});

it('Should get a list of all packages', () => {
  return expect(packages.getPackages())
    .toMatchObject(packageMatch);
});

it('Should get a list of filtered packages', () => {
  return expect(packages.getPackages(metadata => metadata.name.match(/^Package/)))
    .toMatchObject(packageMatch.slice(1));
});

it('Should get a list of packages based on mime', () => {
  expect(packages.getCompatiblePackages('image/png').length)
    .toBe(1);

  expect(packages.getCompatiblePackages('application/octet-stream').length)
    .toBe(1);

  expect(packages.getCompatiblePackages('video/mpeg').length)
    .toBe(2);
});

it('Should fail to register package', () => {
  expect(() => packages.register('Invalid', () => {}))
    .toThrow(Error);
});

it('Should register package', () => {
  expect(() => packages.register('Package1', () => {}))
    .not
    .toThrow(Error);
});

it('Should launch application package', () => {
  const cb = jest.fn((() => core.make('osjs/application')));
  packages.register('Package2', cb);

  return packages.launch('Package2')
    .then(() => {
      expect(cb).toBeCalled();
    });
});

it('Should launch launch package', () => {
  packages.register('Package3', () => {});

  return packages.launch('Package3')
    .then(({metadata}) => {
      expect(metadata.name).toBe('Package3');
    });
});
