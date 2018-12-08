'use strict';

const assert = require('assert');
const mssql2es = require('./lib/mssql2es');

module.exports = (app) => {
  //const index = app.config.appMiddleware.indexOf('mssql2es');
  //console.log(app.config.httpproxy)
  //assert.equal(index, -1, 'Duplication of middleware name found: rest. Rename your middleware other than "httproxy" please.');
  //app.config.coreMiddleware.unshift('mssql2es');
  //console.log(app.config.mssql2es)
  !app.config.mssql2es && assert.fail('confg/config.js缺少配置mssql2es');
  app.logger.info('start service')
  app.messenger.on('updaterunning', by => {
    // create an anonymous context to access service
    const ctx = app.createAnonymousContext();
    ctx.runInBackground(async () => {
      await ctx.app.mssql2es.updaterunning(by);
    });
  });
  app.beforeStart(async () => {
    if (app.config.mssql2es.rules) {
      app.mssql2es = new mssql2es(app);
      await app.mssql2es.init();
      //await app.runSchedule('syncdata');
    }
  });
  app.ready(async (err) => {
    if (err) throw err;
    //await app.runSchedule('update_cache');
  });
};
