// import { process.env.NEXT_PUBLIC_HTTP_BACKEND } from "@/config"
import axios from "axios"

type Shape =
  | { type: "rect", x: number, y: number, width: number, height: number }
  | { type: "pencil", points: { x: number, y: number }[] }
  | { type: "circle", centerX: number, centerY: number, radius: number, startAngle: number, endingAngle: number }
  | { type: "text", x: number, y: number, text: string };

export default async function initdraw(canvas: HTMLCanvasElement, roomid: string, socket: WebSocket, typeStages: string) {
    const token = localStorage.getItem('token')
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    const minScale = 0.2;
    const maxScale = 5;
    const scaleStep = 0.1;
    const ctx = canvas.getContext("2d")
    const existingShape: Shape[] = await getExitingShape(roomid);
    console.log(existingShape)
    console.log(typeStages)
    if (!ctx) {
        return;
    }
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type == "chat_shape") {
            // clearCanvas(existingShape, canvas, ctx);
            const parsedShape = JSON.parse(message.shape)
            console.log(parsedShape)
            existingShape.push(parsedShape.shape)
            console.log(existingShape)
        }
    }
    //  ctx.fillStyle="rgb(0,0,0)"
    clearCanvas(existingShape, canvas, ctx);

    // Reset tool-specific state at the start
    let moving = false
    let startx = 0
    let starty = 0;
    let currentPencil: { x: number, y: number }[] | null = null;
    let currentText: { x: number, y: number, text: string } | null = null;
    // Removed unused variable currentShapeType
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let lastOffsetX = 0;
    let lastOffsetY = 0;
    let spacePressed = false;

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
        // Always reset tool-specific state on mousedown
        if (spacePressed && e.button === 0) {
            isPanning = true;
            panStartX = e.clientX;
            panStartY = e.clientY;
            lastOffsetX = offsetX;
            lastOffsetY = offsetY;
            canvas.style.cursor = 'grab';
            return;
        }
        moving = true;
        startx = e.clientX;
        starty = e.clientY;
        if (typeStages === "pencil") {
            currentPencil = [{ x: startx, y: starty }];
            // Removed unused variable currentShapeType
        } else {
            currentPencil = null;
            // Removed unused variable currentShapeType
        }
        if (typeStages === "text") {
            const x = startx;
            const y = starty;
            const text = prompt("Enter text:") || "";
            if (text.trim() !== "") {
                const shape: Shape = { type: "text", x, y, text };
                // existingShape.push(shape);
                socket.send(JSON.stringify({
                    type: "chat_shape",
                    shape: JSON.stringify({ shape }),
                    roomid
                }));
                axios.post(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/room/shape/${roomid}`,
                    { shape },
                    { headers: { authorization: token } }
                );
                // clearCanvas(existingShape, canvas, ctx!);0
            }
            moving = false;
            return;
        }
        // console.log(e.clientX);console.log(e.clientY)
    });
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
        if (isPanning) {
            offsetX = lastOffsetX + (e.clientX - panStartX);
            offsetY = lastOffsetY + (e.clientY - panStartY);
            clearCanvas(existingShape, canvas, ctx!);
            return;
        }
        if (!moving) return;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgb(255,255,255)';
        const width = e.clientX - startx;
        const height = e.clientY - starty;
        const endX = e.clientX;
        const endY = e.clientY;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        existingShape.forEach((shape) => {
            const args = getShapeArgs(shape);
            drawPreviewShape(ctx, shape.type, args[0], args[1], args[2], args[3], args[4], args[5], shape);
        });
        // Only update pencil if pencil is the active tool
        if (typeStages === "pencil" && currentPencil) {
            drawPreviewShape(ctx, "pencil", 0, 0, 0, 0, 0, 0, { type: "pencil", points: currentPencil });
            currentPencil.push({ x: endX, y: endY });
        } else if (typeStages !== "pencil") {
            drawPreviewShape(ctx, typeStages, startx, starty, endX, endY, width, height);
        }
    });
    canvas.addEventListener('mouseup', async function (e: MouseEvent) {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = '';
            return;
        }
        moving = false;
        const width = e.clientX - startx;
        const height = e.clientY - starty;
        let shape: Shape | null = null
        if (typeStages === "rect") {
            shape = ({
                type: typeStages,
                x: startx,
                y: starty,
                width,
                height
            });
        }
        else if(typeStages === "pencil") {
            shape = ({
                type: typeStages,
                points: currentPencil || [],
            });
        }
        else if (typeStages === "circle") {
            shape = ({
                type: typeStages,
                radius: Math.max(width, height) / 2,
                centerX: startx + width / 2,
                centerY: starty + height / 2,
                startAngle: 0,
                endingAngle: Math.PI * 2,
            });
        }
        if (!shape) { 
            // Always clear tool-specific state on mouseup
            currentPencil = null;
            return 
        }
        existingShape.push(shape)
        socket.send(JSON.stringify({
            type: "chat_shape",
            shape: JSON.stringify({
                shape
            }),
            roomid
        }))
        // console.log(
        //     JSON.stringify({
        //         type: "chat_shape",
        //         shape: JSON.stringify({
        //             shape
        //         }),
        //         roomid
        //     })
        // )
        await axios.post(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/room/shape/${roomid}`, {
            shape
        },
            {
                headers: {
                    authorization: token
                }
            }
        );
        // Always clear tool-specific state on mouseup
        currentPencil = null;
    });

    // // Handle zoom with mouse wheel
    // canvas.addEventListener('wheel', (e: WheelEvent) => {
    //     e.preventDefault();
    //     const rect = canvas.getBoundingClientRect();
    //     const mouseX = (e.clientX - rect.left - offsetX) / scale;
    //     const mouseY = (e.clientY - rect.top - offsetY) / scale;
    //     let newScale = scale;
    //     if (e.deltaY < 0) {
    //         // Zoom in
    //         newScale = Math.min(maxScale, scale + scaleStep);
    //     } else {
    //         // Zoom out
    //         newScale = Math.max(minScale, scale - scaleStep);
    //     }
    //     // Adjust offset so the mouse point stays in the same place
    //     offsetX -= (mouseX * newScale - mouseX * scale);
    //     offsetY -= (mouseY * newScale - mouseY * scale);
    //     scale = newScale;
    //     clearCanvas(existingShape, canvas, ctx!);
    // }, { passive: false });

    // // Listen for spacebar to enable panning
    // window.addEventListener('keydown', (e) => {
    //     if (e.code === 'Space') {
    //         spacePressed = true;
    //     }
    // });
    // window.addEventListener('keyup', (e) => {
    //     if (e.code === 'Space') {
    //         spacePressed = false;
    //     }
    // });

    // Helper to extract arguments for drawPreviewShape from a shape object
    function getShapeArgs(shape: Shape) {
        switch (shape.type) {
            case "rect":
                return [shape.x, shape.y, shape.x + shape.width, shape.y + shape.height, shape.width, shape.height];
            case "pencil":
                return [0, 0, 0, 0, 0, 0];
            case "circle":
                return [shape.centerX - shape.radius, shape.centerY - shape.radius, shape.centerX + shape.radius, shape.centerY + shape.radius, shape.radius * 2, shape.radius * 2];
            case "text":
                return [shape.x, shape.y, 0, 0, 0, 0]; // Only numbers
            default:
                return [0, 0, 0, 0, 0, 0];
        }
    }
    function drawPreviewShape(
        ctx: CanvasRenderingContext2D,
        type: string,
        startx: number,
        starty: number,
        endX: number,
        endY: number,
        width: number,
        height: number,
        shapeObj?: Shape
    ) {
        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        switch (type) {
            case "rect":
                ctx.strokeRect(startx, starty, width, height);
                break;
            case "pencil":
                ctx.beginPath();
                if (shapeObj && shapeObj.type === "pencil" && shapeObj.points) {
                    const points = shapeObj.points;
                    if (points.length > 0) {
                        ctx.moveTo(points[0].x, points[0].y);
                        for (let i = 1; i < points.length; i++) {
                            ctx.lineTo(points[i].x, points[i].y);
                        }
                        ctx.stroke();
                    }
                }
                ctx.closePath();
                break;
            case "circle":
                const centerX = startx + width / 2;
                const centerY = starty + height / 2;
                const radius = Math.max(width, height) / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
                break;
            case "text":
                if (shapeObj && shapeObj.type === "text") {
                    ctx.font = "24px Arial";
                    ctx.fillStyle = "white";
                    ctx.fillText(shapeObj.text, Number(shapeObj.x), Number(shapeObj.y));
                }
                break;
            default:
                break;
        }
        ctx.restore();
    }
    function clearCanvas(existingShape: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
        existingShape.forEach((shape) => {
            switch (shape.type) {
                case "rect":
                    ctx.strokeStyle = "rgb(255,255,255)";
                    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                    break;
                case "pencil":
                    ctx.beginPath();
                    const points = shape.points || [];
                    if (points.length > 0) {
                        ctx.moveTo(points[0].x, points[0].y);
                        for (let i = 1; i < points.length; i++) {
                            ctx.lineTo(points[i].x, points[i].y);
                        }
                        ctx.stroke();
                    }
                    ctx.closePath();
                    break;
                case "circle":
                    ctx.beginPath();
                    ctx.arc(
                        shape.centerX,
                        shape.centerY,
                        Math.abs(shape.radius),
                        shape.startAngle,
                        shape.endingAngle
                    );
                    ctx.stroke();
                    ctx.closePath();
                    break;
                case "text":
                    ctx.font = "24px Arial";
                    ctx.fillStyle = "white";
                    ctx.fillText(shape.text, Number(shape.x), Number(shape.y));
                    break;
                default:
                    // Optionally handle unknown shape types
                    break;
            }
        });
        ctx.restore();
        console.log(existingShape)
    }
    async function getExitingShape(roomid: string) {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/room/getshape/${roomid}`)
        const GetShapes = res.data.shape;
        const shapes = GetShapes.map((x: { shape: string }) => {
            const shapeData = JSON.parse(x.shape)
            // console.log(shapeData)
            return shapeData;
        })
        return shapes;
    }

    // Undo function: removes last shape and redraws
    function undoLastShape() {
        if (existingShape.length > 0) {
            existingShape.pop();
            clearCanvas(existingShape, canvas, ctx!);
            // Optionally, notify backend or other clients here
        }
    }

    // Get the current shape count
    function getShapeCount() {
        return existingShape.length;
    }

    // Expose zoom in/out for external use
    function zoomIn() {
        // Zoom to center
        const rect = canvas.getBoundingClientRect();
        const centerX = (rect.width / 2 - offsetX) / scale;
        const centerY = (rect.height / 2 - offsetY) / scale;
        let newScale = Math.min(maxScale, scale + scaleStep);
        offsetX -= (centerX * newScale - centerX * scale);
        offsetY -= (centerY * newScale - centerY * scale);
        scale = newScale;
        clearCanvas(existingShape, canvas, ctx!);
    }
    function zoomOut() {
        // Zoom to center
        const rect = canvas.getBoundingClientRect();
        const centerX = (rect.width / 2 - offsetX) / scale;
        const centerY = (rect.height / 2 - offsetY) / scale;
        let newScale = Math.max(minScale, scale - scaleStep);
        offsetX -= (centerX * newScale - centerX * scale);
        offsetY -= (centerY * newScale - centerY * scale);
        scale = newScale;
        clearCanvas(existingShape, canvas, ctx!);
    }

    function resetView() {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        clearCanvas(existingShape, canvas, ctx!);
    }

    // Return undo function and shape count getter for external use
    return { undoLastShape, getShapeCount, zoomIn, zoomOut, resetView };
}