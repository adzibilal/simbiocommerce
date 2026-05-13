"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const Header = () => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const user = session?.user;
  const name = user?.name || "Admin User";
  const role = user?.role || "Super Admin";
  
  // Generate initials
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="bg-white border-b border-gray-3 h-16 flex items-center justify-between px-6 font-euclid-circular-a relative">
      {/* Search Bar */}
      <div className="relative w-64">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="w-5 h-5 text-dark-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border border-gray-3 rounded-lg text-custom-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue duration-200"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-body hover:text-dark hover:bg-gray-2 rounded-full duration-200">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"
            ></path>
          </svg>
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="flex flex-col text-right">
              <span className="text-custom-sm font-medium text-dark">
                {name}
              </span>
              <span className="text-custom-xs text-body capitalize">{role}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue text-white flex items-center justify-center font-bold text-custom-sm">
              {initials}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2 border border-gray-3 py-2 z-50">
              <Link 
                href="/admin/profile" 
                className="block px-4 py-2 text-custom-sm text-dark hover:bg-gray-1"
                onClick={() => setIsDropdownOpen(false)}
              >
                Profile Detail
              </Link>
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  signOut();
                }}
                className="w-full text-left px-4 py-2 text-custom-sm text-red hover:bg-gray-1"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
