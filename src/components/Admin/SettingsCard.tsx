"use client";

import Link from "next/link";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status: "active" | "inactive" | "not-configured";
  lastUpdated?: string;
  stats?: { label: string; value: string | number }[];
}

export default function SettingsCard({
  title,
  description,
  icon,
  href,
  status,
  lastUpdated,
  stats,
}: SettingsCardProps) {
  const statusConfig = {
    active: {
      badge: "Active",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    inactive: {
      badge: "Inactive",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
    "not-configured": {
      badge: "Not Configured",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
  };

  return (
    <Link
      href={href}
      className="block bg-white p-6 rounded-2xl shadow-1 border border-gray-2 hover:shadow-2 hover:border-blue/20 duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue/10 rounded-lg flex items-center justify-center text-blue">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark">{title}</h3>
            <p className="text-custom-sm text-body">{description}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[status].color}`}
        >
          {statusConfig[status].badge}
        </span>
      </div>

      {stats && stats.length > 0 && (
        <div className="flex gap-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex-1">
              <p className="text-custom-xs text-body">{stat.label}</p>
              <p className="text-lg font-semibold text-dark">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {lastUpdated && (
        <p className="text-custom-xs text-body">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      )}

      <div className="mt-4 flex items-center text-blue text-sm font-medium">
        Configure
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
