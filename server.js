Gearman = require('gearman-js').Gearman;
//Timeout after 20 seconds
client = new Gearman("localhost", 4730 , {timeout: 20000});
var komponist = require('komponist');
var mpd = komponist.createConnection(6600, 'localhost');
var appPort = 1337;
var express = require('express'), app = express();
var http = require('http')
  , jade = require('jade')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
io.set('log level', 1);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
  res.render('home.jade');
});

server.listen(appPort);
console.log("Server listening on port "+appPort);

io.sockets.on('connection', function (socket) {
	mpd.playlistinfo(function(err, info) {
		console.log('send playlist');
		socket.emit('playlist', info);
	});

  socket.on('download', function (data) {
			client.connect(function(){
				console.log('sending a job');
				client.submitJob('download', JSON.stringify(data));
			});
			console.log(data);
	});

	client.on('WORK_COMPLETE', function(job){
		data = JSON.parse(job.payload.toString());
		console.log('job completed, filename: '+ data.filename);
		if(data.filename != global.song_to_add){
			global.song_to_add = data.filename;
			mpd.sticker('song', data.filename).set({url:data.url, facebook_user_id: data.facebook_user_id,profile_picture_url: data.profile_picture_url,name:data.name, plus:'', minus:'', score:0}, function(err){
				mpd.add(global.song_to_add, function(err){
					mpd.playlistinfo(function(err, info) {
						console.log('send the playlist socket');
            io.sockets.emit('playlist', info);
					});
				});
			});
		}
		client.close();
	});

	//progressbar
	setInterval(function(){
		mpd.status(function(err, info) {
			socket.emit('progressbar', info);
	     });
	}, 500);

	setInterval(function(){
		mpd.currentsong(function(err,info){
			//console.log(info.file);
			var sticker = mpd.sticker('song', info.file);
			sticker.get(['url', 'facebook_user_id', 'profile_picture_url', 'name'], function(err, data) {
				//console.log(data);
				socket.emit('current_song', data);
			});
		});
	}, 2000);

});
