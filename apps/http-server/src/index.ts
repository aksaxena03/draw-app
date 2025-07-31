import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from 'cors';
import { Middleware } from "./middle.js";
import { jwt_secret } from "@repo/backend-comman/config";
import { CreateuserSchema, SigninSchema, CreateRoomSchema } from "@repo/commons/types";
import { prismaClient } from "@repo/db/client";

const app = express();
app.use(express.json());
app.use(cors());

const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) =>
         Promise<any>) => 
            (req: Request, res: Response, next: NextFunction) =>
                 {
    Promise.resolve(fn(req, res, next)).catch(next);
};

type SignupData = { name: string; email: string; password: string; photo?: string | null };

const signupHandler = asyncHandler(async (req: Request, res: Response) => {
    const parseData = CreateuserSchema.safeParse(req.body);
    if (!parseData.success) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    const { name, email, password, photo } = parseData.data as SignupData;
    const existingUser = await prismaClient.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
        data: { name, email, password: hashedPassword, photo: photo ?? null }
    });
    return res.json({ userid: user.id });
});

const signinHandler = asyncHandler(async (req: Request, res: Response) => {
    const parseData = SigninSchema.safeParse(req.body);
    if (!parseData.success) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    const { email, password } = parseData.data;
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userid: user.id }, jwt_secret);
    return res.json({ token });
});

const createRoomHandler = asyncHandler(async (req: Request, res: Response) => {
    const parseData = CreateRoomSchema.safeParse(req.body);
    if (!parseData.success) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    const { slag } = parseData.data;
    const existingRoom = await prismaClient.room.findUnique({ where: { slag } });
    if (existingRoom) {
        return res.status(409).json({ message: 'Room already exists' });
    }
    const userId = (req as any).userId;
    const room = await prismaClient.room.create({
        data: { slag, adminId: userId }
    });
    return res.json({ roomid: room.id });
});

const getChatHandler = asyncHandler(async (req: Request, res: Response) => {
    const roomId = Number(req.params.roomId);
    const data = await prismaClient.chat.findMany({
        where: { roomId },
        orderBy: { id: "desc" },
        take: 50
    });
    return res.json({ data});
});

const getRoomHandler = asyncHandler(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findUnique({ where: { slag: slug } });
    if (!room) {
        return res.status(404).json({ message: "Room not found" });
    }
    return res.json({ room });
});

const addShapeHandler = asyncHandler(async (req: Request, res: Response) => {
    const roomId = Number(req.params.roomId);
    const shapeData = JSON.stringify(req.body.shape);
    const userId = (req as any).userId;
    const shape = await prismaClient.shape.create({
        data: { roomId, userId, shape: shapeData }
    });
    return res.json({ shape });
});

const getShapesHandler = asyncHandler(async (req: Request, res: Response) => {
    const roomId = Number(req.params.roomId);
    const shapes = await prismaClient.shape.findMany({
        where: { roomId },
        orderBy: { id: "desc" },
        take: 20
    });
    return res.json({ shape: shapes });
});
const finduser=asyncHandler(async (req: Request, res: Response) => {
    try{const userId=req.params.userid
        const userid = userId?.toString();
        console.log(userid,userId)
    const user=await prismaClient.user.findUnique({where:{id:userid}})
    res.status(200).json({username:user?.name})}
    catch(e){
        res.json({
            message:'user not found'
            ,errorMessage:e
        })
    }
})
const user=asyncHandler(async (req: Request, res: Response) => {
   
  try { const userId=(req as any).userId;
   const user = await prismaClient.user.findUnique({ where: { id: String(userId) } });
    res.status(200).json({username:user?.name})}
    catch(e){
        res.json({
            message:'user not found'
            ,errorMessage:e
        })
    }
})

app.post('/signup', signupHandler);
app.post('/signin', signinHandler);
app.post('/room', Middleware, createRoomHandler);
app.get('/chat/:roomId', getChatHandler);
app.get('/room/:slug', Middleware, getRoomHandler);
app.post('/room/shape/:roomId', Middleware, addShapeHandler);
app.get('/room/getshape/:roomId', getShapesHandler);
app.get('/api/v1/user/:userid', finduser)
app.get('/api/v1/user',Middleware,user)


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => { console.log(`Server running at ${PORT}`); });