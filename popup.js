function pauseVideo(){
	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.executeScript(tab.id, {code: "document.getElementsByClassName('html5-main-video')[0].pause()"}, function(response) {
	        return true;
	    });
	});
}

function populateTimeline(){
	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.executeScript(tab.id, {code: "showTimeline()"}, function(response) {
	        return true;
	    });
	});
}

function playVideo(){
	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.executeScript(tab.id, {code: "document.getElementsByClassName('html5-main-video')[0].play()"}, function(response) {
	        return true;
	    });
	});
}

function updateVideoTime(time){
	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.executeScript(tab.id, {code: "document.getElementsByClassName('html5-main-video')[0].currentTime="+time+";"}, function(response) {
	        return true;
	    });
	});
}
var vTitle = "";
function getVideoTitle(){
	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.executeScript(tab.id, {code: "document.getElementById('eow-title').title"}, function(response) {
	    	// alert(response.toString().length);
	    	var titleLen = response.toString().length;
	    	response = response.toString();
	    	vTitle = "";
	    	if(titleLen > 05){
	    		vTitle = response.substring(0,50) + "...";
	    	}
	       $("#video-title").text(vTitle);
	    });
	});	
}

var TimeStamp = "";
function getVideoTimeStamp(note, callback){
	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.executeScript(tab.id, {code: "document.getElementsByClassName('html5-main-video')[0].currentTime"}, function(response) {
	    	// alert(response.toString());
	    	note.TimeStamp = response.toString();
	    	callback(note);
	    });
	});	
}

function makeMinutesSeconds(TimeStamp)
{
	var minutes = Math.floor(TimeStamp / 60);
	var seconds = Math.floor(TimeStamp - minutes * 60);
	return minutes+":"+seconds;

}

function saveNote(note){
	showStatus("status", "Please wait ...", ["label", "label-info"], -1);
	$.post("http://youtubenote.azurewebsites.net/api/Users", 
		{
			"Name" : note.Name,
			"TimeStamp" : note.TimeStamp,
			"Url" : note.Url,
			"Note" : note.Content,
			"Title" : note.Title
		},
		function(response){
			//alert(response);
			// $("#status").removeClass("alert-info").addClass("alert-success").html("Done!");
			$("#note").val("");
			showStatus("status", "Done!", ["label", "label-success"], 3000);
			populateTimeline();
			location.reload();
				// $("#element").timeline("add",
	   //                              [
	   //                                { 
	   //                                  timeInstance : makeMinutesSeconds(note.TimeStamp),
	   //                                  css: 'success',
	   //                                  content: note.Content
	   //                                }
	   //                              ]
	   //                             );
	   //                          scrollBottom();
	   //                        // });
			// setTimeout(function(){ $("#status").removeClass("alert").removeClass("alert-success").html(""); }, 3000)
		}
	);
	
}

function showStatus(id, text, classes, timeout){
	var currentElement = $("#"+id);
	currentElement.removeClass();
	for(c of classes){
		currentElement.addClass(c);
	}
	currentElement.html(text);
	if(timeout != -1)
		setTimeout(function(){ currentElement.html("").removeClass();}, 3000);
}

var YoutubeUrl = "";

chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    //console.log(tabs[0].url);
    var currentUrl = tabs[0].url;

    //check if the user is viewing a video;
    if(currentUrl.startsWith("https://www.youtube.com/watch")){

    	//pause the video if it is playing;
    	if(currentUrl.indexOf("&") != -1)
    		currentUrl = currentUrl.substring(0, currentUrl.indexOf("&"));
    	YoutubeUrl = currentUrl;
 		pauseVideo();   		
 		getVideoTitle();
 		getNotes();
 		getVideos();
    }
});


