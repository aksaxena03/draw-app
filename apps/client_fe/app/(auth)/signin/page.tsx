"use client"


import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup(){
  const router = useRouter();

 useEffect (() => {
    const userToken = localStorage.getItem("token");

    // Check if token exists in local storage
    if (userToken) {
      router.push("/dashboard"); // Redirect to dashboard if token exists
    }
  }, [router]);

    const [data, setData] = useState({ email: "", password: "" })    

    
    return(
        <div
            className="h-[100vh] w-full flex items-center justify-center"
            style={{ backgroundImage: "url('../assets/back.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="rounded-3xl shadow-2xl shadow-black border-black border-t-2 w-1/3 flex flex-col px-8 ">
                    <div className="">signin page</div>
                <p className="m-auto py-1">Enter your credentials to access your account</p> 
                <input onChange={(e)=>{setData({...data, email: e.target.value})}}  type="text" placeholder="Email"  ></input>
                <input onChange={(e)=>{setData({...data, password: e.target.value})}}  type="password" placeholder="Password"  ></input>
                <div className="p-4 m-auto">
                    <button
                        onClick={async () => {
                            const responses = await axios.post("http://localhost:3004/Signin", {
                                "email": data.email,
                                "password": data.password
                            });

                            localStorage.setItem('token', (responses.data as { token: string }).token);
                            if ((responses.data as { token: string }).token) {
                                router.push('/dashboard');
                            } else {
                                router.push("/Signin");
                            }
                        }}
                        className="px-8 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm py-2.5 text-center me-2 mb-2"
                    >
                        Sign In
                    </button>
                <span className="px-2.5 py-3">New user?
                    <Link href="/signup" className="pointer underline pl-1 cursor-pointer" >Signup</Link></span>
                
                </div>
            </div>
        </div>    
    )
}