/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState } from "react";


const CanvasContext = createContext(null)

export const CanvasContextProvider = ({ children }) => {
    const [tool, setTool] = useState("pen")
    const [color, setColor] = useState("black")

    const [strokeWidth, setStrokeWidth] = useState(2);

    const [clearTrigger, setClearTrigger] = useState(0);

    const clearCanvas = () => {
        setClearTrigger(prev => prev + 1);
    };






    const value = {
        tool,
        setTool,
        color,
        setColor, strokeWidth, setStrokeWidth,
        clearTrigger, setClearTrigger,clearCanvas
    }

    

    return (
        <CanvasContext.Provider value={value}>
            {children}
        </CanvasContext.Provider>
    )
}


export const useCanvasContext = () => {
    return useContext(CanvasContext)
}