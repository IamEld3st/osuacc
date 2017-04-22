var apiKEY,
	matchID,
	previousMID,
	results = {};

$('#btnUpdate').on('click', function () {
	console.log("btnUpdate pressed!");
	$('#content').empty();
	apiKEY = $('#apiKey').val();
	matchID = $('#matchID').val();
	console.log("Set values apiKEY: "+apiKEY+" | matchID: "+matchID);
	if (apiKEY != "") {
		if (previousMID != matchID) {
			results = {};
		}
		Object.keys(results).forEach(function(key, index) { results[key].accuracyList = []; });
		console.log("Trying to request info from API");
		$.get('https://osu.ppy.sh/api/get_match', { k: apiKEY, mp: matchID })
			.done(function(response){
				console.log("Got response!");
				document.getElementById('matchName').innerHTML = response.match.name;
				for (var i = response.games.length - 1; i >= 0; i--) {
					if (response.games[i].end_time != null) {
						$("#content").append("<div class=\"row\"><h4>Map<b>ID</b>: "+response.games[i].beatmap_id+"</h4></div><div class=\"row\"><table class=\"table table-condensed\" id=\"table"+i+"\"><tr><th>Slot</th><th>Username</th><th>Score</th><th>Accuracy</th><th>300s</th><th>100s</th><th>50s</th><th>Miss</th><th>Status</th></tr></table></div>");
						response.games[i].scores.forEach(function(item){
							console.log("Checking if player is in results...");
							if (!(results.hasOwnProperty(item.user_id))) {
								console.log("Player isn't in results... Adding to results...");
								results[item.user_id] = {username: "", accuracyList: []};
							}
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
							results[item.user_id].accuracyList.push(accuracy);
							$("#table"+i).append("<tr><td>"+actualSlot+"</td><td><a href=\"https://osu.ppy.sh/u/"+item.user_id+"\"><span class=\"user"+item.user_id+"\"></span></a></td><td>"+item.score+"</td><td>"+accuracy+"</td><td>"+a+"</td><td>"+b+"</td><td>"+c+"</td><td>"+d+"</td><td>"+passed+"</td></tr>");
						});
					}
				}
				console.log("Done writing map tables... fetching usernames");
				Object.keys(results).forEach(function(key,index) {
					if (results[key].username == "") {
						console.log("Getting username for user_id "+key);
						$.get('https://osu.ppy.sh/api/get_user', { k: apiKEY, u: key, m: 0, type: "id"})
							.done(function(response){
								if (response.length != 0) {
									console.log("Got username "+response[0].username);
									results[key].username = response[0].username;
								}else{
									results[key].username = "ID: "+key;
								}
								
							});
					}
				});
				// Check if all get requests finished
				$(document).ajaxStop(function(){
					console.log("Finished fetching usernames... Calculating top table...");
					document.getElementById("accuracyData").innerHTML = "<tr><th>Username</th><th>Best Accuracy</th><th>Average Accuracy</th><th>Worst Accuracy</th></tr>";
					Object.keys(results).forEach(function(key,index) {
						var worst = 100;
						var best = 0;
						var average = 0;
						for (var i = results[key].accuracyList.length - 1; i >= 0; i--) {
							if (results[key].accuracyList[i] >= best) {best = results[key].accuracyList[i]}
							if (results[key].accuracyList[i] <= worst) {worst = results[key].accuracyList[i]}
							average += results[key].accuracyList[i];
						}
						average = average / results[key].accuracyList.length;
						$("#accuracyData").append("<tr><td><a href=\"https://osu.ppy.sh/u/"+key+"\">"+results[key].username+"</a></td><td>"+best+"</td><td>"+average+"</td><td>"+worst+"</td></tr>");
						$("span.user"+key).empty();
						$("span.user"+key).append(results[key].username);
					});
				});
				previousMID = matchID;
				console.log(results);
			});
	}
});
