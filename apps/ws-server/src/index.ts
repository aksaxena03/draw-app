import jwt from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import { prismaClient } from "@repo/db";
import { jwt_secret } from "@repo/backend-comman/config";
import http from "http";

const WS_PORT = Number(process.env.PORT || 8080);
const HEALTH_PORT = Number(process.env.HEALTH_PORT || 8081);

const wss = new WebSocketServer({ port: WS_PORT });

// Minimal health server
const healthServer = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("ok");
        return;
    }
    res.writeHead(404);
    res.end();
});
healthServer.listen(HEALTH_PORT, "0.0.0.0", () => {
});

interface User {
    userId: string;
    rooms: Set<string>;
    ws: WebSocket;
}

const users: Map<string, User> = new Map();

function checkUser(token: string): string | null {
    try {
        const decode = jwt.verify(token, jwt_secret) as { userid?: string };
        
        if (!decode || !decode.userid) {
            return null;
        }
        
        return decode.userid;
    } catch (e) {
        return null;
    }
}

function handleJoinRoom(user: User, roomId: string) {
    user.rooms.add(roomId);
    // console.log(`User ${user.userId} joined room ${roomId}. User rooms:`, Array.from(user.rooms));
}

function handleLeaveRoom(user: User, roomId: string) {
    user.rooms.delete(roomId);
}

async function handleChatShape(user: User, data: any) {
    const { roomid, shape } = data;
    // console.log(JSON.stringify(data))
    if (!roomid || !shape) return;
  
    // console.log("Broadcasting shape to users in room:", roomid, "Total users:", users.size);
    // Broadcast to users in the same room
    for (const otherUser of users.values()) {
        if (otherUser.ws.readyState === WebSocket.OPEN && otherUser.rooms.has(roomid)) {
            try {
              otherUser.ws.send(JSON.stringify({
                    type: "chat_shape",
                    userId: user.userId,
                    roomId: Number(roomid),
                    shape
                }));
                // console.log("Sent shape to user:", otherUser.userId);
            } catch(e) {
                console.error("Error sending shape:", e);
            }
        }
    }
      await prismaClient.shape.create({
        data: {
            userId: user.userId,
            roomId: Number(roomid),
            shape
        }
    });
    // return "success"
}

async function handleChat(user: User, data: any) {
    
    

    const { roomId, message } = data;
    console.log(roomId,message+"at chat handler")
    // if (!roomId || !message) return;
   console.log(JSON.stringify(data) +"at 95")
    // Broadcast to users in the same room
    for (const otherUser of users.values()) {
        console.log(otherUser+ user.userId)
        // if (otherUser.ws.readyState === WebSocket.OPEN && otherUser.rooms.has(roomId)) {
            try {
                otherUser.ws.send(JSON.stringify({
                    type: "chat",
                    userId: user.userId,
                    roomId: Number(roomId),
                    message
                }));
                console.log(otherUser.userId+ " at106")
            } catch(e) {
                console.error("Error sending chat at 109: ", e);
            }
        }
    
    let prchar=await prismaClient.chat.create({
        data: {
            userId: user.userId,
            roomId: Number(roomId),
            message
        }
    });
   console.log(prchar+"at 118")
}

wss.on('connection', function connection(ws, request) {
    const url = request.url;
    if (!url) {
        ws.close();
        return;
    }
    const queryString = url.includes('?') ? url.split('?')[1] : '';
    const queryParams = new URLSearchParams(queryString);
    const token = queryParams.get('token') || '';
    const userId = checkUser(token);
    if (!userId) {
        ws.close();
        return;
    }
    if (users.has(userId)) {
        try { users.get(userId)?.ws.close(); } catch {}
        users.delete(userId);
    }
    const user: User = { userId, rooms: new Set(), ws };
    users.set(userId, user);

    ws.on('message', async function message(data) {
        let parseData: any;
        try {
            parseData = typeof data === "string" ? JSON.parse(data) : JSON.parse(data.toString());
        } catch {
            return;
        }
        if (!parseData || !parseData.type) return;
        try {
            switch (parseData.type) {
                case "join_room":
                    if (parseData.roomId) handleJoinRoom(user, parseData.roomId);
                    break;
                case "leave_room":
                    if (parseData.roomId) handleLeaveRoom(user, parseData.roomId);
                    break;
                case "chat_shape":
                    await handleChatShape(user, parseData);
                    break;
                case "chat":
                    await handleChat(user, parseData);
                    
                    break;
                default:
                    break;
            }
        } catch {}
    });

    ws.on('close', () => {
        users.delete(userId);
    });
    ws.on('error', () => {
        users.delete(userId);
    });
});
