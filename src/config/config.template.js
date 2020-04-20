module.exports = {
  token: "YOUR_ACCESS_TOKEN",
  memorySegment: "stats",
  shard: ["shard0", "shard1"],
  scanInterval: 60000,
  webserver: {
    port: 8081,
  },
  prometheusPrefix: "screeps"
};
