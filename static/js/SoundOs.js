$(document).ready(function() {
	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}

	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
	 	}
		return "";
	}

 	var currentPlayer = getCookie("currentPlayer");
 	var currentPlayerState = "";

 	var updatePlayPauseButton = function (state) {
 		switch (state) {
 			case "Playing":
 				$("#btn-playpause").html('<i class="fa fa-pause-circle fa-4x"></i>')
 				break;
 			case "Paused":
	 			$("#btn-playpause").html('<i class="fa fa-play-circle fa-4x"></i>')
 				break;
 			case "Stopped":
 				$("#btn-playpause").html('<i class="fa fa-play-circle fa-4x"></i>')
 				break;
 		}
 	}

	var updatePlayerDetails = function (player) {
		// make active in the player list
		$("#active-player").html(player)

		// set player name in main panel
		$("#main-player-name").html(player)

		// unhide the card
		$("#main-player-card").removeClass("d-invisible")
		
		updatePlayerListState()
		
		$.ajax({
			url: window.location.origin + "/state/" + player,
			success: function (data) {
				currentPlayerState = data.player_state
				updatePlayPauseButton(currentPlayerState)

				// handle updating of album art
				if ($("#track-title").html() != data.player_track_title) {
					$("#album-art-loading").addClass("loading").addClass("loading-lg")
					$("#main-player-album-art").attr("src", data.player_track_album_art)
					$("#album-art-loading").removeClass();
				}

				$("#state-" + data.player_uid).html(currentPlayerState)
				$("#main-player-state").html(currentPlayerState)
				$("#track-title").html(data.player_track_title)
				$("#track-artist-album").html(data.player_track_artist + " &middot; " + data.player_track_album)
				$("#track-position").html(data.player_track_position)
				$("#track-remaining").html("-" + data.player_track_remaining)
				$("#track-progress").attr("style", "width:" + data.player_track_position_pct + "%").attr("aria-valuenow", data.player_track_position_pct).attr("data-tooltip", data.player_track_position)
				$("#player-details").removeClass("d-invisible")
			}
		})
	}

	// run at page load to build the list of players
	var playerList = function () {
		$.ajax({
			url: window.location.origin + "/players",
			success: function (data) {
				// builds the list of players
				data.forEach(player => {
					$("#player-list").append('<li class="menu-item"><a href="#" class="">' + player["player_name"] + '</a><div class="menu-badge"><label id="state-' + player["player_uid"] + '" class="label label-rounded text-tiny player-name">' + player["player_state"] + '</label></div></li>')
				})

				$("#player-list").on("click", "a", function (e) {
					e.preventDefault();
					
					// currently selected player
					currentPlayer = $(this).html()
					setCookie("currentPlayer", currentPlayer, 365)
					
					// remove any unneeded classes
					$("#player-list li a").removeClass()

					// set to active selection
					$(this).addClass("active")

					updatePlayerDetails(currentPlayer)
				})
			}
		})
	}

	var updatePlayerListState = function () {
		$.ajax({
			url: window.location.origin + "/players",
			success: function (data) {
				data.forEach(player => {
					$("#state-" + data.player_uid).html(data.player_state)
				})
			}
		})
	}

	$("#btn-previous").click(function () {
		$("#main-player-album-art").removeAttr("src")
		$.ajax({
			url: window.location.origin + "/previous/" + currentPlayer,
		})
	})
	$("#btn-playpause").click(function () {
		// if currently paused
		if (currentPlayerState == "Paused" || currentPlayerState == "Stopped") {
			//updatePlayPauseButton("Playing")
			$.ajax({
				url: window.location.origin + "/play/" + currentPlayer,
			})
		}

		//if currently playing
		if (currentPlayerState == "Playing") {
			//updatePlayPauseButton("Paused")
			$.ajax({
				url: window.location.origin + "/pause/" + currentPlayer,
			})
		}
	})
	$("#btn-next").click(function () {
		$("#main-player-album-art").removeAttr("src")
		$.ajax({
			url: window.location.origin + "/next/" + currentPlayer,
		})
	})

	playerList();
	window.setInterval(function() {
		if (currentPlayer != "") {
			updatePlayerDetails(currentPlayer)
		}
	}, 500)
});
