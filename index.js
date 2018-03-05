const fs = require("fs");
const {ScreepsAPI} = require("screeps-api");

const config = {
	token: '2d51b016-04bd-47c1-a04b-24671f8cdd16',
	memorySegment: 'stats',
	shard: 'shard2',
	scanInterval: 15000,
	webserver: {
		port: 8081,
	},
	prometheusPrefix: "screeps_",
}

const http = require("http");
let server = http.createServer((req,res) => {
	// res.set('Content-Type', Prometheus.register.contentType);
	res.end(Prometheus.register.metrics());
});
server.listen(config.webserver.port);

const Prometheus = require('prom-client');
Prometheus.collectDefaultMetrics({ timeout: 10000 }); // collects RAM usage etc every 10 s
const httpRequestDurationMilliseconds = new Prometheus.Histogram({
  name: config.prometheusPrefix+'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['route'],
  // buckets for response time from 0.1ms to 500ms
  buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
});
const promStats = {
	memory_used: new Prometheus.Gauge({
		name: config.prometheusPrefix+'memory_used',
		help: "How much memory is in use",
		labelNames: ['route'],
	}),
	// memory_used: new Prometheus.Gauge({
		// name: config.prometheusPrefix+'memory_used',
		// help: "How much memory is in use",
		// labelNames: ['route'],
	// }),
	
}

const api = new ScreepsAPI({
  token: config.token,
  protocol: 'https',
  hostname: 'screeps.com',
  port: 443,
  path: '/' // Do not include '/api', it will be added automatically
});
api.socket.connect()
// Events have the structure of:
// {
//   channel: 'room',
//   id: 'E3N3', // Only on certain events
//   data: { ... }
// }
api.socket.on('connected',()=>{
    // Do stuff after conntected
	console.log("Connected")
})
api.socket.on('auth',(event)=>{
    // Do stuff after auth
	console.log("Authenticated");
	
	api.socket.subscribe('console', event => {
		// console.log(event.data.messages.log); // List of console.log output for tick
	});
	
	api.socket.subscribe('memory',(event)=>{
		console.log('stats',event.data);
	});
	setInterval(async function(){
		let memory = await getMemory(config.shard);
		
		// promStats.memory_used.set(memory.data.memory.used);
		console.log(JSON.stringify(memory, 4))
		recursiveGaugeGenerator(memory.data);
		
	}, config.scanInterval);
});
function recursiveGaugeGenerator(object, keyPrefix = ""){
	for(let key in object){
		let entry = object[key];
		console.log(keyPrefix+key)
		if(typeof entry === "object" && !Array.isArray(entry)){
			recursiveGaugeGenerator(entry, keyPrefix + key + "_"); // recurse
		} else if(typeof entry === "number"){
			if(!promStats[keyPrefix + key]){
				let labelNames = [];
				for(let key2 in object){
					if(typeof object[key2] === "string"){
						labelNames.push(object[key2]);
					}
				}
				promStats[keyPrefix + key] = new Prometheus.Gauge({
					name: config.prometheusPrefix + keyPrefix + key,
					help: key,
					labelNames,
				});
			}
			promStats[keyPrefix + key].set(entry);
		}
	}
}
async function getMemory(shard){
	let memory = api.memory.get(config.memorySegment, shard);
	return await memory;
}