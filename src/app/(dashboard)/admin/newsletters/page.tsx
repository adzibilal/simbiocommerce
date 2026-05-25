"use client";


import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getNewsletterSubscribers,
  toggleSubscriberStatus,
  deleteSubscriber,
} from "@/app/actions/newsletter";
import ModalPortal from "@/components/Dashboard/ModalPortal";

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean | null;
  subscribedAt: string | null;
  unsubscribedAt: string | null;
}

const NewslettersPage = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);

  const fetchData = async () => {
    const data = await getNewsletterSubscribers();
    setSubscribers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (sub: Subscriber) => {
    await toggleSubscriberStatus(sub.id, !sub.isActive);
    toast.success(sub.isActive ? "Subscriber deactivated" : "Subscriber activated");
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    toast.loading("Deleting subscriber...", { id: "sub-toast" });
    try {
      await deleteSubscriber(deleteTarget.id);
      toast.success("Subscriber deleted!", { id: "sub-toast" });
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete subscriber", { id: "sub-toast" });
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Newsletter Subscribers</h1>
        <p className="text-custom-sm text-body">
          Manage email newsletter subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-5">
          <p className="text-custom-xs font-bold text-dark-3 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-dark">{subscribers.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-5">
          <p className="text-custom-xs font-bold text-dark-3 uppercase tracking-wider mb-1">Active</p>
          <p className="text-2xl font-bold text-green">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-5">
          <p className="text-custom-xs font-bold text-dark-3 uppercase tracking-wider mb-1">Inactive</p>
          <p className="text-2xl font-bold text-red">{subscribers.length - activeCount}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-dark-4">Loading subscribers...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Subscribed</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-1 duration-150">
                    <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                      {sub.email}
                    </td>
                    <td className="px-6 py-4 text-custom-sm text-body">
                      {formatDate(sub.subscribedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(sub)}
                        className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full cursor-pointer ${
                          sub.isActive
                            ? "bg-green/10 text-green"
                            : "bg-red/10 text-red"
                        }`}
                      >
                        {sub.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(sub)}
                        className="text-red hover:text-red-dark duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-body text-custom-sm">
                      No subscribers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ModalPortal>
          <div className="fixed inset-0 left-0 top-0 z-[200] flex min-h-[100dvh] w-full items-center justify-center p-4 font-euclid-circular-a">
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative z-[1] bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
              <h2 className="text-lg font-bold text-dark mb-2">Confirm Delete</h2>
              <p className="text-body text-custom-sm mb-4">
                Are you sure you want to delete subscriber <strong>{deleteTarget.email}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-custom-sm font-medium text-dark bg-gray-2 rounded-lg hover:bg-gray-3 duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-custom-sm font-medium text-white bg-red rounded-lg hover:bg-red-dark duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default NewslettersPage;
