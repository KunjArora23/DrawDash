/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


// 1️⃣ Create context
const WebSocketContext = createContext(null);

// 2️⃣ Provider
export const WebSocketProvider = ({ children }) => {

    // using refs as rerender hone pr useState ki values change ho jati h or vo hme ni chahiye websockets me

    const socketRef = useRef(null)
    const usernameRef = useRef(null)


    const navigate = useNavigate()
    const [roomId, setRoomId] = useState(null)
    const [username, setUsername] = useState("")

    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([]);
    const [usersData, setUsersData] = useState({})
    const [gameState, setGameState] = useState({
        status: "waiting",
        round: 1,
        maxRounds: 5,
        drawer: "",
        currentWord: "",
        isDrawer: false,
        timeLeft: 15,
        scores: {},
        endedAt: null,
    })


    const drawListeners = new Set();

    const registerDrawListeners = (fn) => {
        drawListeners.add(fn)
    }
    const unRegisterDrawListeners = (fn) => {
        drawListeners.delete(fn)
    }

    const connect = (roomId, username) => {
        // if any ws connection is already there then do not create new and return
        if (socketRef.current) return
        console.log("username in context:", username)
        usernameRef.current = username

        // storing in localstorage taki  refresh hone pr bhi username or roomId rhe or auto reconnect kr ske hm 
        localStorage.setItem("username", username)
        localStorage.setItem("roomId", roomId)


        const ws = new WebSocket(`ws://localhost:8000/api/v1/ws/${roomId}/${username}`);

        // ws.onopen = () => {
        //     ws.send(
        //         JSON.stringify({
        //             type: 'join',
        //             roomId,
        //             username
        //         })
        //     )
        // }


        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            // console.log("DATA RECEIVED FROM WEBSOCKET:", data)

            if (data.type == 'users') {
                setUsers(data.users)
            }
            if (data.type == "users_data") {
                setUsersData(data)
                setGameState((prev) => ({
                    ...prev,
                    scores: data.scores ?? prev.scores,
                }))
                // console.log("room data", data)
            }
            if (data.type === "group") {
                setMessages((prev) => [...prev, `${data.from}: ${data.message}`])
                console.log(messages)
            }

            if (data.type === "game_state") {
                setGameState((prev) => ({
                    ...prev,
                    status: data.status ?? "waiting",
                    round: data.round ?? 1,
                    maxRounds: data.max_rounds ?? prev.maxRounds ?? 5,
                    drawer: data.drawer ?? "",
                    currentWord: data.word ?? "",
                    isDrawer: Boolean(data.is_drawer),
                    timeLeft: data.time_left ?? prev.timeLeft ?? 15,
                    scores: data.scores ?? prev.scores,
                }))
            }

            if (data.type === "timer") {
                setGameState((prev) => ({
                    ...prev,
                    timeLeft: data.time_left ?? prev.timeLeft,
                }))
            }

            if (data.type === "scores") {
                setGameState((prev) => ({
                    ...prev,
                    scores: data.scores ?? prev.scores,
                }))
            }

            if (data.type === "game_over") {
                setGameState((prev) => ({
                    ...prev,
                    status: "ended",
                    currentWord: "",
                    timeLeft: 0,
                    scores: data.scores ?? prev.scores,
                    endedAt: Date.now(),
                }))
            }

            if (data.type === "game_error") {
                setMessages((prev) => [...prev, `System: ${data.message}`])
            }

            if (data.type === "error") {
                setMessages((prev) => [...prev, `System: ${data.message}`])
            }

            if (data.type === "draw") {
                drawListeners.forEach((fn) => fn(data))
            }

        }
        ws.onclose = () => {
            socketRef.current = null
            setUsers([])
            setMessages([])
            setGameState({
                status: "waiting",
                round: 1,
                maxRounds: 5,
                drawer: "",
                currentWord: "",
                isDrawer: false,
                timeLeft: 15,
                scores: {},
                endedAt: null,
            })
        }

        socketRef.current = ws

        setRoomId(roomId)
        setUsername(username)

    }

    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.close()
            socketRef.current = null
        }
    }

    const leaveRoom = () => {
        disconnect(roomId, username);
        setRoomId(null);
        setUsername("");
        setMessages([])
        setUsers([])
        localStorage.removeItem("username");
        localStorage.removeItem("roomId")
        setGameState({
            status: "waiting",
            round: 1,
            maxRounds: 5,
            drawer: "",
            currentWord: "",
            isDrawer: false,
            timeLeft: 15,
            scores: {},
            endedAt: null,
        })
        navigate("/create");
    }



    const sendChat = (message) => {
        if (!socketRef.current) return

        socketRef.current.send(
            JSON.stringify({
                type: "group",
                from: usernameRef.current,
                roomId,
                message
            })
        )


    }

    const sendCanvasData = (payload) => {
        if (!socketRef.current) return

        socketRef.current.send(JSON.stringify(payload))
    }

    const startGame = () => {
        if (!socketRef.current) return

        socketRef.current.send(
            JSON.stringify({
                type: "start_game",
            })
        )
    }

    useEffect(() => {
        // if (savedUsername && savedRoomId) {
        //     console.log("Auto reconnecting with:", savedUsername, savedRoomId)
        //     const res =  connect(savedRoomId, savedUsername)
        //     console.log(res)
        //     // if (res.success) {
        //     //     navigate("/room/savedRoomId")
        //     // }
        // }


    }, []);

    const value = {

        connect,
        disconnect,
        sendChat,
        roomId,
        users,
        messages,
        username,
        setUsername,
        leaveRoom,
        setMessages,
        sendCanvasData,
        registerDrawListeners,
        unRegisterDrawListeners,
        usersData,
        setUsersData,
        startGame,
        gameState,
        setGameState


    };



    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

// 3️⃣ Hook
export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
