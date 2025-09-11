import jwt from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import { prismaClient } from "@repo/db";
import { jwt_secret } from "@repo/backend-comman/config";
import http from "http";

const WS_PORT = Number(process.env.PORT || 8080);
const HEALTH_PORT = Number(process.env.HEALTH_PORT || 8081);

const wss = new WebSocketServer({ port: WS_PORT });
console.log(`| WebSocket listening at ${WS_PORT}`);

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
    console.log(`| Health endpoint on ${HEALTH_PORT}`);
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
}

function handleLeaveRoom(user: User, roomId: string) {
    user.rooms.delete(roomId);
}

async function handleChatShape(user: User, data: any) {
    const { roomid, shape } = data;
    console.log(data, roomid)
    if (!roomid || !shape) return;
    await prismaClient.shape.create({
        data: {
            userId: user.userId,
            roomId: Number(roomid),
            shape
        }
    });
    for (const otherUser of users.values()) {
            try {
                otherUser.ws.send(JSON.stringify({
                    type: "chat_shape",
                    userId: user.userId,
                    roomId: Number(roomid),
                    shape
                }));
            } catch(e) {console.log(e)}
        
    }
}

async function handleChat(user: User, data: any) {
    console.log(data)
    console.log("control here")

    const { roomId, message } = data;
    console.log(roomId,message)
    if (!roomId || !message) return;
    await prismaClient.chat.create({
        data: {
            userId: user.userId,
            roomId: Number(roomId),
            message
        }
    });
    for (const otherUser of users.values()) {
        console.log(message,users)
            try {
                otherUser.ws.send(JSON.stringify({
                    type: "chat",
                    userId: user.userId,
                    roomId: Number(roomId),
                    message
                }
            ));
            } catch(e) {console.log("error erroror"+e)}
    }
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
                    console.log('at chat handeler')
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
