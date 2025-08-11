"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Signup() {
  const router = useRouter();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    photo: "",
    con_password: "",
  });

  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    setPasswordsMatch(data.con_password === data.password);
  }, [data.con_password, data.password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;

    try {
      await axios.post("http://localhost:3004/Signup", {
        name: data.name,
        email: data.email,
        password: data.password,
        phone_number: data.photo,
      });
      router.push("/signin");
    } catch (err) {
      console.error("Signup failed", err);
      alert("Signup failed. Try again.");
    }
  };

  const Alert = () => (
    <p className="text-red-500 text-sm mb-2">Passwords do not match</p>
  );

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#2f2f2f] text-white relative overflow-hidden">
      {/* Neon Glow Effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>

      {/* Sign Up Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#3a3a3a]/70 backdrop-blur-lg p-2.5 rounded-2xl shadow-lg w-full max-w-md border border-gray-700"
      >
        <h1 className="text-3xl font-bold text-center mb-3">Sign Up</h1>
        <p className="text-center text-gray-400 mb-2.5">
          Enter your details to create an account
        </p>

        <form className="space-y-5" onSubmit={handleSignup}>
          <div>
            <label className="block mb-1.5 text-gray-300">Name</label>
            <input
              onChange={(e) => setData({ ...data, name: e.target.value })}
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2 rounded-lg bg-[#2f2f2f] border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-gray-300">Email</label>
            <input
              onChange={(e) => setData({ ...data, email: e.target.value })}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-[#2f2f2f] border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-gray-300">Phone Number</label>
            <input
              onChange={(e) => setData({ ...data, photo: e.target.value })}
              type="tel"
              placeholder="123-456-7890"
              className="w-full px-4 py-2 rounded-lg bg-[#2f2f2f] border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-gray-300">Password</label>
            <input
              onChange={(e) => setData({ ...data, password: e.target.value })}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-[#2f2f2f] border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-gray-300">Confirm Password</label>
            <input
              onChange={(e) =>
                setData({ ...data, con_password: e.target.value })
              }
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-[#2f2f2f] border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
            {!passwordsMatch && <Alert />}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 font-semibold shadow-lg hover:shadow-purple-500/50 transition"
          >
            Sign Up
          </motion.button>
        </form>

        <p className="text-center mt-1.5 text-gray-400 text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="text-purple-400 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
}










// "use client"
// import axios from "axios";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function Signup(){
// const router = useRouter();

// useEffect(() => {
//     const userToken = localStorage.getItem("token");

//     // Check if token exists in local storage
//     if (userToken) {
//       router.push("/dashboard"); // Redirect to dashboard if token exists
//     }
//   }, [router]);

//     const [data, setData] = useState({ name: "", email: "", password: "", photo: "", con_password: "" })    
//     const [passwordsMatch, setPasswordsMatch] = useState(true)

//     useEffect(() => {
//         setPasswordsMatch(data.con_password === data.password)
//     }, [data.con_password, data.password])
//     const Alert = () => {
//         return (<p className="text-red-500 text-sm mb-2">Passwords do not match</p>)
//     }
//     return(
//         <div
//             className="h-[100vh] w-full flex items-center justify-center"
//             style={{ backgroundImage: "url('../assets/back.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
//             <div className="items-center justify-center rounded-3xl shadow-2xl shadow-black border-black border-t-2 w-1/3 flex flex-col px-8 ">
//                     <div className="">signup page</div>
//                 <p className="m-auto py-1">Enter your credentials to access your account</p> 
//                 <input onChange={(e)=>{setData({...data, name: e.target.value})}} type="text" placeholder="Name"  ></input>
//                 <input onChange={(e)=>{setData({...data, email: e.target.value})}}  type="text" placeholder="Email"  ></input>
//                 <input onChange={(e)=>{setData({...data, photo: e.target.value})}}  type="number" placeholder="Phone number"  ></input>
//                 <input onChange={(e)=>{setData({...data, password: e.target.value})}}  type="password" placeholder="Password"  ></input>
//                 {passwordsMatch ? null : <Alert />}
//                 <input onChange={(e)=>{setData({...data, con_password: e.target.value})}}  type="password" placeholder="Confirm Password"  ></input>  
//                 <div className="p-4 m-auto">
//                     <button
//                         onClick={async () => {
//                             const responses = await axios.post("http://localhost:3004/Signup", {
//                                 "name": data.name,
//                                 "email": data.email,
//                                 "password": data.password,
//                                 "phone_number": data.photo
//                             });

//                             // localStorage.setItem('token', (responses.data as { token: string }).token);
//                             router.push("/signin");
//                         }}
//                         className="px-8 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm py-2.5 text-center me-2 mb-2"
//                     >
//                         Sign Up
//                     </button>
//                 <span className="px-2.5 py-3">Already user?
//                     <Link href="/signin" className="pointer underline pl-1 cursor-pointer" >Signin</Link></span>
                
//                 </div>
//             </div>
//         </div>    
//     )
// }