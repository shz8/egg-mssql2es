module.exports = {
    schedule: {
      interval: '2s', // 1 分钟间隔
      type: 'worker', // 指定所有的 worker 都需要执行
      immediate:true,
    },
    async task(ctx) {
        ctx.app.mssql2es.task();
        //console.log('my',ctx.app.mssql2es.rules);
        //console.log('sys',ctx.app.config.mssql2es.rules);
    },
  };