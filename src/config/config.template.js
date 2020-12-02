module.exports = {
  api: {
    token: "YOUR_ACCESS_TOKEN",
    protocol: 'https',
    hostname: 'screeps.com',
    port: 443,
    path: '/' // Do no include '/api', it will be added automatically
  },
  memorySegment: "stats",
  shard: ["shard0", "shard1"],
  scanInterval: 60000,
  webserver: {
    port: 8081,
  },
  prometheusPrefix: "screeps"
};
