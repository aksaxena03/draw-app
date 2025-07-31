import Button from "./Button"
import { useNavigate } from "react-router-dom"
interface user{
    name:string,
    email:string,
    phone:string,
    userid:string
}


export default function Card({name,email,phone,userid}:user){
    const navigate=useNavigate();
    
    return(
        
            <div className="flex flex-row justify-between mt-2 items-center shadow shadow-gray-400 m-0.5 rounded fill-gray-300 p-1.5 mx-4 px-1.5">
                <div className="flex">
                <div className="bg-green-400 text-white font-semibold rounded-full h-8 w-8 flex items-center justify-center text-lg">{name[0]+name[1]}</div>&nbsp;
                     <div className="m-auto">{email} , {phone}</div>
                </div>
                <div className="">
                    <Button text="Pay" onClick={
                    ()=>{navigate(`/Transfer?username=${name}&email=${email}&userid=${userid}`)}
                    } style="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center" />
                </div>
        </div>
        
    )
}