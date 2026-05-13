import React from "react";

const StatCards = () => {
  const stats = [
    {
      name: "Total Sales",
      value: "$24,500",
      change: "+12%",
      changeType: "increase",
      icon: (
        <svg
          className="w-6 h-6 text-green"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
    },
    {
      name: "Total Orders",
      value: "1,450",
      change: "+5%",
      changeType: "increase",
      icon: (
        <svg
          className="w-6 h-6 text-blue"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          ></path>
        </svg>
      ),
    },
    {
      name: "Total Products",
      value: "120",
      change: "0%",
      changeType: "neutral",
      icon: (
        <svg
          className="w-6 h-6 text-yellow"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          ></path>
        </svg>
      ),
    },
    {
      name: "Total Customers",
      value: "850",
      change: "+8%",
      changeType: "increase",
      icon: (
        <svg
          className="w-6 h-6 text-teal"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          ></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-euclid-circular-a">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2 hover:shadow-2 duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-2 rounded-xl">{stat.icon}</div>
            <span
              className={`text-custom-sm font-medium ${
                stat.changeType === "increase"
                  ? "text-green"
                  : stat.changeType === "decrease"
                  ? "text-red"
                  : "text-body"
              }`}
            >
              {stat.change}
            </span>
          </div>
          <div>
            <span className="text-custom-sm text-body">{stat.name}</span>
            <h3 className="text-heading-6 font-bold text-dark mt-1">
              {stat.value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
