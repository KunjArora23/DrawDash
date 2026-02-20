from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        # roomId -> { username -> WebSocket }
        self.rooms: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, room_id: str, username: str, websocket: WebSocket):
        await websocket.accept()

        # socket bucket only (NOT room creation logic)
        self.rooms.setdefault(room_id, {})
        self.rooms[room_id][username] = websocket

        print(f"CONNECTED {username} to room {room_id}")
        await self.send_users(room_id)

    async def disconnect(self, room_id: str, username: str):
        room = self.rooms.get(room_id)
        if not room:
            return

        room.pop(username, None)

        # cleanup empty socket room
        if not room:
            self.rooms.pop(room_id)

    async def broadcast(self, room_id: str, payload: dict):
        room = self.rooms.get(room_id, {})
        for ws in room.values():
            await ws.send_json(payload)

    async def send_to_username(self, room_id: str, username: str, payload: dict):
        ws = self.rooms.get(room_id, {}).get(username)
        if ws:
            await ws.send_json(payload)

    async def send_users(self, room_id: str):
        users = list(self.rooms.get(room_id, {}).keys())
        payload = {
            "success":True,
            "type": "users",
            "users": users,
        }

        for ws in self.rooms.get(room_id, {}).values():
            await ws.send_json(payload)