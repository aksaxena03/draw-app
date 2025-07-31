"use client";

import { useEffect, useState } from "react";
import { WS_BACKEND } from "@/config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomid }: { roomid: string }) {
    const [token, setToken] = useState<string | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const tok = localStorage.getItem('token');
        setToken(tok);
    }, []);

    useEffect(() => {
        if (!token) return;
        const ws = new WebSocket(`${WS_BACKEND}?token=${token}`);
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomid
            }));
        };
        return () => {
            ws.close();
        };
    }, [token, roomid]);

    if (!socket) {
        return <div className="">...loading</div>;
    }
    return <Canvas roomid={roomid} socket={socket} />;
}