const expect = require('chai').expect,
	monitor = require('../index.js').monitor;

describe("monitor", function() {
	it("defined and afterMeasure woken", function(done){
		expect(monitor).to.be.not.null;
		monitor.on('afterMeasure', (data)=>{
			expect(data).to.be.not.null;
			monitor.kill();
			done();
		});
	});
});
