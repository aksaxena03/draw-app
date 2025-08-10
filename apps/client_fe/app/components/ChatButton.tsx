"use client";
import { LucideMessageCircleMore, LucideMessageCircleX, LucideMessageSquareMore, LucideMessageSquareOff } from "lucide-react";
import { useEffect, useState } from "react";
import Chatbox from "./Chatbox";
import { stringify } from "querystring";
import { reduceAppConfig } from "next/dist/build/utils";

function decodeUserId(token: string | null): string | null {
  if (!token) return null;
  try {
    const payloadStr = atob(token.split('.')[1]);
    const payload = JSON.parse(payloadStr);
    return payload.userid || payload.userId || payload.sub || null;
  } catch (e) {
    console.log("JWT decode error:", e);
    return null;
  }
}

export default function ChatButton(roomId:any) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [roomid,setroomid]=useState("")

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    setUserId(decodeUserId(t));
    // console.log("Decoded userId:", (decodeUserId(t)).userId);
  }, []);

  // console.log("Rendering ChatButton"+ stringify(roomId));

  useEffect(
    ()=>{const hi=(stringify(roomId)).split("=")[1]

      setroomid(hi)
    }
  ,[roomId])



  if (token === null || userId === null) return null;

  return (
    <>
      <button
        className="z-50 flex cursor-pointer top-4 right-4 absolute bg-gray-700 rounded-md p-1  text-indigo-300"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <LucideMessageSquareOff size={25} className="text-indigo-300"/>:<LucideMessageSquareMore size={25} />}
      </button>
     
        
      {open && <Chatbox token={token} userId={userId} roomId={roomid} />}
      
    </>
  );
}