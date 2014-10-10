//Socket.io
var socket = io.connect();

socket.on('status', function (data) {
	console.log(data);
});

//progressbar
socket.on('progressbar', function (data) {
	//Progress bar
	$('.track').removeClass('playing');
	if(data.state == "play")
	{
		var progress = data.time;
		var progress_arr=progress.split(":");

		/*
		** For some weird reason, mpd sends double duration
		*/

		progress = parseInt(((2*progress_arr[0]/progress_arr[1])-1)*100);
		progress = progress.toString() + '%';
		$('.elapsed').css({'width':progress});
		$('.track-info .title').html($('.track[data-id='+data.songid+'] .title').html());
		$('.track[data-id='+data.songid+']').addClass('playing');
	}
});

socket.on('current_song', function (data) {
	$('#profile_picture').attr('src', data.profile_picture_url);
	$('.artist').html(data.name);
});
socket.on('test', function (data) {
	console.log("YYYYOOOOOLOO#######");
	console.log(data);
});

socket.on('playlist', function (data) {
	$('#text_box').show();
	$('.meter').hide();
	console.log('received');
	console.log(data);
	//Playlist
	$('.tracks').empty();
	var playlist_size = Object.size(data);

	for (i=0;i<playlist_size;i++)
	{
		duration = duration_display(data[i].Time);
		file_songname = data[i].file;
		file_songname = file_songname.toString();
		file_songname = file_songname.replace(/_/g, " ");
		var song_html = '<li class="track" data-id="'+data[i].Id+'">' +
						'	<span class="title">'+file_songname.slice(0,-4)+'</span>' +
						'	<span class="duration">'+duration+'</span>' +
						'</li>';
		$('.tracks').append(song_html);
	}
});



function duration_display(time)
{
	/*
	** For some weird reason, mpd sends double duration
	*/
	time = Math.floor(time / 2);
	minute = Math.floor(time/60);
	second = time - Math.floor(time/60)*60;
	second_string = second.toString();
	if(second_string.length == 1)
	{
		second_string = '0'+ second_string;
	}
	duration = minute.toString() + ':' + second_string;
	return duration;
}
