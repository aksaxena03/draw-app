
import axios from 'axios';
import { getExitingShape } from "./http";

type Point = { x: number; y: number };

/**
 * Base interface for all shapes
 */
interface BaseShape {
    type: string;
}

/**
 * Rectangle shape with position and dimensions
 */
interface RectShape extends BaseShape {
    type: "rect";
    x: number;      // X coordinate of top-left corner
    y: number;      // Y coordinate of top-left corner
    width: number;  // Width of rectangle
    height: number; // Height of rectangle
}

/**
 * Freehand drawing shape made up of connected points
 */
interface PencilShape extends BaseShape {
    type: "pencil";
    points: Point[]; // Array of points making up the pencil stroke
}

/**
 * Circle shape with center point and radius
 */
interface CircleShape extends BaseShape {
    type: "circle";
    centerX: number;     // X coordinate of circle center
    centerY: number;     // Y coordinate of circle center
    radius: number;      // Radius of circle
    startAngle: number;  // Start angle in radians (usually 0)
    endingAngle: number; // End angle in radians (usually 2π)
}

/**
 * Text shape with position and content
 */
interface TextShape extends BaseShape {
    type: "text";
    x: number;     // X coordinate of text position
    y: number;     // Y coordinate of text position
    text: string;  // Text content
}

/**
 * Union type of all possible shapes
 */
type Shape = RectShape | PencilShape | CircleShape | TextShape;

 

/**
 * Main game class that handles the drawing canvas and all interactions
 */
export type DrawingStage = "pencil" | "rect" | "circle" | "text"|"";

export interface GameApi {
    undoLastShape: () => void;
    getShapeCount: () => number;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    updateStage: (stage: DrawingStage) => void;
    destroy: () => void;
}

export class Game {
    // Canvas elements
    private canvas: HTMLCanvasElement;         // The canvas element we draw on
    private ctx: CanvasRenderingContext2D;     // Canvas rendering context

    private token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    // Communication
    private socket: WebSocket | null;         // WebSocket connection for real-time updates
    private existingShape: Shape[] = [];       // All shapes that have been drawn
    private roomid: string;                    // Current room ID for collaboration
    private currentStage: DrawingStage;        // Current drawing stage
    

    // Drawing state
    private moving = false;                    // Whether we're currently drawing
    private startx = 0;                        // Starting X coordinate of current shape
    private starty = 0;                        // Starting Y coordinate of current shape
    private activeShape: Shape | null = null;  // Shape currently being drawn
    private currentPencil: Point[] | null = null; // Points for current pencil stroke

    // View transformation
    private scale = 1;                         // Current zoom level
    private offsetX = 0;                       // X offset for pan
    private offsetY = 0;                       // Y offset for pan
    private readonly minScale = 0.2;           // Minimum zoom level
    private readonly maxScale = 5;             // Maximum zoom level
    private readonly scaleStep = 0.1;          // How much to zoom per step

    // Pan state
    private isPanning = false;                 // Whether we're currently panning
    private panStartX = 0;                     // Starting X coordinate for pan
    private panStartY = 0;                     // Starting Y coordinate for pan
    private lastOffsetX = 0;                   // Last X offset from panning
    private lastOffsetY = 0;                   // Last Y offset from panning
    private spacePressed = false;              // Whether space key is pressed (for pan)

    /**
     * Initialize the drawing game
     * @param canvas - The canvas element to draw on
     * @param roomid - Unique identifier for the collaborative room
     */
    private constructor(canvas: HTMLCanvasElement, roomid: string, socket: WebSocket | null, initialStage: DrawingStage) {
        this.canvas = canvas;
        this.roomid = roomid;
        this.socket = socket;
        this.currentStage = initialStage;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        
        this.initHandlers();
        this.initMouseHandlers();
    }


