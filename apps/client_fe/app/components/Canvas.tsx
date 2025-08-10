"use client";
import { LucideCircle, LucideLetterText, LucideMinus, LucidePencil, LucidePlus, LucideRectangleHorizontal, LucideUndo, LucideZoomIn, LucideZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Game, DrawingStage, GameApi } from "../(dash)/draw/Game";
import Chatbox from "./Chatbox";
import ChatButton from "./ChatButton";

export function Canvas({ roomid, socket }: { roomid: string; socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stage, setStage] = useState<DrawingStage>("");
    const undoRef = useRef<(() => void) | null>(null);
    const getShapeCountRef = useRef<(() => number) | null>(null);
    const [shapeCount, setShapeCount] = useState(0);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const zoomInRef = useRef<(() => void) | null>(null);
    const zoomOutRef = useRef<(() => void) | null>(null);
    const resetViewRef = useRef<(() => void) | null>(null);
    const [logos,setlogos]=useState(true)

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
    const apiRef = useRef<GameApi | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            let api: GameApi | null = null;
            
            Game.create(canvasRef.current, roomid, socket, stage).then((gameApi) => {
                api = gameApi;
                apiRef.current = gameApi;
                undoRef.current = gameApi.undoLastShape;
                getShapeCountRef.current = gameApi.getShapeCount;
                setShapeCount(gameApi.getShapeCount());
                zoomInRef.current = gameApi.zoomIn;
                zoomOutRef.current = gameApi.zoomOut;
                resetViewRef.current = gameApi.resetView;
            });
        }
    }, [canvasRef, roomid, socket]);

    // Update stage when it changes
    useEffect(() => {
        if (apiRef.current?.updateStage) {
            apiRef.current.updateStage(stage);
        }
    }, [stage]);

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
        <div onClick={()=>{setlogos(false)}} className="w-screen h-screen bg-black">
            <canvas className="bg-black z-0" ref={canvasRef} width={size.width} height={size.height}></canvas>
            <div  className=" top-3.5 w-screen flex flex-row items-center justify-center absolute z-10">
                <div className="flex justify-between  bg-gray-700 rounded-md p-1">
                    <button
                     className={`cursor-pointer p-1 rounded-md hover:text-white hover:bg-indigo-300 text-gray-400  px-3 ${stage === "pencil" ? "text-white bg-indigo-300 opacity-100" : "opacity-50"}`
                        }   title="Pencil"
                       onClick={() => setStage("pencil")}> <LucidePencil size={18} /> </button>
                    <button
                     className={`ml-3 cursor-pointer p-1 rounded-md hover:text-white hover:bg-indigo-300 text-gray-400  px-3 ${stage === "circle" ? "text-white  bg-indigo-300 opacity-100" : "opacity-50"}`
                        }   title="Circle"
                       onClick={() => setStage("circle")}> <LucideCircle  size={18}/> </button>
                    <button
                     className={`ml-3 cursor-pointer p-1 rounded-md hover:text-white hover:bg-indigo-300 text-gray-400  px-3 ${stage === "rect" ? "text-white  bg-indigo-300 opacity-100" : "opacity-50"}`} 
                        title="Rectangle"
                      onClick={() => setStage("rect")}> <LucideRectangleHorizontal  size={18}/> </button>
                    <button
                     className={`ml-3 cursor-pointer p-1 rounded-md hover:text-white hover:bg-indigo-300 text-gray-400  px-3 ${stage === "text" ? "text-white  bg-indigo-300 opacity-100" : "opacity-50"}`} 
                        title="Text"
                      onClick={() => setStage("text")}> <LucideLetterText size={18}/></button>
                    
                </div>
            </div>
            <div className="bottom-3.5 left-3.5 flex  justify-between absolute">
               <div className="flex flex-row justify-center bg-gray-700 rounded-md">
                 
                    <button
                        onClick={() => zoomInRef.current && zoomInRef.current()}
                        title="Zoom In"
                        className="cursor-pointer hover:text-white px-2 py-1  rounded text-gray-400"
                    >
                        <LucidePlus size={18}/>
                    </button>
                    <button
                        onClick={() => resetViewRef.current && resetViewRef.current()}
                        title="Reset View"
                        className="cursor-pointer hover:text-white px-2 py-1  rounded text-gray-400"
                    >
                        Reset View
                    </button>
                    <button
                        onClick={() => zoomOutRef.current && zoomOutRef.current()}
                        title="Zoom Out"
                        className="cursor-pointer hover:text-white px-2 py-1  rounded text-gray-400"
                    >
                        <LucideMinus size={18}/>

                    </button>
               </div>
               <div className="flex flex-row ml-2  px-2  hover:text-white text-gray-400 justify-center bg-gray-700 rounded-md p-1 ">
                <button
                        onClick={handleUndo}
                        title="Undo (Ctrl+Z)"
                        disabled={shapeCount === 0}
                        className={shapeCount === 0 ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        <LucideUndo  size={18}/>
                    </button>
               </div>
                    
            </div>
            <div onClick={()=>{setlogos(false)}} className={`flex top-10  w-screen h-[60%]  items-center justify-center absolute`}>
                <div className={`bg-[url('/picsvg_download.svg')]  flex  bg-cover bg-center absolute z-20 ${logos?'w-[80%] h-[100%] ':`w-[0%] h-[0%] `}`}>
                </div>
            </div>
           <div className="">
            <ChatButton roomId={roomid}/>
           </div>

        </div>
    );
}