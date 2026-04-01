import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useWebSocket } from "../../context/webSocketProvider";
import { useCanvasContext } from "../../context/canvasContext";

const CanvasBoard = () => {
    const canvasRef = useRef(null);     // canvas DOM
    const ctxRef = useRef(null);        // canvas drawing context
    const isDrawingRef = useRef(false);

    const toolRef = useRef(null)
    const colorRef = useRef("black")
    const strokeRef = useRef(2)

    const { roomId } = useParams()
    const { username, sendCanvasData, registerDrawListeners, unRegisterDrawListeners, gameState } = useWebSocket()
    const { tool, color, strokeWidth, clearTrigger } = useCanvasContext()

    // ye isliye kra bcoz state value update hone pr actual canva pr kuch reflect ni ho rha tha as draw wale functions ko ni pta ki state value updates hui
    useEffect(() => {
        toolRef.current = tool
        colorRef.current = color
        strokeRef.current = strokeWidth
    }, [tool, color, strokeWidth])


    // 🔹 Drawing start (mousedown)
    //   ye vo funtions hai jo local drawing ke funtions ko call krenge or server pr data bhejne wale functins ko call krenge
    const startDraw = (e) => {
        // Only allow drawing if current user is the drawer
        if (!gameState?.isDrawer) {
            console.log("Only the drawer can draw!")
            return
        }

        // console.log("draw wala colo", color)

        startDrawOnCanvas(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        // console.log("endnf")
        sendStartDrawEvent(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    };

    // 🔹 Drawing move (mousemove)
    const draw = (e) => {
        // Only allow drawing if current user is the drawer
        if (!gameState?.isDrawer) {
            return
        }

        drawingOnCanvas(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        sendDrawingEvent(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    };

    // 🔹 Drawing stop (mouseup / leave)

    const stopDraw = () => {
        // Only allow if current user is the drawer
        if (!gameState?.isDrawer) {
            return
        }

        stopDrawOnCanvas()
        // console.log("draeing stop")
        sendEndEvent()
    };

    const clearBoard = () => {
        // Only allow clearing if current user is the drawer
        if (!gameState?.isDrawer) {
            console.log("Only the drawer can clear the canvas!")
            return
        }

        clearCanvas()
        sendClearEvent()
    }


    //   Local Draw Event
    // ye locally canvas pr draw krenge coordinates lekr
    const startDrawOnCanvas = (x, y) => {
        // console.log("draw wala colo", color)
        const ctx = ctxRef.current
        if (!ctx) return

        ctx.lineWidth = strokeRef.current
        ctx.strokeStyle = colorRef.current

        // console.log("Tool ref value", toolRef.current)
        if (toolRef.current === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
        } else {
            ctx.globalCompositeOperation = "source-over";

        }
        isDrawingRef.current = true
        ctx.beginPath()
        ctx.moveTo(x, y)
    }
    const startDrawOnCanvasRemote = (x, y, color, strokeWidth, tool) => {

        const ctx = ctxRef.current
        if (!ctx) return

        ctx.lineWidth = strokeWidth
        ctx.strokeStyle = color

        // console.log("tool value in remote fun", tool)
        if (tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
        } else {
            ctx.globalCompositeOperation = "source-over";

        }
        isDrawingRef.current = true
        ctx.beginPath()
        ctx.moveTo(x, y)
    }
    const drawingOnCanvas = (x, y) => {
        const ctx = ctxRef.current
        if (!ctx || !isDrawingRef.current) return

        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const stopDrawOnCanvas = () => {
        const ctx = ctxRef.current
        if (!ctx) return

        isDrawingRef.current = false
        ctx.closePath()

        // jb hm end kr rhe h stroke eraser ka to tool ko resert kr dete h
        ctx.globalCompositeOperation = "source-out"

    }

    const clearCanvas = () => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };


    // Draw events jo sync krenge other users ke sath data of drawing send krke
    // ye functions server pr data send krenge taki other users ke me bhi same draw ho paye

    const handleRemoteDraw = (payload) => {
        if (payload.action === "start") {
            startDrawOnCanvasRemote(payload.x, payload.y, payload.newCol, payload.newStrokeWidth, payload.newTool)
        }
        else if (payload.action === "move") {
            drawingOnCanvas(payload.x, payload.y)
        }
        else if (payload.action === "end") {
            stopDrawOnCanvas()
        }
        else if (payload.action === "clear") {
            clearCanvas()
        }
    }


    // Sending events
    const sendStartDrawEvent = (x, y) => {
        const newCol = colorRef.current
        const newTool = toolRef.current
        const newStrokeWidth = strokeRef.current

        const payload = {
            type: 'draw',
            action: 'start',
            roomId,
            username,
            x,
            y,
            newCol,
            newTool,
            newStrokeWidth
        }
        sendCanvasData(payload)
    }

    const sendDrawingEvent = (x, y) => {
        if (!isDrawingRef.current) return
        const newCol = colorRef.current
        const newTool = toolRef.current
        const newStrokeWidth = strokeRef.current

        const payload = {
            type: 'draw',
            action: 'move',
            roomId,
            username,
            x,
            y,
            newCol,
            newTool,
            newStrokeWidth
        }
        sendCanvasData(payload)
    }

    const sendEndEvent = () => {
        const payload = {
            type: 'draw',
            action: 'end',
            roomId,
            username,
        }
        sendCanvasData(payload)
    }

    const sendClearEvent = () => {
        const payload = {
            type: 'draw',
            action: 'clear',
            roomId,
            username,
        }
        sendCanvasData(payload)
    }



    useEffect(() => {
        clearBoard()
    }, [clearTrigger])


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 🔹 Get context AFTER canvas mounts
        const ctx = canvas.getContext("2d");
        ctxRef.current = ctx;

        // 🔹 High DPI / Retina fix
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.scale(dpr, dpr);

        // 🔹 Default drawing config 
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        registerDrawListeners(handleRemoteDraw)

        // 🔹 Cleanup
        return () => {
            unRegisterDrawListeners(handleRemoteDraw)
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            className={`w-full h-full bg-white touch-none transition-all duration-300 ${
                gameState?.isDrawer 
                    ? 'cursor-crosshair' 
                    : 'cursor-not-allowed opacity-75'
            }`}
            style={{
                backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                pointerEvents: gameState?.isDrawer ? 'auto' : 'none'
            }}
        />
    );
};

export default CanvasBoard;