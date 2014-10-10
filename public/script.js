$(document).ready(function() {
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

/*
** Detection of the URL type
*/
//YOUTUBE
	function cleanTextBox(){
		$('#text_box').val('');
		$('#text_box').hide();
		$('.meter span').show();
		$('.meter').show();
	}

	function sendUrl(message, url, callback){
			var facebook_user_id = '123456789';
			var name = "Thomas Foricher";
			var profile_picture_url = "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfp1/v/t1.0-1/p320x320/1466048_10152062787452755_584779461_n.jpg?oh=320aeeab4970a3abd184ffd8264f5b97&oe=54C2EADB&__gda__=1420990894_0c83d200004a7ae54877a58715cfda33";
			data = {url:url, facebook_user_id:facebook_user_id , name:name, profile_picture_url:profile_picture_url};
			console.log('Sending these data');
			console.log(data);
			socket.emit(message, data);
			callback();
	}

	var regExpYoutube = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	var regExpSoundCloud = /^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/;
	$('#text_box').keyup(function () {
		matchYoutube = $('#text_box').val().match(regExpYoutube);
		matchSoundCloud = $('#text_box').val().match(regExpSoundCloud);
		if(matchYoutube !== null) {
			youtubeUrl = $('#text_box').val();
			sendUrl('download', youtubeUrl,cleanTextBox);
		} else if(matchSoundCloud !== null) {
			soundcloudUrl = $('#text_box').val();
			sendUrl('download', soundcloudUrl,cleanTextBox);
		} else {
			$('#text_box').val('');
		}
	});

	var audio = document.getElementById("radiosource");
	audio.onerror = function() {
    audio.load();
	};
});