$(document).ready(function(){
	$("#save").click(function(){
		var content = $("#note").val();
		if(content.trim() != ""){
			var note = {
				Name : "adityagaykar",
				Url : YoutubeUrl,
				Content : content,
				Title: vTitle 	
			}
			getVideoTimeStamp(note, saveNote);	
		} else {
			showStatus("status", "Note cannot be empty", ["label", "label-warning"], 3000);
		}
		
		// //alert(note);
		 
		// $.get("https://api.ipify.org?format=json", function(data){
		// 	$("#note").text("My ip : "+data.ip);
		// });
	});
	$("#search_button").click(function(){
		var query = $("#search_text").val();
		var url = "https://bing.com/search?q="+query.trim();
		 var win = window.open(url, '_blank');
  		win.focus();
	})
	$("#pause").click(function(){
		pauseVideo();
	});

	$("#play").click(function(){
		playVideo();
	});

	$("#remove_note_btn").click(function(){
		var url = this.getAttribute("url");
		var ts = this.getAttribute("ts");
		// alert(url+" "+ts);
		var data = {
			Name: "adityagaykar",
			Url: url,
			TimeStamp: ts
		}
		$.ajax({
			url: 'http://youtubenote.azurewebsites.net/api/Users/RemoveNote',
			type: 'DELETE',
			data : data,
			datatype : 'JSON',
			success : function(result){
				location.reload();
			}
		});
	});

});


//Timeline functions

function scrollBottom(){
      $("html, body").animate({ scrollTop: $(document).height() }, "fast");
}

function pruneContentForDisplay(content)
{
	if (content.length>30)
		return content.substring(0,30)+"... ";
	
	return content;
}



function getNotes()
 {

        	$.post("https://youtubenote.azurewebsites.net//api/Users/GetNotes", 
				{
					"Name" : "adityagaykar",
					"Url" : YoutubeUrl,
					},
				function(response){
					//alert(response + " " + YoutubeUrl);
					response.sort(function(a, b){
						return parseFloat(a.TimeStamp) < parseFloat(b.TimeStamp);
					});
					var data = []
					 for (var i = response.length -1 ; i >= 0; i--) {
								console.log(response[i]);
								var timelineEntry = {
									timeInstance : "<a href='#' class='time_spot' time_x='"+response[i].TimeStamp+"'>"+makeMinutesSeconds(response[i].TimeStamp)+"</a>",
                                	color: '#555',
                                	css: 'success',
                                	content: "<p class='time_text' ts='"+response[i].TimeStamp+"' url='"+response[i].Url+"' data='"+response[i].Note+"'>"+pruneContentForDisplay(response[i].Note)+"</p>"

								}
								data.push(timelineEntry);
								
					 };
                      $("#element").timeline({
                            data: data
                          });

                      $(".time_spot").click(function(){
							var curr_time = this.getAttribute("time_x");
							updateVideoTime(curr_time);
						});

                      $(".time_text").click(function(){
                      	var data = this.getAttribute("data");
                      	var url_data = this.getAttribute("url");
                      	var ts = this.getAttribute("ts");
                      	//nWin(data);
                      	$("#model-text").html(data);
                      	$("#myModal").modal('show');
                      	$("#remove_note_btn").attr("url", url_data);
                      	$("#remove_note_btn").attr("ts", ts);
                      })

                  });

}

function getVideos()
 {

        	$.post("http://youtubenote.azurewebsites.net/api/Users/GetVideos", 
				{
					"Name" : "adityagaykar"
					},
				function(response){
					var data = [];
					$("#videos").empty();
					 for (var i = response.length -1 ; i >= 0; i--) {
							$("#videos").append('<li class="list-group-item"><a href="'+response[i].Url+'" target="_blank">'+response[i].Title.substring(0,20)+'</a><span class="glyphicon glyphicon-share-alt pull-right" style="margin-left: 10px;"></span><span style="margin-left: 10px;" class="glyphicon glyphicon-trash pull-right remove_video_btn" data="'+response[i].Url+'"> </span></li>');
					 }
					 $(".remove_video_btn").click(function(){
						var url = this.getAttribute("data");
						var data = {
							Name: "adityagaykar",
							Url : url
						}
						$.ajax({
							url: 'http://youtubenote.azurewebsites.net/api/Users/RemoveVideo',
							type: 'DELETE',
							data : data,
							datatype : 'JSON',
							success : function(result){
								getVideos();
							}
						})
					});
                  });

}
    
function nWin(content) {
  var w = window.open();
  var html = content;
  $(w.document.body).html(html);
}
