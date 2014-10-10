var sys = require('sys')
var exec = require('child_process').exec;
var child;
Gearman = require('gearman-js').Gearman
worker = new Gearman('127.0.0.1', 4730)

worker.on('JOB_ASSIGN',function(job){
	console.log('Start the job');
	data = JSON.parse(job.payload.toString());
	console.log(data);
	child = exec("youtube-dl -o './public/mpd/music/%(title)s.%(ext)s' --restrict-filenames -x --max-quality 140 "+data.url, function (error, stdout, stderr) {
	//sys.print('stdout: ' + stdout);
	//console.log(stdout);
	var resultOut = stdout.split("\n");
	var sizeResult = resultOut.length;

	var regex = /^\[download\] Destination: /;
	for(i=0;i<sizeResult;i++){
		match = resultOut[i].match(regex);
		if(match !== null) {
			var filename = resultOut[i].replace('[download] Destination: ./public/mpd/music/','');
			//ugly hack to use the same shell function for youtube and soundcloud
			data.filename = filename.replace('.mp4', '.m4a');
			console.log(data);
			i = sizeResult;
			//WORST HACK EVER BECAUSE THE UPDATE DOESNT RETURN A SIGNAL ... WORKING THOUGH
			child = exec("mpc update", function(error, stdout, stderr){
				console.log('Updating the DB');
				console.log('Start to wait 2 seconds');
				child = exec("sleep 2", function (error, stdout, stderr) {
					console.log('I waited 2 seconds now I sent the result back');
					worker.sendWorkComplete(job.handle, JSON.stringify(data));
					console.log('Worker Result sent');
					worker.preSleep();
					console.log('Waiting for job');
				});
			});
		}
	}
	});
});


worker.on('NOOP',function(){
    worker.grabJob()
});

worker.connect(function(){
	console.log('Waiting for job');
	worker.addFunction('download');
    worker.preSleep();
})
