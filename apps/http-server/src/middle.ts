import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwt_secret } from "@repo/backend-comman/config";

export function Middleware(req:Request,res:Response,next:NextFunction){
    // console.log(req.headers)
    const token=req.headers["authorization"];
    // console.log(token)
    // if(!token){return}
    if (!token) {
        res.status(401).json({ message: "unauthorized: token missing" });
        return
    }
    try {
        const decode = jwt.verify(token, jwt_secret) as { userid?: string };
        if (decode && typeof decode === "object" && "userid" in decode) {
            //@ts-ignore
            req.userId = decode.userid;
            next();
        } else {
            res.status(401).json({
                message: "unauthorized: invalid token"
            });
        }
    } catch (err) {
        res.status(401).json({
            message: "unauthorized: invalid token"
        });
    }

}