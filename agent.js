module.exports = agent => {
    class ClusterStrategy extends agent.ScheduleStrategy {
      start() {
        // 订阅其他的分布式调度服务发送的消息，收到消息后让一个进程执行定时任务
        // 用户在定时任务的 schedule 配置中来配置分布式调度的场景（scene）
        
      }
    }
    agent.schedule.use('cluster', ClusterStrategy);
  };