    public destroy(){
        // Remove event listeners
        // window.removeEventListener('keydown', this.handleKeyDown);
        // window.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.removeEventListener('wheel', this.handleWheel.bind(this));

        // Do not close the shared WebSocket here; it's managed by the caller

        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    public static async create(canvas: HTMLCanvasElement, roomid: string, socket: WebSocket | null, initialStage: DrawingStage): Promise<GameApi> {
        const game = new Game(canvas, roomid, socket, initialStage);
        await game.init();
        
        return {
            undoLastShape: () => game.undo(),
            getShapeCount: () => game.getShapeCount(),
            zoomIn: () => game.zoomIn(),
            zoomOut: () => game.zoomOut(),
            resetView: () => game.resetView(),
            updateStage: (stage: DrawingStage) => game.setStage(stage),
            destroy: () => game.destroy()
        };
    }

    /**
     * Update the current drawing tool
     * @param stage - The new drawing tool to use
     */
    public setStage(stage: DrawingStage): void {
        this.currentStage = stage;
    }

    /**
     * Load existing shapes from the server and draw them
     */
    private async init(): Promise<void> {
        this.existingShape = await getExitingShape(this.roomid);
        this.drawExistingShapes();
    }

    
    private drawExistingShapes(): void {
        this.clearCanvas();
        // Draw each shape with current view transformations
        for (const shape of this.existingShape) {
            this.drawShape(shape);
        }
    }

    /**
     * Draw a single shape on the canvas
     * @param shape - The shape to draw
     */
    private drawShape(shape: Shape): void {
        // Save the current canvas state
        this.ctx.save();
        
        // Apply view transformations (zoom and pan)
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
        
        // Set drawing styles
        this.ctx.strokeStyle = "rgb(255,255,255)";
        this.ctx.fillStyle = "white";
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        switch (shape.type) {
            case "rect": {
                this.ctx.beginPath();
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                this.ctx.stroke();
                break;
            }
            case "pencil": {
                if (shape.points.length < 2) return;
                this.ctx.beginPath();
                this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                for (let i = 1; i < shape.points.length; i++) {
                    this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
                break;
            }
            case "circle": {
                this.ctx.beginPath();
                this.ctx.arc(
                    shape.centerX,
                    shape.centerY,
                    Math.abs(shape.radius),
                    shape.startAngle,
                    shape.endingAngle
                );
                this.ctx.stroke();
                this.ctx.closePath();
                break;
            }
            case "text": {
                this.ctx.font = "24px Arial";
                this.ctx.fillText(shape.text, shape.x, shape.y);
                break;
            }
        }
        this.ctx.restore();
       
    }

    /**
     * Clear the canvas and fill with background color
     */
    private clearCanvas(): void {
        this.ctx.save();
        // Reset any transformations to ensure we clear the entire canvas
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Fill with black background
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    /**
     * Initialize WebSocket and keyboard event handlers
     */
    private initHandlers(): void {
        
        if (this.socket) {
            this.socket.onmessage = (event: MessageEvent) => {
                const message = JSON.parse(event.data);
                if (message.type === "chat_shape") {
                    
                    const { shape } = JSON.parse(message.shape);
                    this.existingShape.push(shape);
                    this.drawExistingShapes();
                }
            };
        }

        // Handle spacebar for panning
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.spacePressed = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') this.spacePressed = false;
        });
    }

    

    /**
     * Initialize mouse event handlers for drawing and canvas manipulation
     */
    
    
    private initMouseHandlers(): void {
        // Bind event handlers to maintain correct 'this' context
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    }

    /**
     * Handle mouse down events for drawing and panning
     * @param e - Mouse event
     */
    private handleMouseDown(e: MouseEvent): void {
        // Check if we should start panning (space pressed)
        
        if (this.spacePressed) {
            this.isPanning = true;
            this.panStartX = e.clientX - this.lastOffsetX;
            this.panStartY = e.clientY - this.lastOffsetY;
            return;
        }

        // Start drawing
        this.moving = true;
        this.startx = e.clientX;
        this.starty = e.clientY;

        // Handle different drawing tools
        if (this.currentStage === "pencil") {
            // Start a new pencil stroke
            this.currentPencil = [{ x: this.startx, y: this.starty }];
        } else if (this.currentStage === "text") {
            // Handle text input
            const text = prompt("Enter text:") || "";
            if (text.trim() !== "") {
                const shape: TextShape = {
                    type: "text",
                    x: this.startx,
                    y: this.starty,
                    text
                };
                this.addShape(shape);
            }
            this.moving = false;
        }
         if (this.currentStage === "rect") {
            this.canvas.style.cursor = 'crosshair';
        }
        else if(this.currentStage === "pencil") {
            this.canvas.style.cursor = 'pointer';
           
        }
        else if (this.currentStage === "circle") {
            this.canvas.style.cursor = 'crosshair';
            
        }else if (this.currentStage === "text") {
            this.canvas.style.cursor = 'text';
            
        }
    }

    /**
     * Handle mouse move events for drawing and panning
     * @param e - Mouse event
     */
    private handleMouseMove(e: MouseEvent): void {
        // Handle panning
        if (this.isPanning) {
            this.offsetX = e.clientX - this.panStartX;
            this.offsetY = e.clientY - this.panStartY;
            this.lastOffsetX = this.offsetX;
            this.lastOffsetY = this.offsetY;
            this.drawExistingShapes();
            return;
        }
        // If we're not drawing, do nothing
        if (!this.moving) return;

        // Calculate dimensions for shapes
        const endX = e.clientX;
        const endY = e.clientY;
        const width = endX - this.startx;
        const height = endY - this.starty;

        this.drawExistingShapes();

        if (this.currentStage === "pencil" && this.currentPencil) {
            this.currentPencil.push({ x: endX, y: endY });
            this.drawShape({ type: "pencil", points: this.currentPencil });
        } else if (this.currentStage === "rect") {
            this.drawShape({
                type: "rect",
                x: this.startx,
                y: this.starty,
                width,
                height
            });
        } else if (this.currentStage === "circle") {
            const radius = Math.max(width, height) / 2;
            this.drawShape({
                type: "circle",
                centerX: this.startx + width / 2,
                centerY: this.starty + height / 2,
                radius,
                startAngle: 0,
                endingAngle: Math.PI * 2
            });
        }
        
    }

    /**
     * Handle mouse up events for completing drawings and panning
     * Creates and saves the final shape based on the current tool
     * @param e - Mouse event
     */
    private async handleMouseUp(e: MouseEvent): Promise<void> {
        // Handle end of panning
        if (this.isPanning) {
            this.isPanning = false;
            return;
        }

        // If we weren't drawing, do nothing
        if (!this.moving) return;
        this.moving = false;

        // Calculate final dimensions
        const width = e.clientX - this.startx;
        const height = e.clientY - this.starty;

        let shape: Shape | null = null;

        // Create the appropriate shape based on selected tool
        if (this.currentStage === "rect") {
            shape = {
                type: "rect",
                x: this.startx,
                y: this.starty,
                width,
                height
            };
        } else if (this.currentStage === "pencil" && this.currentPencil) {
            shape = {
                type: "pencil",
                points: this.currentPencil
            };
        } else if (this.currentStage === "circle") {
            shape = {
                type: "circle",
                radius: Math.max(width, height) / 2,
                centerX: this.startx + width / 2,
                centerY: this.starty + height / 2,
                startAngle: 0,
                endingAngle: Math.PI * 2
            };
        }
        // this.destroy()
        // Save the shape if one was created
        if (shape) {
            await this.addShape(shape);
            
        }
        // this.destroy()
        
        // Reset the current pencil stroke
        this.currentPencil = null;
        // this.destroy()
         
    }

    /**
     * Handle mouse wheel events for zooming
     * @param e - Wheel event
     */
    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        // Determine zoom direction based on wheel movement
        const delta = e.deltaY > 0 ? -this.scaleStep : this.scaleStep;
        const newScale = this.scale + delta;

        // Only zoom if within scale limits
        if (newScale >= this.minScale && newScale <= this.maxScale) {
            // Zoom to cursor
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left - this.offsetX) / this.scale;
            const mouseY = (e.clientY - rect.top - this.offsetY) / this.scale;

            this.scale = newScale;
            this.offsetX = e.clientX - rect.left - mouseX * this.scale;
            this.offsetY = e.clientY - rect.top - mouseY * this.scale;
            // this.destroy()
            this.drawExistingShapes();
        }
    }

    /**
     * Add a new shape and sync with other users
     * @param shape - The shape to add
     */
    private async addShape(shape: Shape): Promise<void> {
        // Add to local collection
        this.existingShape.push(shape);

        // Broadcast over WebSocket (only if open)
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: "chat_shape",
                shape: JSON.stringify({ shape }),
                roomid: this.roomid
            }));
        }

        // Persist to server
        const baseUrl = process.env.NEXT_PUBLIC_HTTP_BACKEND as string | undefined;
        if (!baseUrl || !this.token) return;

        let targetRoomId = this.roomid;
        if (!/^\d+$/.test(targetRoomId)) {
            try {
                const res = await axios.get(`${baseUrl}/room/${targetRoomId}`, {
                    headers: { authorization: this.token }
                });
                targetRoomId = String(res.data?.room?.id ?? targetRoomId);
            } catch {
                return;
            }
        }

        try {
            await axios.post(`${baseUrl}/room/shape/${targetRoomId}`,
                { shape },
                { headers: { authorization: this.token } }
            );
        } catch {
            // ignore persist error to avoid breaking UX
        }
    }

    /**
     * Remove the last drawn shape (undo)
     */
    public undo(): void {
        if (this.existingShape.length > 0) {
            this.existingShape.pop();
            this.drawExistingShapes();
        }
    }

    /**
     * Zoom in on the canvas, maintaining the center point
     */
    public zoomIn(): void {
        const rect = this.canvas.getBoundingClientRect();
        // Calculate center point in canvas coordinates
        const centerX = (rect.width / 2 - this.offsetX) / this.scale;
        const centerY = (rect.height / 2 - this.offsetY) / this.scale;
        
        // Calculate new scale
        const newScale = Math.min(this.maxScale, this.scale + this.scaleStep);

        // Adjust offset to keep center point fixed
        this.offsetX -= (centerX * newScale - centerX * this.scale);
        this.offsetY -= (centerY * newScale - centerY * this.scale);
        this.scale = newScale;

        this.drawExistingShapes();
    }

    /**
     * Zoom out on the canvas, maintaining the center point
     */
    public zoomOut(): void {
        const rect = this.canvas.getBoundingClientRect();
        // Calculate center point in canvas coordinates
        const centerX = (rect.width / 2 - this.offsetX) / this.scale;
        const centerY = (rect.height / 2 - this.offsetY) / this.scale;
        
        // Calculate new scale
        const newScale = Math.max(this.minScale, this.scale - this.scaleStep);

        // Adjust offset to keep center point fixed
        this.offsetX -= (centerX * newScale - centerX * this.scale);
        this.offsetY -= (centerY * newScale - centerY * this.scale);
        this.scale = newScale;

        this.drawExistingShapes();
    }

    /**
     * Reset the view to original position and scale
     */
    public resetView(): void {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.drawExistingShapes();
    }

    /**
     * Get the total number of shapes drawn
     * @returns Number of shapes
     */
    public getShapeCount(): number {
        return this.existingShape.length;
    }
}
