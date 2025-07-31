import axios from "axios";
import { BACKEND_URL } from "../app/config";
import ChatroomClient from "./ChatroomClient";

async function GetChats(roomid:string){
    const response=await axios.post(`${BACKEND_URL}/chat/${roomid}`);
    return response.data.message
}

export default async function Chatrooms({id}: { id: string }) {

    const response = await GetChats(id);
    return<ChatroomClient id={id} messages={response} />
    
}