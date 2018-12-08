'use strict';

const mock = require('egg-mock');

describe('test/mssql2es.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/mssql2es-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, mssql2es')
      .expect(200);
  });
});
