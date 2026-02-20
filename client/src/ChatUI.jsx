import { useEffect, useRef, useState } from "react";

function ChatUI({ username }) {
    const socketRef = useRef(null);
    const [message, setMessage] = useState("");
    const [toUser, setToUser] = useState("");
    const [messages, setMessages] = useState([]);


    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/${username}`)
        // current socket ka reference le rhe h

        socketRef.current = socket;


        socket.onopen = () => {
            console.log("Websocket connected", username)
        }

        socket.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data])
        }

        socket.onclose = () => {
            console.log("websocket disconnected", username)
        }

        return () => {
            socket.close()
        }
    }, [])

    const handleBroadcast = () => {
        // TEMP: simulate receiving your own message

        if (!socketRef.current) return

        socketRef.current.send(JSON.stringify({
            type: "broadcast",
            from: username,
            message: message
        }))

        setMessages((prev) => [
            ...prev,
            `${username} (broadcast): ${message}`,
        ]);
        setMessage("");
    };

    const handleDirect = () => {
        // TEMP: simulate direct message

        if (!socketRef.current || !toUser) return

        socketRef.current.send(JSON.stringify({
            type: "direct",
            to: toUser,
            from: username,
            message: message
        }))
        setMessages((prev) => [
            ...prev,
            `${username} → ${toUser}: ${message}`,
        ]);
        setMessage("");
    };

    return (
        <div style={{ border: "1px solid #333", padding: 12, width: 300 }}>
            <h3>User: {username}</h3>

            <input
                type="text"
                placeholder="Type message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: "100%", marginBottom: 8 }}
            />

            <input
                type="text"
                placeholder="Send to (username)"
                value={toUser}
                onChange={(e) => setToUser(e.target.value)}
                style={{ width: "100%", marginBottom: 8 }}
            />

            <div style={{ marginBottom: 10 }}>
                <button onClick={handleBroadcast}>Broadcast</button>
                <button onClick={handleDirect} style={{ marginLeft: 8 }}>
                    Direct
                </button>
            </div>

            <ul style={{ minHeight: 100, borderTop: "1px solid #aaa" }}>
                {messages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                ))}
            </ul>
        </div>
    );
}

export default ChatUI;
