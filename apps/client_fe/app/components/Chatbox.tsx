"use client";
import { useEffect, useRef, useState } from "react";
import { LucideSend } from "lucide-react";
import axios from "axios";

type Chat = { userId: string; message: string; name?: string };

export default function Chatbox({
  token,
  userId,
  roomId,
}: {
  token: string | null;
  userId: string | null;
  roomId: string;
}) {
  const [roomid, setRoomid] = useState<string>("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState("");
  const [userMap, setUserMap] = useState<{ [userId: string]: string }>({});
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
   if(!roomId)(setRoomid(""))
   
   
    setRoomid(roomId);
  }, [roomId]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!roomid) return;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_HTTP_BACKEND}/chat/${roomid}`
        );
        const data = response.data;

        const uniqueUserIds = Array.from(
          new Set(data.data.map((msg: { userId: string }) => msg.userId))
        );

        await Promise.all(
          uniqueUserIds.map(async (uid) => {
            const userIdStr = String(uid);
            if (!userMap[userIdStr]) {
              try {
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_HTTP_BACKEND}/api/v1/user/${userIdStr}`
                );
                const rm = await res.json();
                if (rm.username) {
                  setUserMap((prev) => ({
                    ...prev,
                    [userIdStr]: rm.username,
                  }));
                }
              } catch (err) {
                console.error("Failed to fetch user:", err);
              }
            }
          })
        );

        setChats(
          data.data.map((msg: { userId: string; message: string }) => ({
            userId: msg.userId,
            message: msg.message,
            name: userMap[msg.userId],
          }))
        );
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    fetchChats();
  }, [roomid]);

  useEffect(() => {
    if (!token) return;
    ws.current = new WebSocket(`ws://localhost:8080?token=${token}`);
    ws.current.onopen = () => {
      if (roomid) {
        ws.current?.send(
          JSON.stringify({ type: "join_room", roomId: String(roomid) })
        );
      }
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat" && String(data.roomId) === String(roomid)) {
        if (!userMap[data.userId]) {
          fetch(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/api/v1/user/${data.userId}`)
            .then((res) => res.json())
            .then((resData) => {
              if (resData.username) {
                setUserMap((prev) => ({
                  ...prev,
                  [data.userId]: resData.username,
                }));
              }
            });
        }
        setChats((prev) => [
          ...prev,
          {
            userId: data.userId,
            message: data.message,
            name: userMap[data.userId],
          },
        ]);
      }
    };
    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };
    return () => {
      ws.current?.close();
    };
  }, [token, roomid]);

  useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && roomid) {
      ws.current.send(
        JSON.stringify({ type: "join_room", roomId: String(roomid) })
      );
      setChats([]);
    }
  }, [roomid]);

  const sendMessage = () => {
    if (!message.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN)
      return;
    ws.current.send(
      JSON.stringify({
        type: "chat",
        roomId: String(roomid),
        message,
        userId,
      })
    );
    setMessage("");
  };

  return (
    <div className="max-w-lg absolute right-4 bottom-4 rounded-3xl shadow-xl border border-gray-700 bg-[#2f2f2f] flex flex-col h-[28rem] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-1.5 flex items-center border-b border-gray-600 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white rounded-t-3xl">
        
        <span className="font-semibold">Room:</span>
        <input
          value={roomid?roomid:""}
          onChange={(e) => setRoomid(e.target.value)}
          placeholder="Enter room ID..."
          className="ml-3 flex-1 rounded-lg px-3 py-1 bg-white/80 text-gray-900 outline-none placeholder-gray-500 focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 text-white">
        {!chats?"weak connection":""}
        {chats.map((chat, idx) =>
          userMap[chat.userId] ? (
            <div
              key={idx}
              className={`mb-1 py-0.5 px-1 w-max ${
                chat.userId === userId ? "ml-auto" : "mr-auto"
              }`}
            >
              {chat.userId !== userId && (
                <b className="block text-sm mb-1">{userMap[chat.userId]}</b>
              )}
              <div
                className={`p-3 rounded-xl ${
                  chat.userId === userId
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 rounded-tr-none"
                    : "bg-gray-800/70 rounded-tl-none"
                }`}
              >
                {chat.message}
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Footer */}
      <div className="p-3 flex border-t border-gray-600 bg-gray-900">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 rounded-lg px-4 py-2 bg-gray-800 text-white outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="ml-3 p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white hover:opacity-90 transition"
        >
          <LucideSend />
        </button>
      </div>
    </div>
  );
}
