// chrome.runtime.sendMessage("pause-video");

// chrome.tabs.getSelected(null, function(tab){
//     chrome.tabs.executeScript(tab.id, {code: "alert('test');"}, function(response) {
//         return true;
//     });
// });

function makeMinutesSeconds(TimeStamp)
{
	var minutes = Math.floor(TimeStamp / 60);
	var seconds = Math.floor(TimeStamp - minutes * 60);
	return minutes+":"+seconds;

}

var index = 1;
var YoutubeUrl = "";
var data = [];

function setVideoTime(currentTime){
	var video_app = document.getElementsByTagName("video")[0];
	video_app.currentTime = currentTime;
	//alert(currentTime);
}

function pausePlayer(currentTime){
	var video_app = document.getElementsByTagName("video")[0];
	video_app.pause();
	//alert(currentTime);
}

function showTimeline(){
	$.post("https://youtubenote.azurewebsites.net//api/Users/GetNotes", 
		{
			"Name" : "adityagaykar",
			"Url" : YoutubeUrl,
			},
		function(response){
			response.sort(function(a, b){
				return parseFloat(a.TimeStamp) < parseFloat(b.TimeStamp);
			});
			data.splice(0);
			 for (var i = response.length -1 ; i >= 0; i--) {
						console.log(response[i]);
						// var timelineEntry = {
						// 	timeInstance : "<a href='#' class='time_spot' time_x='"+response[i].TimeStamp+"'>"+makeMinutesSeconds(response[i].TimeStamp)+"</a>",
      //                   	color: '#555',
      //                   	css: 'success',
      //                   	content: "<p class='time_text' ts='"+response[i].TimeStamp+"' url='"+response[i].Url+"' data='"+response[i].Note+"'>"+pruneContentForDisplay(response[i].Note)+"</p>"

						// }
						var timelineEntry = {
							timestamp : response[i].TimeStamp,
							data : response[i].Note
						}
						data.push(timelineEntry);			
			}
			$("#timeline").html("");
			$("#timeline").append("<div class='pipe' style='background-color: red; min-height: 5px; width: 100%'></div>");
			var data_len = data.length;
			var margin_to_set = (1/data_len) * 100;
			margin_to_set -= margin_to_set * 0.30; 
			if(data.length == 1){
				margin_to_set = 49;
			}
			for(var i of data){
				var ts = makeMinutesSeconds(i.timestamp);
				$("#timeline").append("<div class='dot' id='dot"+(index)+"' data='"+ts+" : "+i.data+"' timestamp='"+i.timestamp+"' style='margin-left : "+margin_to_set+"%' title='"+ts+"'></div>");
				$("#dot"+index).click(function(){
					var data = this.getAttribute("data");
					var timestamp_val = this.getAttribute("timestamp");
					$("#time_data").html(data);
					setVideoTime(timestamp_val);
					pausePlayer();
				});
				index++;
			}

			$("#timeline").append("<h3 id='time_data' style='margin: 20px;'>Click on the time line to view notes!</h3>");
		}
	);
}



$(document).ready(function(){
	var style_css = '.dot{width:10px;height:10px;background-color:#fff;display:inline-block;margin-left:23%;border-radius:7px;border:1px solid #000;margin-top:-9px;vertical-align:top}';
	$("head").append('<style>'+style_css+'</style>');
	//<div > </div>
	var timeline_width = 640;
	if(window.innerWidth >= 1720){
		timeline_width = 1280;
	} else if (window.innerWidth >= 1294){
		timeline_width = 854;
	}
	$("<div class='timeline' id='timeline' style='background-color: #fff; min-height: 100px; width: "+timeline_width+"px' class='watch-main-col action-panel-content yt-uix-expander yt-card yt-card-has-padding yt-uix-expander-collapsed'></div>").insertBefore("#watch7-content");
	YoutubeUrl = location.href;
	showTimeline();

	var video_app = document.getElementsByTagName("video")[0];
	video_app.ontimeupdate = function(){
		for(i of data){
			if(i.timestamp >= video_app.currentTime-1){
				$("#time_data").html(makeMinutesSeconds(i.timestamp)+" : " +i.data);
				break;
			}
		}
	}
});

/*
#timeline {width: 640px;}@media screen and (min-height: 980px) and (min-width: 1720px)#timeline {width: 1280px;}@media screen and (min-height: 630px) and (min-width: 1294px)#timeline {width: 854px;}
*/