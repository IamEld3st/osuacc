var apiKEY,
	matchID;

$('#btnUpdate').on('click', function () {
	console.log("btnUpdate pressed!");
	$('#content').empty();
	apiKEY = $('#apiKey').val();
	matchID = $('#matchID').val();
	console.log("Set values apiKEY: "+apiKEY+" | matchID: "+matchID);
	if (apiKEY != "") {
		console.log("Trying to request info from API");
		$.get('https://osu.ppy.sh/api/get_match', { k: apiKEY, mp: matchID })
			.done(function(response){
				console.log("Got response!");
				document.getElementById('matchName').innerHTML = response.match.name;
				for (var i = response.games.length - 1; i >= 0; i--) {
					if (response.games[i].end_time != null) {
						$("#content").append("<div class=\"row\"><h4>Map<b>ID</b>: "+response.games[i].beatmap_id+"</h4></div><div class=\"row\"><table class=\"table table-condensed\" id=\"table"+i+"\"><tr><th>Slot</th><th>Score</th><th>Accuracy</th><th>300s</th><th>100s</th><th>50s</th><th>Miss</th><th>Status</th></tr></table></div><hr>");
						response.games[i].scores.forEach(function(item){
							var passed;
							if (item.pass == "1") {
								passed = "PASSED";
							}else{
								passed = "FAILED";
							}
							var a = parseInt(item.count300);
							var b = parseInt(item.count100);
							var c = parseInt(item.count50);
							var d = parseInt(item.countmiss);
							var actualSlot = parseInt(item.slot)+1;
							var accuracy = (a*300+b*100+c*50)/(3*(a+b+c+d));
							console.log("Calculated accuracy for slot "+ actualSlot +" to be "+accuracy);
							$("#table"+i).append("<tr><td>"+actualSlot+"</td><td>"+item.score+"</td><td>"+accuracy+"</td><td>"+a+"</td><td>"+b+"</td><td>"+c+"</td><td>"+d+"</td><td>"+passed+"</td></tr>");
						});
					}
				}
			});
	}
});
