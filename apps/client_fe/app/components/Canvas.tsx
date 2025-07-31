"use client";
import { LucideCircle, LucideLetterText, LucidePencil, LucideRectangleHorizontal, LucideText, LucideTimerReset, LucideUndo, LucideZoomIn, LucideZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import initdraw from "../(dash)/draw";

export function Canvas({ roomid, socket }: { roomid: string; socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stage, setStage] = useState<"pencil" | "rect" | "circle" | "text">("pencil");
    const undoRef = useRef<(() => void) | null>(null);
    const getShapeCountRef = useRef<(() => number) | null>(null);
    const [shapeCount, setShapeCount] = useState(0);
    const [size,setSize]=useState({"width":0,"height":0})
    const zoomInRef = useRef<(() => void) | null>(null);
    const zoomOutRef = useRef<(() => void) | null>(null);
    const resetViewRef = useRef<(() => void) | null>(null);


    useEffect(() => {
        // Set initial size
        setSize({ width: window.innerWidth, height: window.innerHeight });
        // Handler for resize
        const handleResize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useEffect(() => {
        if (canvasRef.current) {
            initdraw(canvasRef.current, roomid, socket, stage).then((api) => {
                if (api && api.undoLastShape) {
                    undoRef.current = api.undoLastShape;
                }
                if (api && api.getShapeCount) {
                    getShapeCountRef.current = api.getShapeCount;
                    setShapeCount(api.getShapeCount());
                }
                if (api && api.zoomIn) {
                    zoomInRef.current = api.zoomIn;
                }
                if (api && api.zoomOut) {
                    zoomOutRef.current = api.zoomOut;
                }
                if (api && api.resetView) {
                    resetViewRef.current = api.resetView;
                }
            });
        }
    }, [canvasRef, stage, roomid, socket]);

    // Update shape count after undo
    const handleUndo = () => {
        if (undoRef.current) {
            undoRef.current();
            if (getShapeCountRef.current) {
                setShapeCount(getShapeCountRef.current());
            }
        }
    };

    // Keyboard shortcut: Ctrl+Z for undo
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                e.preventDefault();
                handleUndo();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="w-screen h-screen bg-black">
            <canvas className="bg-black z-0" ref={canvasRef} width={size.width} height={size.height}></canvas>
            <div className="top-0 flex flex-row w-screen items-center justify-center p-3 absolute z-10 text-red-50 ">
                <div className="flex justify-between w-max">
                    <button
                     className={`ml-3 ${stage === "pencil" ? "text-amber-600" : "text-amber-50"}`
                     } onClick={() => setStage("pencil")}> <LucidePencil /> </button>
                    <button
                     className={`ml-3 ${stage === "circle" ? "text-amber-600" : "text-amber-50"}`
                     } onClick={() => setStage("circle")}> <LucideCircle /> </button>
                    <button
                     className={`ml-3 ${stage === "rect" ? "text-amber-600" : "text-amber-50"}`} 
                     onClick={() => setStage("rect")}> <LucideRectangleHorizontal /> </button>
                    <button
                     className={`ml-3 ${stage === "text" ? "text-amber-600" : "text-amber-50"}`} 
                     onClick={() => setStage("text")}> <LucideLetterText/></button>
                    <button
                        onClick={handleUndo}
                        title="Undo (Ctrl+Z)"
                        disabled={shapeCount === 0}
                        className={shapeCount === 0 ? "opacity-50 cursor-not-allowed ml-3" : "ml-3"}
                    >
                        <LucideUndo />
                    </button>
                    <button
                        onClick={() => zoomInRef.current && zoomInRef.current()}
                        title="Zoom In"
                        className="ml-2 px-2 py-1 bg-gray-700 rounded text-white"
                    >
                        <LucideZoomIn/>
                    </button>
                    <button
                        onClick={() => zoomOutRef.current && zoomOutRef.current()}
                        title="Zoom Out"
                        className="ml-2 px-2 py-1 bg-gray-700 rounded text-white"
                    >
                        <LucideZoomOut/>

                    </button>
                    <button
                        onClick={() => resetViewRef.current && resetViewRef.current()}
                        title="Reset View"
                        className="ml-2 px-2 py-1 bg-gray-700 rounded text-white"
                    >
                        Reset View
                    </button>
                </div>
            </div>
        </div>
    );
}