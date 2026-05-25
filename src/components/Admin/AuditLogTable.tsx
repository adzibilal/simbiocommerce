"use client";

import { SettingsAuditLog } from "@/types/store-settings";
import { formatDistanceToNow } from "date-fns";

interface AuditLogTableProps {
  logs: SettingsAuditLog[];
  showAll?: boolean;
}

export default function AuditLogTable({ logs, showAll = false }: AuditLogTableProps) {
  const displayLogs = showAll ? logs : logs.slice(0, 5);

  const getActionBadge = (action: string) => {
    const config = {
      created: "bg-green-100 text-green-800",
      updated: "bg-blue-100 text-blue-800",
      deleted: "bg-red-100 text-red-800",
    };
    return config[action as keyof typeof config] || "bg-gray-100 text-gray-800";
  };

  const getSettingLabel = (key: string) => {
    const labels: Record<string, string> = {
      payment_settings: "Payment Settings",
      shipping_settings: "Shipping Settings",
      shipping_origins: "Shipping Origins",
    };
    return labels[key] || key;
  };

  if (displayLogs.length === 0) {
    return (
      <div className="text-center py-8 text-body">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>No changes recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-3">
            <th className="text-left py-3 px-4 text-custom-sm font-medium text-body">Setting</th>
            <th className="text-left py-3 px-4 text-custom-sm font-medium text-body">Action</th>
            <th className="text-left py-3 px-4 text-custom-sm font-medium text-body">Changed By</th>
            <th className="text-left py-3 px-4 text-custom-sm font-medium text-body">Time</th>
          </tr>
        </thead>
        <tbody>
          {displayLogs.map((log) => (
            <tr key={log.id} className="border-b border-gray-2 hover:bg-gray-1">
              <td className="py-3 px-4 text-custom-sm text-dark">
                {getSettingLabel(log.settingKey)}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getActionBadge(
                    log.action
                  )}`}
                >
                  {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                </span>
              </td>
              <td className="py-3 px-4 text-custom-sm text-body">
                {log.changedBy || "System"}
              </td>
              <td className="py-3 px-4 text-custom-sm text-body">
                {formatDistanceToNow(new Date(log.changedAt), { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
