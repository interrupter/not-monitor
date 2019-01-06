module.exports = {
	name: 'not-monitor',
	paths:{
		controllers:  __dirname + '/front/controllers',
		templates:    __dirname + '/front/templates'
	},
	monitor:    require('./back/monitor.js')
};
