"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignIn() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      router.push("/dashboard"); // Redirect if token exists
    }
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload

    try {
      const responses = await axios.post("http://localhost:3004/Signin", {
        email: data.email,
        password: data.password,
      });

      const token = (responses.data as { token?: string }).token;

      if (token) {
        localStorage.setItem("token", token);
        router.push("/dashboard");
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Sign in failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#2f2f2f] text-white relative overflow-hidden">
      {/* Neon Glow Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>

      {/* Sign In Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#3a3a3a]/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-700"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>

        <form className="space-y-5" onSubmit={handleSignIn}>
          {/* Email */}
          <div>
            <label className="block mb-2 text-gray-300">Email</label>
            <input
              onChange={(e) => setData({ ...data, email: e.target.value })}
              value={data.email}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-[#2f2f2f] border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-gray-300">Password</label>
            <input
              onChange={(e) => setData({ ...data, password: e.target.value })}
              value={data.password}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-[#2f2f2f] border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          {/* Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 font-semibold shadow-lg hover:shadow-purple-500/50 transition"
          >
            Sign In
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-600"></div>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        {/* Link to Sign Up */}
        <p className="text-center mt-6 text-gray-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-purple-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

