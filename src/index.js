const { ScreepsAPI } = require("screeps-api");
const Prometheus = require("prom-client");
const config = require("./config/config.js");
const http = require("http");

Prometheus.collectDefaultMetrics({ timeout: 10000 });


//api.auth("argha","pagla")
const prometheusStats = {};

function recursiveGauge(obj, prefix, labels) {
  for (const key in obj) {
    if (typeof obj[key] == "object") {
      if (obj[key].promStat) {
        switch (obj[key].promStat) {
          case "label":
            recursiveGauge(
              obj[key].value,
              prefix,
              Object.assign({ [obj[key].label]: key }, labels)
            );
            break;
          case "gauge":
            const metricName = `${prefix}_${key}`;
            const metricValue = obj[key].value || 0;
            const metricHelp =
              obj[key].help == null ? "no help" : obj[key].help;

            if (prometheusStats[metricName] === undefined) {
              prometheusStats[metricName] = new Prometheus.Gauge({
                name: metricName,
                help: metricHelp,
                labelNames: Object.keys(labels),
              });
            }

            prometheusStats[metricName].set(labels, metricValue);
            break;
          default:
            console.error("invalid prometheus stat");
            break;
        }
      } else {
        recursiveGauge(obj[key], `${prefix}_${key}`, labels);
      }
    } else {
      // Handle stats with no definition
      recursiveGauge(
        {
          [key]: {
            promStat: "gauge",
            value: obj[key],
          },
        },
        prefix,
        labels
      );
    }
  }
}

const api = ScreepsAPI.fromConfig('main')
    .then((api)=>{
        api.socket.connect()
        api.socket.on("connected", () => {
        console.log("Connected");
        });
        api.socket.on("auth", async function (event) {
        console.log("Authenticated");

        setInterval(updateStats, config.scanInterval, api);
        await updateStats(api);
    })
    })
async function updateStats(api) {
  console.log("Updating");

  for (const currentShard of config.shards) {
    let memory = (await api.memory.get(config.memorySegment, currentShard))
    .data;
    
    recursiveGauge(memory, config.prometheusPrefix, { shard: currentShard });
  }
}


let server = http.createServer((req, res) => {
  res.end(Prometheus.register.metrics());
});

server.listen(config.webserver.port);
