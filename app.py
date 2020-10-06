"""SoundOs - Sonos Web Controller

Specifically useful on platforms where there is no client available
or when the one that is availble is not up to scratch.

"""
from datetime import datetime
from flask import Flask, render_template, jsonify, url_for

import soco
from soco.discovery import by_name

app = Flask(__name__)
app.config.from_pyfile("config/settings.py")

run_host=app.config["HOST"]
run_port=app.config["PORT"]

@app.route("/play/<current_player>")
def play(current_player):
    """Endpoint to start playback on a specific player

    Play specified player

    """
    player = by_name(current_player)
    player.play()
    return "Ok"

@app.route("/pause/<current_player>")
def pause(current_player):
    """Endpoint to pause playback on a specific player

    Pause specified player

    """
    player = by_name(current_player)
    player.pause()
    return "Ok"

@app.route("/next/<current_player>")
def next_track(current_player):
    """Endpoint for playing the next track on a specific player

    Move to next track

    """
    player = by_name(current_player)
    player.next()
    return "Ok"

@app.route("/previous/<current_player>")
def previous_track(current_player):
    """Endpoint for playing the previous track on a specific player

    Move to previous track

    """
    player = by_name(current_player)
    player.previous()
    return "Ok"

@app.route("/state/<current_player>")
def state(current_player):
    """Endpoint for getting the state of a player

    Shows detail about a specific player in the system
    Includes track information

    """
    player = by_name(current_player)

    track_pos = player.get_current_track_info()['position']
    track_pos_sec = datetime.strptime(track_pos, "%H:%M:%S") - datetime(1900, 1, 1)
    track_tot = player.get_current_track_info()['duration']
    track_tot_sec = datetime.strptime(track_tot, "%H:%M:%S") - datetime(1900, 1, 1)

    if track_tot_sec.total_seconds() != 0:
        track_pos_pct = round(track_pos_sec.total_seconds() / track_tot_sec.total_seconds() * 100)
        track_pos_remaining = str(track_tot_sec - track_pos_sec)
    else:
        track_pos_pct = 0
        track_pos_remaining = 0

    track_details = player.get_current_track_info()
    player_state = {
        "player_name": current_player,
        "player_uid": player.get_speaker_info()["uid"],
        "player_state": player.get_current_transport_info()["current_transport_state"].split("_")[0].title(),
        "player_track_title": track_details['title'],
        "player_track_artist": track_details['artist'],
        "player_track_album": track_details['album'],
        "player_track_position": track_details['position'],
        "player_track_position_pct": track_pos_pct,
        "player_track_duration": track_details['duration'],
        "player_track_remaining": track_pos_remaining,
        "player_track_album_art": track_details['album_art']
    }

    return jsonify(player_state)

@app.route("/players")
def players():
    """Endpoint for getting a list of players

    Shows some detail about all the players in the system

    """
    all_players = soco.discover()

    player_list = list()
    for player in all_players:
        track_details = player.get_current_transport_info()
        player_details = {
            "player_name": player.player_name,
            "player_uid": player.uid,
            "player_ip": player.ip_address,
            "player_state": track_details["current_transport_state"].split("_")[0].title()
        }
        player_list.append(player_details)

    return jsonify(sorted(player_list, key=lambda i: i["player_name"]))

@app.route("/")
def index():
    """Main program

    Renders the web interface

    """
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host=run_host, port=run_port)
