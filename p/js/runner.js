var runner = {
	_run: ()=>{
		if (!runner.running) return;
		
		if (runner.last_eval_time)
			engine_info.run(Math.min(+new Date()-runner.last_eval_time,100)/1000*runner.speed);
		else
			engine_info.run(1/20*runner.speed);
		runner.last_eval_time = +new Date();
		window.requestAnimationFrame(runner._run);
	},
	
	start: ()=>{
		if (!runner.running){
			runner.running = true;
			runner._run();
		}
	},
	
	stop: ()=>{
		if (runner.running){
			runner.running = false;
			runner.last_eval_time = 0;
		}
	},
	speed: 1,
	running: false,
	last_eval_time: 0
};
