from typing import Dict, Set
import time


class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, Dict] = {}

    async def create_room(self, room_id: str, creator: str):

        print("Room Id in create room ", room_id)
        print(" creator in create room ", creator)
        if room_id in self.rooms:
            return {"success": False, "message": "Room already exists"}

        self.rooms[room_id] = {
            "users": set([]),  # no duplicates
            "admin": creator,
            "room_id": room_id,
            "max_users": 4,
            "created_at": time.time(),
        }
        room = self.rooms[room_id]
        return {
            "success": True,
            "room": {
                # ** unpacks the dict or users wala override kr rhe as we can't return directly set
                **room,
                "users": list(room["users"]),
            },
            "message": "Room created successfully",
        }

    async def add_user_to_room(self, room_id: str, username: str):
        room = self.rooms.get(room_id)
        if not room:
            return {"success": False, "message": "Room does not exist"}

        if username in room["users"]:
            return {"success": False, "message": "User already exists"}

        if len(room["users"]) >= room["max_users"]:
            return {"success": False, "message": "Room already full"}

        room["users"].add(username)
        return {"success": True, "room": room}

    # ✅ USER leaves by own choice
    async def leave_room(self, room_id: str, username: str):
        room = self.rooms.get(room_id)

        if not room:
            return {"success": False, "message": "Room does not exist"}

        if username not in room["users"]:
            return {"success": False, "message": "User not in room"}

        # Remove user first
        room["users"].remove(username)

        # If no users left → delete room completely
        if not room["users"]:
            del self.rooms[room_id]
            return {"success": True, "room_deleted": True}

        # If admin left → assign new admin
        if room["admin"] == username:
            room["admin"] = next(iter(room["users"]))

        return {"success": True, "new_admin": room["admin"]}

    # ✅ ADMIN removes someone
    async def remove_user(self, room_id: str, username: str, requester: str):
        room = self.rooms.get(room_id)
        if not room:
            return {"success": False, "message": "Room does not exist"}

        if room["admin"] != requester:
            return {"success": False, "message": "Only admin can remove users"}

        if username not in room["users"]:
            return {"success": False, "message": "User not in room"}

        room["users"].remove(username)

        if not room["users"]:
            del self.rooms[room_id]

        return {"success": True}

    async def get_all_users(self, room_id: str):
        room = self.rooms.get(room_id)
        if not room:
            return {"success": False, "users": []}

        return {"success": True, "users": list(room["users"])}
