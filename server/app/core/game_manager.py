from typing import Dict, List
from time import time
import random


class GameManager:
    def __init__(self):
        # room_id -> game data
        self.games: Dict[str, Dict] = {}

    def create_game(self, room_id: str, players: List[str], owner: str) -> Dict:
        if room_id in self.games:
            return {"success": False, "message": "Game already exists"}

        self.games[room_id] = {
            "status": "waiting",
            "admin": owner,
            "players": players.copy(),
            "scores": {player: 0 for player in players},
            "round": 1,
            "current_word": None,
            "used_words": set(),  # it will prevent duplicates
            "drawing_idx": 0,
            "max_rounds": 5,
            "round_started_at": None,
        }

        return {"success": True,"message":"Game created successfully"}

    def _pick_random_word(self, used_words: set) -> str | None:
        WORD_LIST = [
            "apple",
            "car",
            "house",
            "dog",
            "cat",
            "phone",
            "laptop",
            "tree",
            "river",
            "mountain",
            "football",
            "pizza",
        ]

        available = list(set(WORD_LIST) - used_words)
        if not available:
            return None

        return random.choice(available)

    def start_game(self, room_id: str, requester: str) -> Dict:
        game = self.games.get(room_id)
        if not game:
            return {"success": False, "message": "Game not found"}

        if requester != game["admin"]:
            return {"success": False, "message": "Only admin can start game"}

        word = self._pick_random_word(game["used_words"])
        if not word:
            return {"success": False, "message": "No words left"}

        game["status"] = "playing"
        game["current_word"] = word
        game["used_words"].add(word)
        game["round_started_at"] = time()

        drawer = game["players"][game["drawing_idx"]]

        return {
            "success": True,
            "drawer": drawer,
            "word": word,  # send ONLY to drawer 
        }

    def is_guess_correct(self, room_id: str, guessed_word: str, guesser: str) -> Dict:
        game = self.games.get(room_id)
        if not game:
            return {"success": False, "message": "Game not found"}

        if guessed_word.lower() == game["current_word"]:
            game["scores"][guesser] += 10
            return {"success": True, "correct": True}

        return {"success": True, "correct": False}

    def move_to_next_drawer(self, room_id: str) -> Dict:
        game = self.games.get(room_id)
        if not game:
            return {"success": False, "message": "Game not found"}

        game["drawing_idx"] += 1

        if game["drawing_idx"] >= len(game["players"]):
            game["drawing_idx"] = 0
            return self._next_round(room_id)

        return {
            "success": True,
            "new_drawer": game["players"][game["drawing_idx"]],
        }

    def next_round(self, room_id: str) -> Dict:
        game = self.games[room_id]

        if game["round"] >= game["max_rounds"]:
            game["status"] = "ended"
            return {
                "success": True,
                "game_over": True,
                "scores": game["scores"],
            }

        game["round"] += 1
        return {"success": True, "round": game["round"]}
