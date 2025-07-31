"use client"
import { useState } from 'react';
// import './globals.css';
// import "./page.module.css"
import { useRouter } from 'next/navigation';

export default function Home() {
  const [roomid,setRoomid]=useState("")
  const router=useRouter();
  return (
    <div style={{
      display:"flex",
      width:"100vw",height:"100vh",
      margin:"auto"
    }}>
      <input type='text' placeholder='roomid' onChange={(e)=>{setRoomid(e.target.value)}}></input>
      <button onClick={
        ()=>{router.push(`/chat/${roomid}`)}
      }>join</button>
    </div>
  )
}
