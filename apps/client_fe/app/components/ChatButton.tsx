"use client";
import { LucideMessageCircleMore, LucideMessageCircleX } from "lucide-react";
import { useEffect, useState } from "react";
import Chatbox from "./Chatbox";

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

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    setUserId(decodeUserId(t));
    // console.log("Decoded userId:", (decodeUserId(t)).userId);
  }, []);

  console.log("Rendering ChatButton", { token, userId });

  if (token === null || userId === null) return null;

  return (
    <>
      <button
        className="z-50 flex cursor-grab fill-blue-700 text-yellow-500 m-2.5 absolute top-0 right-0"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <LucideMessageCircleX /> : <LucideMessageCircleMore className="text-yellow-500"/>}
      </button>
      {open && <Chatbox token={token} userId={userId} />}
    </>
  );
}