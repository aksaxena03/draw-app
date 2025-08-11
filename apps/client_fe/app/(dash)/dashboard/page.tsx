"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ChatButton from "@/app/components/ChatButton";

export default function Dashboard() {
    const router = useRouter();
    const [roomid,setRoomid]=useState<string>("")
  
 useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      router.push("/signin"); // Redirect if token exists
    }
  }, [router]);


  return (
    <main className="min-h-screen flex flex-col bg-[#2f2f2f] text-white">
      {/* Hero Section */}
        <div className="z-20">
          <ChatButton/>
        </div>
        
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 relative overflow-hidden">
        {/* Neon Glow Circles */}
        
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>

        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-extrabold tracking-tight drop-shadow-lg"
        >
          Exelidraw
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-2xl mt-4 text-lg text-gray-300"
        >
          A next-generation collaborative whiteboard. Draw, ideate, and share
          seamlessly — anywhere, anytime.
        </motion.p>
            {/* <form > */}
                <motion.div
                 initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-4"
                >
                  <input
                    onChange={(e) => setRoomid(e.target.value)}
                    type="text"
                    placeholder="RoomId"
                    className="w-[50%] px-4 py-2 rounded-lg bg-[#2f2f2f] border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                  <Link 
                  href={`/canvas/${roomid}`}  className="w-[50%] ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 font-semibold shadow-lg hover:shadow-purple-500/50 transition">
                    Join
                  </Link>
                </motion.div>
               
        {/* Features Section */}

       
        <section className="py-16 px-6 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "⚡ Real-Time Sync",
              desc: "Instant collaboration with your team — no refresh needed.",
            },
            {
              title: "🪐 Infinite Canvas",
              desc: "Work without limits and explore endless creative space.",
            },
            {
              title: "📤 Easy Export",
              desc: "Download as PNG/SVG or share via a secure live link.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-[#3a3a3a] p-6 rounded-xl shadow-lg hover:shadow-purple-500/40 transition border border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-2 text-purple-400">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}

          
        </section>
        
      </section>  


      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 border-t border-gray-700">
        © {new Date().getFullYear()} Exelidraw. All rights reserved.
      </footer>
    </main>
  );
}