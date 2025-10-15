// import { process.env.NEXT_PUBLIC_HTTP_BACKEND } from "@/config";
import axios from "axios";
const http =process.env.NEXT_PUBLIC_HTTP_BACKEND
export async function getExitingShape(roomid: string) {
        const res = await axios.get(`${http}/room/getshape/${roomid}`)
        const GetShapes = res.data.shape;
        const shapes = GetShapes.map((x: { shape: string }) => {
            const shapeData = JSON.parse(x.shape)
            
            return shapeData;
        })
        return shapes;
    }