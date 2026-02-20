from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from app.core.connection_Manager import ConnectionManager
from app.core.game_manager import GameManager
from app.core.room_manager import RoomManager
from fastapi.middleware.cors import CORSMiddleware
from app.models.CreateRoomModel import CreateRoomRequest


import json


def mask_word(word: str) -> str:
    return " ".join("_" for _ in word)


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
        },
    )

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            msg_type = payload.get("type")

            if msg_type == "group":
                await connection_manager.broadcast(
                    room_id,
                    {
                        "type": "group",
                        "from": payload["from"],
                        "message": payload["message"],
                    },
                )

            elif msg_type == "draw":
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

                start_result = game_manager.start_game(room_id=room_id, requester=username)

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

                current_round = game_manager.games[room_id]["round"]
                drawer = start_result["drawer"]
                actual_word = start_result["word"]
                hidden_word = mask_word(actual_word)

                await connection_manager.broadcast(
                    room_id,
                    {
                        "type": "game_state",
                        "status": "playing",
                        "round": current_round,
                        "drawer": drawer,
                        "word": hidden_word,
                        "is_drawer": False,
                    },
                )

                await connection_manager.send_to_username(
                    room_id,
                    drawer,
                    {
                        "type": "game_state",
                        "status": "playing",
                        "round": current_round,
                        "drawer": drawer,
                        "word": actual_word,
                        "is_drawer": True,
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
                },
            )
