import Core from '../src/core';
import CoreServiceProvider from '../src/providers/core';
import SettingsServiceProvider from '../src/providers/settings';
import * as config from '../src/config';
import merge from 'deepmerge';
import {ServiceProvider} from '@osjs/common';

class MockDesktopServiceProvider extends ServiceProvider {
  provides() {
    return ['osjs/desktop'];
  }

  init() {
    this.core.singleton('osjs/desktop', () => ({
      getRect() {
        return {
          top: 0,
          left: 0,
          width: 800,
          height: 600
        };
      }
    }));
  }
}

export const createInstance = () => {
  const core = new Core(merge(config, {
    settings: {
      lock: ['osjs/locked']
    },
    auth: {
      username: 'jest',
      password: 'jest'
    },
    ws: {
      disabled: true
    }
  }));

  core.logger = new Proxy({}, {
    get: () => () => {}
  });

  core.register(CoreServiceProvider);
  core.register(SettingsServiceProvider, {before: true});
  core.register(ServiceProvider);
  core.register(MockDesktopServiceProvider);

  return core.boot()
    .then(() => {
      core.make('osjs/packages').register('ValidApplication', (core, args, options, metadata) => {
        return core.make('osjs/application', {args, options, metadata});
      });

      return core;
    })
    .catch(e => console.warn(e));
};
