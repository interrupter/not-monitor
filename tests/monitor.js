const expect = require('chai').expect,
	monitor = require('../index.js').monitor;

describe("monitor", function() {
	it("defined and afterMeasure woken", function(done){
		expect(monitor).to.be.not.null;
		function after(data){
			expect(data).to.be.not.null;
			monitor.off('afterMeasure',after);
			done();
		}
		monitor.on('afterMeasure', after);
	});
	it("status", function(){
		let status = monitor.status();
		expect(status).to.be.not.null;
	});
	it("start again", function(){
		monitor.start();
	});
	it("kill", function(){
		monitor.kill();
	});

});
