"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signIn } from "next-auth/react";

const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-2 py-12 px-4 sm:px-6 lg:px-8 font-euclid-circular-a">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2">
        <div>
          <div className="flex justify-center">
            <span className="text-3xl font-bold text-blue">Simbio</span>
            <span className="text-3xl font-bold text-dark">Commerce</span>
          </div>
          <h2 className="mt-6 text-center text-heading-5 font-bold text-dark">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-custom-sm text-body">
            Please sign in to access the management dashboard.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red text-sm mb-4 text-center">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="block text-custom-sm font-medium text-dark mb-2">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-3 placeholder-dark-5 text-dark focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue sm:text-custom-sm duration-200"
                placeholder="admin@simbiospace.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-custom-sm font-medium text-dark mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-3 placeholder-dark-5 text-dark focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue sm:text-custom-sm duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue focus:ring-blue/20 border-gray-3 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-custom-sm text-body">
                Remember me
              </label>
            </div>

            <div className="text-custom-sm">
              <a href="#" className="font-medium text-blue hover:text-blue-dark duration-200">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-custom-sm font-medium rounded-lg text-white bg-blue hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue duration-200"
            >
              Sign in
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link href="/" className="text-custom-sm text-body hover:text-dark duration-200">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
