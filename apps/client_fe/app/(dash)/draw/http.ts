import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExitingShape(roomid: string) {
        const res = await axios.get(`${HTTP_BACKEND}/room/getshape/${roomid}`)
        const GetShapes = res.data.shape;
        const shapes = GetShapes.map((x: { shape: string }) => {
            const shapeData = JSON.parse(x.shape)
            // console.log(shapeData)
            return shapeData;
        })
        return shapes;
    }