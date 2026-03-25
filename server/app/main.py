from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from app.core.connection_Manager import ConnectionManager
from app.core.game_manager import GameManager
from app.core.room_manager import RoomManager
from fastapi.middleware.cors import CORSMiddleware
from app.models.CreateRoomModel import CreateRoomRequest


import json
import asyncio


def mask_word(word: str) -> str:
    return " ".join("_" for _ in word)


ROUND_DURATION_SECONDS = 15
room_timer_tasks: dict[str, asyncio.Task] = {}


async def cancel_room_timer(room_id: str):
    existing_task = room_timer_tasks.get(room_id)
    if existing_task and not existing_task.done():
        existing_task.cancel()
    room_timer_tasks.pop(room_id, None)


async def broadcast_turn_state(room_id: str, turn_result: dict):
    drawer = turn_result["drawer"]
    actual_word = turn_result["word"]
    hidden_word = mask_word(actual_word)

    await connection_manager.broadcast(
        room_id,
        {
            "type": "game_state",
            "status": "playing",
            "round": turn_result["round"],
            "max_rounds": turn_result["max_rounds"],
            "drawer": drawer,
            "word": hidden_word,
            "is_drawer": False,
            "time_left": ROUND_DURATION_SECONDS,
            "scores": turn_result.get("scores", {}),
        },
    )

    await connection_manager.send_to_username(
        room_id,
        drawer,
        {
            "type": "game_state",
            "status": "playing",
            "round": turn_result["round"],
            "max_rounds": turn_result["max_rounds"],
            "drawer": drawer,
            "word": actual_word,
            "is_drawer": True,
            "time_left": ROUND_DURATION_SECONDS,
            "scores": turn_result.get("scores", {}),
        },
    )


async def advance_turn(room_id: str):
    turn_result = game_manager.move_to_next_drawer(room_id)
    if not turn_result["success"]:
        await connection_manager.broadcast(
            room_id,
            {
                "type": "game_error",
                "message": turn_result.get("message", "Could not advance turn"),
            },
        )
        return

    if turn_result.get("game_over"):
        await connection_manager.broadcast(
            room_id,
            {
                "type": "game_over",
                "scores": turn_result.get("scores", {}),
            },
        )
        await cancel_room_timer(room_id)
        return

    await broadcast_turn_state(room_id, turn_result)
    room_timer_tasks[room_id] = asyncio.create_task(run_round_timer(room_id))


async def run_round_timer(room_id: str):
    try:
        for remaining in range(ROUND_DURATION_SECONDS, -1, -1):
            await connection_manager.broadcast(
                room_id,
                {
                    "type": "timer",
                    "time_left": remaining,
                },
            )
            await asyncio.sleep(1)

        room_timer_tasks.pop(room_id, None)
        await advance_turn(room_id)
    except asyncio.CancelledError:
        return


app = FastAPI()
origins = [
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # CRA (if ever)
    "https://your-vercel-app.vercel.app",  # later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 👈 allowed frontends
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Authorization, Content-Type, etc.
)

connection_manager = ConnectionManager()
room_manager = RoomManager()
game_manager = GameManager()


@app.post("/api/v1/create_room")
async def create_room(data: CreateRoomRequest):
    room_id = data.room_id
    creator = data.creator

    result = await room_manager.create_room(room_id, creator)
    print("Result of create Room", result)

    if not result["success"]:
        raise HTTPException(
            status_code=400, detail=result.get("message", "Room creation failed")
        )

    return result


@app.websocket("/api/v1/ws/{room_id}/{username}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, username: str):

    room = room_manager.rooms.get(room_id)

    if not room:
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": "Room does not exist"})
        await websocket.close()
        return

    result = await room_manager.add_user_to_room(room_id, username)

    if not result["success"]:
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": result["message"]})
        await websocket.close()
        return

    await connection_manager.connect(room_id, username, websocket)

    # ✅ Send initial state
    await connection_manager.broadcast(
        room_id,
        {
            "type": "users_data",
            "users": list(room["users"]),
            "admin": room["admin"],
            "scores": game_manager.games.get(room_id, {}).get("scores", {}),
        },
    )

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            msg_type = payload.get("type")

            if msg_type == "draw":
                await connection_manager.broadcast(room_id, payload)

            elif msg_type == "start_game":
                room = room_manager.rooms.get(room_id)

                if not room:
                    await connection_manager.send_to_username(
                        room_id,
                        username,
                        {
                            "type": "game_error",
                            "message": "Room does not exist",
                        },
                    )
                    continue

                if room_id not in game_manager.games:
                    create_result = game_manager.create_game(
                        room_id=room_id,
                        players=list(room["users"]),
                        owner=room["admin"],
                    )
                    if not create_result["success"]:
                        await connection_manager.send_to_username(
                            room_id,
                            username,
                            {
                                "type": "game_error",
                                "message": create_result["message"],
                            },
                        )
                        continue

                game = game_manager.games[room_id]
                game["players"] = list(room["users"])
                game["admin"] = room["admin"]

                for player in game["players"]:
                    game["scores"].setdefault(player, 0)

                start_result = game_manager.start_game(
                    room_id=room_id, requester=username
                )

                if not start_result["success"]:
                    await connection_manager.send_to_username(
                        room_id,
                        username,
                        {
                            "type": "game_error",
                            "message": start_result["message"],
                        },
                    )
                    continue

                if start_result.get("game_over"):
                    await connection_manager.broadcast(
                        room_id,
                        {
                            "type": "game_over",
                            "scores": start_result.get("scores", {}),
                        },
                    )
                    await cancel_room_timer(room_id)
                    continue

                await broadcast_turn_state(room_id, start_result)
                await cancel_room_timer(room_id)
                room_timer_tasks[room_id] = asyncio.create_task(
                    run_round_timer(room_id)
                )

            elif msg_type == "group":
                game = game_manager.games.get(room_id)
                guesser = payload.get("from")
                message_text = payload.get("message", "")

                if game and game.get("status") == "playing":
                    current_drawer = game_manager.get_current_drawer(room_id)
                    if current_drawer and guesser != current_drawer:
                        guess_result = game_manager.is_guess_correct(
                            room_id=room_id,
                            guessed_word=message_text,
                            guesser=guesser,
                        )

                        if guess_result.get("correct"):
                            await connection_manager.broadcast(
                                room_id,
                                {
                                    "type": "group",
                                    "from": "System",
                                    "message": f"{guesser} guessed the word correctly!",
                                },
                            )

                            await connection_manager.broadcast(
                                room_id,
                                {
                                    "type": "scores",
                                    "scores": game.get("scores", {}),
                                },
                            )

                            await cancel_room_timer(room_id)
                            await advance_turn(room_id)
                            continue

                await connection_manager.broadcast(
                    room_id,
                    {
                        "type": "group",
                        "from": payload["from"],
                        "message": payload["message"],
                    },
                )

    except WebSocketDisconnect:
        await connection_manager.disconnect(room_id, username)

        result = await room_manager.leave_room(room_id, username)

        room = room_manager.rooms.get(room_id)

        if room:
            await connection_manager.broadcast(
                room_id,
                {
                    "type": "users_data",
                    "users": list(room["users"]),
                    "admin": room["admin"],
                    "scores": game_manager.games.get(room_id, {}).get("scores", {}),
                },
            )
        else:
            await cancel_room_timer(room_id)
            game_manager.clear_game(room_id)
