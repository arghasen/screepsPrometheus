const fs = require("fs");
const {ScreepsAPI} = require("screeps-api");

const config = require("./config/config.js");

const http = require("http");
let server = http.createServer((req,res) => {
	// res.set('Content-Type', Prometheus.register.contentType);
	res.end(Prometheus.register.metrics());
});
server.listen(config.webserver.port);

const Prometheus = require('prom-client');
Prometheus.collectDefaultMetrics({ timeout: 10000 }); // collects RAM used etc every 10 s
// const httpRequestDurationMilliseconds = new Prometheus.Histogram({
  // name: config.prometheusPrefix+'http_request_duration_ms',
  // help: 'Duration of HTTP requests in ms',
  // labelNames: ['route'],
  // buckets for response time from 0.1ms to 500ms
  // buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
// });
const promStats = {
	// memory_used: new Prometheus.Gauge({
		// name: config.prometheusPrefix+'memory_used',
		// help: "How much memory is in use",
		// labelNames: ['route'],
	// }),
	// memory_used: new Prometheus.Gauge({
		// name: config.prometheusPrefix+'memory_used',
		// help: "How much memory is in use",
		// labelNames: ['route'],
	// }),
	
}
promStats.cpu_used = new Prometheus.Gauge({
	name: config.prometheusPrefix + "cpu_used",
	help: "Per tick CPU used in ms",
	labelNames: ["user", "shard"],
});
promStats.cpu_bucket = new Prometheus.Gauge({
	name: config.prometheusPrefix + "cpu_bucket",
	help: "Stored CPU",
	labelNames: ["user", "shard"],
});
promStats.gcl_level = new Prometheus.Gauge({
	name: config.prometheusPrefix + "gcl_level",
	help: "current GCL level",
	labelNames: ["user", "shard"],
});
promStats.gcl_progress = new Prometheus.Gauge({
	name: config.prometheusPrefix + "gcl_progress",
	help: "GCL progress towards next level",
	labelNames: ["user", "shard"],
});
promStats.gcl_progress_total = new Prometheus.Gauge({
	name: config.prometheusPrefix + "gcl_progress_total",
	help: "GCL progress needed for next level",
	labelNames: ["user", "shard"],
});
promStats.credits = new Prometheus.Gauge({
	name: config.prometheusPrefix + "credits",
	help: "Credit balance in account",
	labelNames: ["user", "shard"],
});
promStats.order_count = new Prometheus.Gauge({
	name: config.prometheusPrefix + "order_count",
	help: "Number of active market orders",
	labelNames: ["user", "shard"],
});
promStats.memory_used = new Prometheus.Gauge({
	name: config.prometheusPrefix + "memory_used",
	help: "Memory used by screeps script",
	labelNames: ["user", "shard"],
});
// room specific metrics
promStats.room_controller_level = new Prometheus.Gauge({
	name: config.prometheusPrefix + "room_controller_level",
	help: "Room controller level",
	labelNames: ["user", "shard", "roomName"],
});
promStats.room_controller_progress = new Prometheus.Gauge({
	name: config.prometheusPrefix + "room_controller_progress",
	help: "Room controller progress",
	labelNames: ["user", "shard", "roomName"],
});
promStats.room_controller_progress_needed = new Prometheus.Gauge({
	name: config.prometheusPrefix + "room_controller_progress_needed",
	help: "Room controller progress needed for upgrade",
	labelNames: ["user", "shard", "roomName"],
});
promStats.room_controller_downgrade = new Prometheus.Gauge({
	name: config.prometheusPrefix + "room_controller_downgrade",
	help: "Room controller ticks to downgrade",
	labelNames: ["user", "shard", "roomName"],
});
promStats.room_energy_available = new Prometheus.Gauge({
	name: config.prometheusPrefix + "room_energy_available",
	help: "Amount of energy in spawn and extensions available for spawning",
	labelNames: ["user", "shard", "roomName"],
});
promStats.room_energy_cap = new Prometheus.Gauge({
	name: config.prometheusPrefix + "room_energy_cap",
	help: "Maximum amount of energy in spawn and extensions",
	labelNames: ["user", "shard", "roomName"],
});
promStats.room_source_energy = new Prometheus.Gauge({
	name: config.prometheusPrefix + "room_source_energy",
	help: "Energy in room sources",
	labelNames: ["user", "shard", "roomName"],
});
promStats.room_mineral_amount = new Prometheus.Gauge({
	name: config.prometheusPrefix + "room_mineral_amount",
	help: "Amount of minerals in the rooms deposit",
	labelNames: ["user", "shard", "roomName", "mineral_type"],
});
promStats.room_storage_energy = new Prometheus.Gauge({
	name: config.prometheusPrefix + "room_storage_energy",
	help: "Amount of energy in room storage",
	labelNames: ["user", "shard", "roomName"],
});


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
api.socket.on('auth',async function(event){
    // Do stuff after auth
	console.log("Authenticated");
	let userData = await api.me();
	console.log(userData)
	
	api.socket.subscribe('console', event => {
		// console.log(event.data.messages.log); // List of console.log output for tick
	});
	
	setInterval(async function(){
		let memory = await getMemory(config.shard);
		
		// promStats.memory_used.set(memory.data.memory.used);
		// console.log(JSON.stringify(memory, null, 4))
		// recursiveGaugeGenerator(memory.data);
		promStats.cpu_used
			.labels(userData.username, config.shard)
			.set(memory.data.cpu.used || 0);
		promStats.cpu_bucket
			.labels(userData.username, config.shard)
			.set(memory.data.cpu.bucket || 0);
		promStats.gcl_level
			.labels(userData.username, config.shard)
			.set(memory.data.gcl.level || 0);
		promStats.gcl_progress
			.labels(userData.username, config.shard)
			.set(memory.data.gcl.progress || 0);
		promStats.gcl_progress_total
			.labels(userData.username, config.shard)
			.set(memory.data.gcl.progress_total || 0);
		promStats.credits
			.labels(userData.username, config.shard)
			.set(memory.data.market.credits || 0);
		promStats.order_count
			.labels(userData.username, config.shard)
			.set(memory.data.market.num_orders || 0);
		promStats.memory_used
			.labels(userData.username, config.shard)
			.set(memory.data.memory.used || 0);
		for(let roomName in memory.data.roomSummary){
			promStats.room_controller_level
				.labels(userData.username, config.shard, roomName)
				.set(memory.data.roomSummary[roomName].controller_level || 0);
			promStats.room_controller_progress
				.labels(userData.username, config.shard, roomName)
				.set(memory.data.roomSummary[roomName].controller_progress || 0);
			promStats.room_controller_progress_needed
				.labels(userData.username, config.shard, roomName)
				.set(memory.data.roomSummary[roomName].controller_progress_needed || 0);
			promStats.room_controller_downgrade
				.labels(userData.username, config.shard, roomName)
				.set(memory.data.roomSummary[roomName].controller_downgrade || 0);
			promStats.room_energy_available
				.labels(userData.username, config.shard, roomName)
				.set(memory.data.roomSummary[roomName].energy_avail || 0);
			promStats.room_energy_cap
				.labels(userData.username, config.shard, roomName)
				.set(memory.data.roomSummary[roomName].energy_cap || 0);
			promStats.room_source_energy
				.labels(userData.username, config.shard, roomName)
				.set(memory.data.roomSummary[roomName].source_energy || 0);
			promStats.room_mineral_amount
				.labels(userData.username, config.shard, roomName, memory.data.roomSummary[roomName].mineral_type)
				.set(memory.data.roomSummary[roomName].mineral_amount || 0);
			promStats.room_storage_energy
				.labels(userData.username, config.shard, roomName)
				.set(memory.data.roomSummary[roomName].storage_energy || 0);
			
		}
		
	}, config.scanInterval);
});
function recursiveGaugeGenerator(object, keyPrefix = ""){
	for(let key in object){
		let entry = object[key];
		// console.log(keyPrefix+key)
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