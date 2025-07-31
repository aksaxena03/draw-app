import axios from "axios"
import { BACKEND_URL } from "../../config"
import Chatrooms from "../../../components/Chatrooms"

async function roomid(slug: string) {
    const response=await axios.post(`${BACKEND_URL}/room/${slug}`);
    return response.data.room.id
}

interface ChatRoomProps {
    params: {
        slug: string;
    };
}

export default async function  ChatRoom({ params }: ChatRoomProps) {
    const { slug } = params;
    const response= await roomid(slug);
    return<Chatrooms id={response}/>
    
}