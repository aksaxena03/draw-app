"use client"

import { useEffect, useState } from "react";
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";
import Heading from '../../components/Heading';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Signin(){
    const navi=useNavigate();
    
     useEffect (() => {
        const userToken = localStorage.getItem("token");
    
        // Check if token exists in local storage
        if (!userToken) {
          navi("/Signin"); // Redirect to sign-in page if token doesn't exist
        }
      }, []);
    const [data, setData] = useState({email: "", password: ""})    
    return(
        <div className="h-screen w-screen flex items-center justify-center backdrop-blur-lg">
            
            <div className="rounded-3xl shadow-2xl shadow-black border-black border-t-2 w-2/7 h-3/5 flex flex-col p-6 ">
                <Heading Label="Sign in"></Heading>

                <p className="px-2.5 py-3">Enter your credentials to access your account</p>
                <InputBox type="text" onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setData({...data, email:e.target.value})} placeholder="Registered Email"  ></InputBox>
                <InputBox type="Password" onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setData({...data, password:e.target.value})} placeholder="Paytm Password"  ></InputBox>
                <a href="" className="text-right pb-1">forgot Password ?</a>
                <div className="pt-4 m-auto">
                    <Button onClick={async()=>{const responses = await axios.post("http://localhost:3004/Signin",{
                        email: data.email,
                        password: data.password, 
                    }) 
                    console.log(responses)
                    const responseData = responses.data as { error?: string; token?: string };
   
                    localStorage.setItem('token', responseData.token || "");
                    {responseData.token ? navi('/dashboard') : navi("/Signin")}
                    }} text="Signup" style="px-8 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"></Button>
                
                </div>
                <span className="flex justify-center font-mono">New user?<Link className="pointer underline pl-1 cursor-pointer text-blue-500" to='/Signup'>Signup</Link></span>

            </div>
            
        </div>
    )
}