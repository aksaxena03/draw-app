"use client";
import { useEffect, useRef, useState } from "react";
import { LucideSend } from "lucide-react";
import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Chat = { userId: string; message: string; name?: string };

export default function Chatbox({ token, userId }: { token: string | null; userId: string | null }) {
  const [roomid, setRoomid] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState("");
  const [userMap, setUserMap] = useState<{ [userId: string]: string }>({});
  const ws = useRef<WebSocket | null>(null);
  // Helper to fetch name by userId and update the map
  const fetchAndCacheName = async (uid: string) => {
    if (!uid || userMap[uid]) return;
    // Replace this URL with your actual API endpoint
    const res = await fetch(`/api/user/${uid}`);
    if (res.ok) {
      const data = await res.json();
      setUserMap(prev => ({ ...prev, [uid]: data.name }));
    }
    return res
  };
  
  useEffect(()=>{
    const fetchChats = async () => {
      if (!roomid || roomid === " ") return;
      try {
        const response = await axios.get(`${HTTP_BACKEND}/chat/${roomid}`);
        const data = response.data;
        console.log(data.data);

        const uniqueUserIds = Array.from(new Set(data.data.map((msg: { userId: string }) => msg.userId)));
        await Promise.all(
          uniqueUserIds.map(async (uid) => {
            const userIdStr = String(uid);
            if (!userMap[userIdStr]) {
              try {
                const res = await fetch(`${HTTP_BACKEND}/api/v1/user/${userIdStr}`);
                const rm = await res.json();
                if (rm.username) {
                  setUserMap(prev => ({ ...prev, [userIdStr]: rm.username }));
                }
                console.log(rm);
              } catch (err) {
                console.error("Failed to fetch user:", err);
              }
            }
          })
        );

        // Now, set chats with the latest userMap (note: userMap may not be updated immediately, so we use a workaround)
        setChats(
          data.data.map((msg: { userId: string; message: string }) => ({
            userId: msg.userId,
            message: msg.message,
            name: userMap[msg.userId] // This may be undefined on first render, but will update on next render
          }))
        );
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };
    fetchChats();
    console.log(chats);

  },[roomid])
  
  useEffect(() => {
    if (!token) return;
    ws.current = new WebSocket(`ws://localhost:8080?token=${token}`);
    ws.current.onopen = () => {
      console.log("WebSocket connected");
      // If roomid is already set when ws opens, join the room
      if (roomid) {
        ws.current?.send(JSON.stringify({ type: "join_room", roomId: String(roomid) }));
      }
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data)
      console.log(data.roomId ,roomid)

      if (data.type === "chat" && String(data.roomId) === String(roomid)) {

        // If name not in userMap, fetch and cache it
        console.log(userMap[data.userId])
        if (!userMap[data.userId]) {
          const rm =fetch(`${HTTP_BACKEND}/api/v1/user/${data.userId}`)
            .then(res => res.json())
            .then(resData => {
              if (resData.username) {
                setUserMap(prev => ({ ...prev, [data.userId]: resData.username }));
              }
              console.log(rm)
            });
        }
        setChats((prev) => [
          ...prev,
          { userId: data.userId, message: data.message, name: userMap[data.userId] }
        ]);
      }
    };
    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };
    return () => {
      ws.current?.close();
    };
  }, [token,roomid]);

  useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && roomid) {
      ws.current.send(JSON.stringify({ type: "join_room", roomId: String(roomid) }));
      setChats([]);
    }
  }, [roomid]);

  const sendMessage = () => {
    if (
      !message.trim() ||
      !ws.current ||
      ws.current.readyState !== WebSocket.OPEN
    )
      return;
    ws.current.send(
      JSON.stringify({
        type: "chat",
        roomId:String(roomid),
        message,
        userId
      })
    );
    setMessage("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-[1/4] h-96 bg-white border rounded-2xl shadow-lg flex flex-col z-50">
      <div className="p-2 flex flex-row border-b">
        Room: {" "}
        <input
          className="ml-2 border rounded px-1 w-[1/1]"
          value={roomid} id="roomid"
          onChange={(e) => {setRoomid(e.target.value)}}
          placeholder="Room ID"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 w-full">
        {chats.map((chat, idx) => (
          userMap[chat.userId] && (
            <div key={idx} className={`mb-0.5 py-0.5 px-1 w-min ${chat.userId===userId? 'ml-auto right-0':'left-0'}`} >
              <b> {chat.userId===userId? null:userMap[chat.userId]}
                </b>
                <div className={`border border-blue-500 py-0.5 px-2 rounded-3xl w-min ${chat.userId===userId?'rounded-tr-none':'rounded-tl-none'}`}>{chat.message}</div> 
            </div>
          )
        ))}
      </div>
      <div className="flex m-2 border rounded-4xl">
        <input
          className="flex-1 rounded px-2 outline-0"
          value={message} id="message"
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className=" p-2 bg-blue-500 text-white rounded-4xl"
          onClick={sendMessage }
        >
          <LucideSend />
        </button>
      </div>
    </div>
  );
}