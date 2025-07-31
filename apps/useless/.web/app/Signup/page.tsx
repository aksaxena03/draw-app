"use client"
import Button from "../../components/Button";
import InputBox from "../../components/InputBox";
import Heading from "../../components/Heading";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/**
 * Signup component renders a registration form for new users to create an account.
 * It collects user details such as name, username, email, phone number, and password.
 */
export default function Signup(){
    const navi=useNavigate();

 useEffect (() => {
    const userToken = localStorage.getItem("token");

    // Check if token exists in local storage
    if (userToken) {
      navi("/dashboard"); // Redirect to sign-in page if token doesn't exist
    }
  }, []);

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
            <div className="rounded-3xl shadow-2xl shadow-black border-black border-t-2 w-1/3 flex flex-col px-8 ">
                <Heading Label="Sign up"></Heading>
                <p className="m-auto py-1">Enter your credentials to access your account</p> 
                <InputBox onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setData({...data, name: e.target.value})}} type="text" placeholder="Name"  ></InputBox>
                <InputBox onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setData({...data, email: e.target.value})}}  type="text" placeholder="Email"  ></InputBox>
                <InputBox onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setData({...data, photo: e.target.value})}}  type="number" placeholder="Phone number"  ></InputBox>
                <InputBox onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setData({...data, password: e.target.value})}}  type="password" placeholder="Password"  ></InputBox>
                {passwordsMatch ? null : <Alert />}
                <InputBox onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setData({...data, con_password: e.target.value})}}  type="password" placeholder="Confirm Password"  ></InputBox>  
                <div className="p-4 m-auto">
                    <Button onClick={async()=>{const responses=await axios.post("http://localhost:3004/Signup",{
                        "name": data.name, 
                        "email": data.email,
                        "password": data.password, 
                        "phone_number": data.photo
                    })
                    
                    localStorage.setItem('token', (responses.data as { token: string }).token)
                    {(responses.data as {token:string}).token? navi('/dashboard'):navi("/Signin")}
                    }} text="Signup" style="px-8 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"></Button>
                <span className="px-2.5 py-3">New user?
                    <Link className="pointer underline pl-1 cursor-pointer" to='/Signup'>Signup</Link></span>
                
                </div>
            </div>
        </div>    
    )
}