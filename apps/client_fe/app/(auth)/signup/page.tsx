"use client"
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Signup(){
const router = useRouter();

useEffect(() => {
    const userToken = localStorage.getItem("token");

    // Check if token exists in local storage
    if (userToken) {
      router.push("/dashboard"); // Redirect to dashboard if token exists
    }
  }, [router]);

    const [data, setData] = useState({ name: "", email: "", password: "", photo: "", con_password: "" })    
    const [passwordsMatch, setPasswordsMatch] = useState(true)

    useEffect(() => {
        setPasswordsMatch(data.con_password === data.password)
    }, [data.con_password, data.password])
    const Alert = () => {
        return (<p className="text-red-500 text-sm mb-2">Passwords do not match</p>)
    }
    return(
        <div
            className="h-[100vh] w-full flex items-center justify-center"
            style={{ backgroundImage: "url('../assets/back.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="items-center justify-center rounded-3xl shadow-2xl shadow-black border-black border-t-2 w-1/3 flex flex-col px-8 ">
                    <div className="">signup page</div>
                <p className="m-auto py-1">Enter your credentials to access your account</p> 
                <input onChange={(e)=>{setData({...data, name: e.target.value})}} type="text" placeholder="Name"  ></input>
                <input onChange={(e)=>{setData({...data, email: e.target.value})}}  type="text" placeholder="Email"  ></input>
                <input onChange={(e)=>{setData({...data, photo: e.target.value})}}  type="number" placeholder="Phone number"  ></input>
                <input onChange={(e)=>{setData({...data, password: e.target.value})}}  type="password" placeholder="Password"  ></input>
                {passwordsMatch ? null : <Alert />}
                <input onChange={(e)=>{setData({...data, con_password: e.target.value})}}  type="password" placeholder="Confirm Password"  ></input>  
                <div className="p-4 m-auto">
                    <button
                        onClick={async () => {
                            const responses = await axios.post("http://localhost:3004/Signup", {
                                "name": data.name,
                                "email": data.email,
                                "password": data.password,
                                "phone_number": data.photo
                            });

                            // localStorage.setItem('token', (responses.data as { token: string }).token);
                            router.push("/signin");
                        }}
                        className="px-8 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm py-2.5 text-center me-2 mb-2"
                    >
                        Sign Up
                    </button>
                <span className="px-2.5 py-3">Already user?
                    <Link href="/signin" className="pointer underline pl-1 cursor-pointer" >Signin</Link></span>
                
                </div>
            </div>
        </div>    
    )
}