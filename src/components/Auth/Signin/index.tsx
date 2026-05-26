"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#g-clip)">
      <mask id="g-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <path d="M20 0H0V20H20V0Z" fill="white" />
      </mask>
      <g mask="url(#g-mask)">
        <path d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z" fill="#4285F4" />
        <path d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z" fill="#34A853" />
        <path d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z" fill="#FBBC05" />
        <path d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z" fill="#EB4335" />
      </g>
    </g>
    <defs><clipPath id="g-clip"><rect width="20" height="20" fill="white" /></clipPath></defs>
  </svg>
);

interface SigninProps {
  storeName: string;
  logoUrl: string | null;
}

const BrandLogo = ({ storeName, logoUrl }: { storeName: string; logoUrl: string | null }) => {
  if (logoUrl) {
    return (
      <Image src={logoUrl} alt={storeName} width={140} height={45} className="max-h-[45px] w-auto object-contain" />
    );
  }
  const half = Math.ceil(storeName.length / 2);
  return (
    <span className="text-2xl font-bold text-dark">
      {storeName.slice(0, half)}<span className="opacity-50">{storeName.slice(half)}</span>
    </span>
  );
};

const Signin = ({ storeName, logoUrl }: SigninProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("Account created! Please sign in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const inputClass =
    "rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-dark";

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative only */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative z-10 text-center max-w-sm">
          <h2 className="text-4xl font-bold text-white mb-4 leading-snug">Welcome back!</h2>
          <p className="text-white/70 text-base leading-relaxed">
            Sign in to your account to continue shopping and track your orders.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-1 px-4 sm:px-8 py-12">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <BrandLogo storeName={storeName} logoUrl={logoUrl} />
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-2">Sign in</h1>
            <p className="text-dark-4">Enter your credentials to access your account</p>
          </div>

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red/10 border border-red/20 text-red text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">Email</label>
              <input
                type="email"
                id="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-dark">Password</label>
                <a href="#" className="text-sm text-blue hover:underline">Forgot password?</a>
              </div>
              <input
                type="password"
                id="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-3" />
            <span className="text-sm text-dark-4">or continue with</span>
            <div className="flex-1 h-px bg-gray-3" />
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex justify-center items-center gap-2.5 rounded-lg border border-gray-3 bg-white py-2.5 px-4 text-sm font-medium text-dark ease-out duration-200 hover:bg-gray-2"
          >
            <GoogleIcon /> Sign in with Google
          </button>

          <p className="text-center text-sm text-dark-4 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signin;
