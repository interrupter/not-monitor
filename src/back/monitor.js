const { diskinfo } = require('@dropb/diskinfo');
const EventEmitter = require('events');
/**
* @module not-monitor
*/
const STANDART_INTERVAL = 5000;
const INTERVAL = parseInt(process.env.NOT_MONITOR_INTERVAL) || STANDART_INTERVAL;

class notMonitor extends EventEmitter{
	constructor(){
		super();
		this.start();
		return this;
	}

	start(){
		this.measures = {
			pid: process.pid,
			platform: process.platform,
			memory:{
				resident: 0,
				heapTotal:0,
				heapUsed: 0,
				external: 0
			}
		};
		this.cpuPrev = process.cpuUsage();
		if(this.int){
			clearInterval(this.int);
		}
		this.int = setInterval(this.measure.bind(this), INTERVAL);
	}

	async measure(){
		//memory
		let memoryRaw = process.memoryUsage();
		this.measures.memory.resident = memoryRaw.rss;
		this.measures.memory.heapTotal = memoryRaw.heapTotal;
		this.measures.memory.heapUsed = memoryRaw.heapUsed;
		this.measures.memory.external = memoryRaw.external;
		//cpu
		let cpuRaw = process.cpuUsage(this.cpuPrev);
		this.cpuPrev = process.cpuUsage();
		this.measures.cpu = Math.round((cpuRaw.user + cpuRaw.system) / (INTERVAL * 10));
		//disk
		let diskRaw =  await diskinfo('./');
		this.measures.disk = {
			size: diskRaw.size,
			used: diskRaw.used,
			avail: diskRaw.avail,
			usage: Math.round(diskRaw.used/diskRaw.size*100)
		};
		this.emit('afterMeasure', this.measures);
	}

	status(){
		return this.measures;
	}

	kill(){
		clearInterval(this.int);
	}
}
const INSTANCE = new notMonitor();
module.exports = INSTANCE;
