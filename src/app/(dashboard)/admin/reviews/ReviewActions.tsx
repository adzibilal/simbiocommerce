"use client";

import { useState } from "react";
import { updateReviewStatus, deleteReview } from "@/app/actions/review";
import { useRouter } from "next/navigation";

export default function ReviewActions({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = async (action: "approve" | "reject" | "delete") => {
    setLoading(true);
    if (action === "delete") {
      await deleteReview(id);
    } else {
      await updateReviewStatus(id, action === "approve" ? "approved" : "rejected");
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-3">
      {status !== "approved" && (
        <button
          disabled={loading}
          onClick={() => handle("approve")}
          className="text-green hover:opacity-70 duration-200 text-sm font-medium disabled:opacity-40"
        >
          Approve
        </button>
      )}
      {status !== "rejected" && (
        <button
          disabled={loading}
          onClick={() => handle("reject")}
          className="text-body hover:text-dark duration-200 text-sm disabled:opacity-40"
        >
          Reject
        </button>
      )}
      <button
        disabled={loading}
        onClick={() => handle("delete")}
        className="text-red hover:opacity-70 duration-200 text-sm disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}
