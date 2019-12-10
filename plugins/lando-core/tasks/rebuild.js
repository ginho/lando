'use strict';

const _ = require('lodash');
const utils = require('./../lib/utils');

// Helper to handle options
const handleOpts = options => {
  const opts = {
    pullable: _(options._app.services)
      .map((data, service) => ({service, isLocal: _.has(data, 'overrides.build') || _.has(data, 'services.build')}))
      .filter(service => !service.isLocal)
      .map('service')
      .value(),
  };
  if (!_.isEmpty(options.service)) opts.services = options.service;
  return opts;
};

module.exports = lando => {
  const table = lando.cli.makeTable();
  return {
    command: 'rebuild',
    describe: 'Rebuilds your app from scratch, preserving data',
    options: {
      service: {
        describe: 'Rebuild only the specified services',
        alias: ['s'],
        array: true,
      },
      yes: utils.buildConfirm('Are you sure you want to rebuild?'),
    },
    run: options => {
      if (!options.yes) {
        console.log(lando.cli.makeArt('appRebuild', {phase: 'abort'}));
        return;
      }
      // Try to get our app
      const app = lando.getApp(options._app.root);
      // Rebuild the app
      if (app) {
        app.opts = handleOpts(options);
        console.log(lando.cli.makeArt('appRebuild', {name: app.name, phase: 'pre'}));
        return utils.appToggle(app, 'rebuild', table, lando.cli.makeArt('appRebuild', {name: app.name, phase: 'post'}));
      }
    },
  };
};
