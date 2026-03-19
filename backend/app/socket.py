import socketio
import asyncio
import random
import string
from app.models import Room, Player
from app.state import active_rooms

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

def generate_pin(length=4):
    return ''.join(random.choices(string.digits, k=length))

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    
@sio.event
async def disconnect(sid, environ):
    print(f"Client disconnected: {sid}")
    room_to_delete = None
    for pin, room in active_rooms.items():
        if sid in room.players:
            if room.creator_session_id == sid:
                room_to_delete = pin
            else:
                del room.players[sid]
                await sio.emit("player_left", {"session_id": sid}, room=pin)
            break
        
    if room_to_delete:
        await sio.emit("room_closed", {"reason": "Creator Disconnected"}, room=room_to_delete)
        del active_rooms[room_to_delete]
        print(f"Room {room_to_delete} destroyed because creator left.")
            
@sio.event
async def create_room(sid, data):
    nickname = data.get("nickname", "Host")
    time_limit = data.get("time_limit_seconds", 600)
    
    pin = generate_pin() # This returns a string
    while pin in active_rooms:
        pin = generate_pin()
        
    host_player = Player(session_id=sid, nickname=nickname)
    
    new_room = Room(
        pin=pin,
        time_limit_seconds=time_limit,
        time_remaining=time_limit,
        creator_session_id=sid,
        players={sid: host_player},
        status="lobby" # Ensure this is set
    )
    
    active_rooms[pin] = new_room
    
    # CRITICAL FIX: Added await here
    await sio.enter_room(sid, pin) 
    
    # Send confirmation to the creator
    await sio.emit("room_created", new_room.model_dump(), to=sid)
    print(f"Room {pin} created by {nickname} ({sid})")

@sio.event
async def join_room(sid, data):
    pin = str(data.get("pin", "1234"))
    
    if pin not in active_rooms:
        await sio.emit("error", {"message": "Room not found!"}, to=sid)
        return

    room = active_rooms[pin]

    # --- THE FIX: Don't overwrite existing players ---
    if sid not in room.players:
        # Only create a new player if they aren't already in the room
        nickname = data.get("nickname", "Player")
        room.players[sid] = Player(nickname=nickname, session_id=sid)
        print(f"New User {nickname} joined room {pin}.")
    else:
        # Player is already in the dictionary, just log the re-sync
        print(f"User {room.players[sid].nickname} re-synced with room {pin}.")
    
    # Put them in the socket room (required for broadcasts)
    await sio.enter_room(sid, pin)
    
    # Send the full room data back so everyone stays synced
    await sio.emit("lobby_updated", room.model_dump(), room=pin)
    
async def game_timer_task(pin:str):
    room = active_rooms.get(pin)
    while room and room.status == "playing" and room.time_remaining > 0:
        await asyncio.sleep(1)
        
        room.time_remaining -= 1
        await sio.emit("timer_tick", {"time_remaining": room.time_remaining}, room=pin)
        
    if room and room.status == "playing" and room.time_remaining <= 0:
        print(f"Time's up for room {pin}")
        await end_game(pin, reason = "time_up")
        
@sio.event
async def start_game(sid, data):
    pin = data.get("pin", "").upper()
    if pin not in active_rooms:
        await sio.emit("error", {"message": "Room not found"}, to=sid)
        return
    
    room = active_rooms[pin]
    
    # if room.creator_session_id != sid:
    #     await sio.emit("error", {"message": "only the creator can start the game."}, to=sid)
    #     return
    if room.status != "lobby":
        await sio.emit("error", {"message": "Game has already started."}, to=sid)
        return
    room.status = "playing"
    
    player_count = len(room.players)
    
    room.shared_monster_max_hp = 50 * player_count
    room.shared_monster_hp = room.shared_monster_max_hp
    room.current_stage = 1
    
    print(f"Game started in room {pin}! Stage 1 HP set to {room.shared_monster_max_hp}")
    
    await sio.emit("game_started", room.model_dump(), room=pin)
    
    sio.start_background_task(game_timer_task, pin)
    
async def end_game(pin:str, reason:str):
    room = active_rooms.get(pin)
    if not room:
        return
    room.status = "finished"
    
    leaderboard = sorted(
        [player.model_dump() for player in room.players.values()],
        key = lambda x : x["score"],
        reverse=True
    )
    await sio.emit("game_over",{
        "reason": reason,
        "leaderboard": leaderboard,
    }, room=pin)
    print(f"Game over in room {pin}. Reason: {reason}")
    
@sio.event
async def advance_level(sid, data):
    # 1. Extract the pin from the frontend data
    pin = str(data.get("pin"))
    room = active_rooms.get(pin)
    
    if not room:
        print(f"Advance stage failed: Room {pin} not found")
        return

    # 2. Check if the game is already over
    if room.current_stage >= 5:
        print(f"Room {pin} cleared all 5 stages!")
        # Ensure your end_game function is defined elsewhere
        await end_game(pin, reason="victory")
        return
    
    # 3. Increment the stage
    room.current_stage += 1
    player_count = len(room.players)
    
    # 4. Apply your HP scaling logic
    # HP increases based on player count and current stage multiplier
    room.shared_monster_max_hp = 50 * player_count * room.current_stage
    room.shared_monster_hp = room.shared_monster_max_hp
    
    # 5. This will now print to your terminal!
    print(f"Room {pin} advanced to Stage {room.current_stage}! New HP: {room.shared_monster_max_hp}")
    
    # 6. Tell everyone the stage has changed
    await sio.emit("stage_advanced", room.model_dump(), room=pin)
    
@sio.event
async def damage_monster(sid, data):
    pin = data.get("pin", "").upper()
    # Get the damage sent by the frontend (default to 10) s
    damage_dealt = data.get("damage", 10) 
    
    if pin not in active_rooms:
        return
    
    room = active_rooms[pin]
    
    # Only allow damage if the game is actually running
    if room.status == "playing" and room.shared_monster_hp > 0:
        room.shared_monster_hp = max(0, room.shared_monster_hp - damage_dealt)
        
        # Update individual player score if you're tracking it
        if sid in room.players:
            room.players[sid].score += damage_dealt

        # BROADCAST: Include the damage amount so the log can show it
        await sio.emit("monster_damaged", {
            "shared_monster_hp": room.shared_monster_hp,
            "player_id": sid,
            "damage": damage_dealt  # This is the "Important Note" part
        }, room=pin)



# testing aaaaa
active_rooms["1234"] = Room(
    pin="1234",
    time_limit_seconds=600,
    time_remaining=600,
    creator_session_id="SYSTEM",
    players={},
    status="lobby",
    shared_monster_hp=250,
    shared_monster_max_hp=250,
    current_stage=1
)

@sio.event
async def player_ready(sid, data):
    pin = str(data.get("pin"))
    is_ready = data.get("ready", False)
    
    if pin in active_rooms:
        room = active_rooms[pin]
        if sid in room.players:
            room.players[sid].is_ready = is_ready
            await sio.emit("lobby_updated", room.model_dump(), room=pin)
            
            # CHECK: Is everyone ready?
            all_ready = all(p.is_ready for p in room.players.values())
            
            # We only trigger the countdown if there is at least 1 player 
            # and everyone is ready
            if all_ready and len(room.players) > 0:
                await sio.emit("all_players_ready", {"pin": pin}, room=pin)

    if all_ready and len(room.players) > 0:
        # Instead of just saying "everyone is ready", 
        # call your existing start_game logic here!
        await start_game(sid, {"pin": pin})