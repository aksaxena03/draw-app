"use Client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket"

export default function ChatroomClient({messages,id}:
    {messages:{message:string}[],id:string}){
const [chat,setChat]=useState(messages)
const {socket,loading}=useSocket();
const [currentMessage,setCurrentMessage]=useState("")

useEffect(()=>{
     if(socket &&!loading){
    socket.send(JSON.stringify({
        type:"join_room",
        roomid:id,
        // message
    }))
    socket.onmessage=(Event)=>
        {const parsedData=JSON.parse(Event.data)
            if(parsedData.type==="chat"){
                setChat(c=>[...c,{message:parsedData.message}])
            }

         }
   }
},[socket,loading,id])

return(
   <div className="">
     {chat.map(m=><div>{m.message}</div>)}

    <input type="text" value={currentMessage} onChange={(e)=>{setCurrentMessage(e.target.value)}}/>
    <button onClick={()=>{
        socket?.send(JSON.stringify({
            type:"chat",roomid:id,message:currentMessage
        }))
        setCurrentMessage("");
    }}>send</button>

   </div>
)
}