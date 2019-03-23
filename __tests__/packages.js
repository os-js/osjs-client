import {createInstance} from 'osjs';
import {EventEmitter} from '@osjs/event-emitter';
import Packages from '../src/packages.js';

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
  type: 'theme',
}, {
  name: 'Package4',
  type: 'application',
  singleton: true
}, {
  name: 'PackageMissingRuntime',
  type: 'application',
}, {
  name: 'GroupTestPackage',
  groups: ['testing']
}, {
  name: 'BlacklistTestPackage'
}];

const packageMatch = [
  {name: 'ValidApplication', type: 'application'},
  ...packageList
    .filter(pkg => pkg.name.indexOf('Test') === -1)
    .map(pkg => Object.assign({type: 'application'}, pkg))
];

describe('Packages', () =>  {
  let core;
  let packages;

  beforeAll(() => createInstance().then(c => {
    core = c;
    core.user.blacklist = ['BlacklistTestPackage'];
  }));

  afterAll(() => {
    packages.destroy();
    core.destroy();
  });

  test('#constructor', () => {
    packages = new Packages(core);
  });

  test('#init', () => {
    return expect(packages.init())
      .resolves
      .toBe(true);
  });

  test('#addPackages', () => {
    return expect(packages.addPackages(packageList))
      .toMatchObject(packageMatch);
  });

  test('#getPackages', () => {
    return expect(packages.getPackages())
      .toMatchObject(packageMatch);
  });

  test('#getPackages - filered', () => {
    return expect(packages.getPackages(metadata => metadata.name.match(/^Package/)))
      .toMatchObject(packageMatch.slice(1));
  });

  test('#getCompatiblePackages', () => {
    expect(packages.getCompatiblePackages('image/png').length)
      .toBe(1);

    expect(packages.getCompatiblePackages('application/octet-stream').length)
      .toBe(1);

    expect(packages.getCompatiblePackages('video/mpeg').length)
      .toBe(2);
  });

  test('#register - failure', () => {
    expect(() => packages.register('Invalid', () => {}))
      .toThrow(Error);
  });

  test('#register - register once ', () => {
    expect(() => packages.register('Package1', () => {
      throw new Error('Simulate failure');
    }))
      .not
      .toThrow(Error);

    expect(() => packages.register('Package1', () => {}))
      .not
      .toThrow(Error);

    expect(packages.packages.length).toBe(1);
  });

  test('#launch - fail on invalid package', () => {
    return expect(() => packages.launch('Fooz'))
      .toThrow(Error);
  });

  test('#launch - fail on runtime missing', () => {
    return expect(packages.launch('PackageMissingRuntime'))
      .rejects
      .toThrow(Error);
  });

  test('#launch - application', () => {
    const cb = jest.fn((() => core.make('osjs/application')));
    packages.register('Package2', cb);

    return packages.launch('Package2')
      .then(() => {
        expect(cb).toBeCalled();
      });
  });

  test('#launch', () => {
    packages.register('Package3', () => {});

    return packages.launch('Package3')
      .then(({metadata}) => {
        expect(metadata.name).toBe('Package3');
      });
  });

  test('#launch - singleton', () => {
    packages.register('Package4', (() => core.make('osjs/application', {
      metadata: {
        name: 'Package4'
      }
    })));

    return packages.launch('Package4')
      .then(app => {
        const fn = jest.fn();
        app.on('attention', fn);

        return packages.launch('Package4')
          .then(() => {
            expect(fn).toBeCalled();
          });
      });
  });

  test('#launch - singleton (delayed)', () => {
    const fn = jest.fn();
    const fakeApp = new EventEmitter();
    fakeApp.metadata = {};
    fakeApp.on('attention', fn);

    const name = 'SingletonDelayTest';
    const metadata = {
      name,
      type: 'application',
      singleton: true
    };

    const pkgs = new Packages(core);
    pkgs.addPackages([metadata]);
    pkgs.register(name, () => fakeApp);
    pkgs.running = [name];

    setTimeout(() => {
      core.emit(`osjs/application:${name}:launched`, fakeApp);
    }, 25);

    return pkgs.launch(name)
      .then(() => {
        expect(fn).toBeCalled();
      });
  });
});
