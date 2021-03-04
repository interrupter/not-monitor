const { diskinfo } = require('@dropb/diskinfo');
const EventEmitter = require('events');
const axios = require('axios');
/**
* @module not-monitor
*/
const STANDART_INTERVAL = 5000;  //in ms
const STANDART_REPORT_INTERVAL = 60;//in seconds
const INTERVAL = parseInt(process.env.NOT_NODE_MONITOR_INTERVAL) || STANDART_INTERVAL;

const REPORT_URL = process.env.NOT_NODE_MONITOR_REPORT_URL;
const REPORT_KEY = process.env.NOT_NODE_MONITOR_REPORT_KEY;
const REPORT_INTERVAL = parseInt(process.env.NOT_NODE_MONITOR_REPORT_INTERVAL) || STANDART_REPORT_INTERVAL;

class notMonitor extends EventEmitter{
	constructor(){
		super();
		this.start();
		return this;
	}

	start(){
		this.startMeasuring();
		this.startReporting();
	}

	startMeasuring(){
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
		if(this.intMeasuring){
			clearInterval(this.intMeasuring);
		}
		this.intMeasuring = setInterval(this.measure.bind(this), INTERVAL);
	}

	async measure(){
		try{
			//memory
			let memoryRaw = process.memoryUsage();
			this.measures.memory.resident = memoryRaw.rss;
			this.measures.memory.heapTotal = memoryRaw.heapTotal;
			this.measures.memory.heapUsed = memoryRaw.heapUsed;
			this.measures.memory.external = memoryRaw.external;
			//cpu
			let cpuRaw = process.cpuUsage(this.cpuPrev);
			this.cpuPrev = process.cpuUsage();
			this.uptime = process.uptime();
			this.measures.cpu = Math.round((cpuRaw.user + cpuRaw.system) / (INTERVAL * 10));
			//disk
			let diskRaw =  await diskinfo('./');
			if(diskRaw){
				this.measures.disk = {
					size: diskRaw.size,
					used: diskRaw.used,
					avail: diskRaw.avail,
					usage: Math.round(diskRaw.used / diskRaw.size * 100)
				};
				this.emit('afterMeasure', this.measures);
			}else{
				this.emit('emptyDiskProbeResult');
			}
		}catch(e){
			this.emit('measureError', { error: e });
		}
	}

	status(){
		return this.measures;
	}

	kill(){
		clearInterval(this.intMeasuring);
		clearInterval(this.intReporting);
	}

	startReporting(){
		if (this.intReporting){
			clearInterval(this.intReporting);
		}
		if(typeof REPORT_URL !== 'undefined' && REPORT_URL.length > 10){
			this.intReporting = setInterval(this.report.bind(this), REPORT_INTERVAL*1000);
		}
	}

	report(){
		try{
			let data = {
				key:   REPORT_KEY,
				type:   'monitor',
				report:  this.measures
			};
			axios({
				method: 'PUT',
				url: REPORT_URL,
				data,
			})
				.then((response)=>{
					this.emit('afterReportSuccess',response);
				})
				.catch((error)=>{
					delete data.key;
					this.emit('afterReportError', {data, error});
				});
		}catch(e){
			this.emit('reportError', { error: e });
		}
	}
}
const INSTANCE = new notMonitor();

module.exports = INSTANCE;
