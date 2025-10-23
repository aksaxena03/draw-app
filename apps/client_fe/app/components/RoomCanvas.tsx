"use client";

import { useEffect, useState } from "react";
// import { WS_BACKEND } from "@/config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomid }: { roomid: string }) {
    const [token, setToken] = useState<string | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const tok = localStorage.getItem('token');
            setToken(tok);
        }
    }, []);

    useEffect(() => {
        if (!token || typeof window === 'undefined') return;
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_BACKEND}?token=${token}`);
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId: roomid
            }));
        };
        return () => {
            ws.close();
        };
    }, [token, roomid]);

    return <Canvas roomid={roomid} socket={socket} />;
}