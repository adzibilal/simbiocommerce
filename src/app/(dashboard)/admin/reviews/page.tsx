import React from "react";
import { getReviews } from "@/app/actions/review";
import ReviewActions from "./ReviewActions";

const ReviewsPage = async () => {
  const reviews = await getReviews();

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Reviews</h1>
        <p className="text-custom-sm text-body">
          Manage product reviews from customers.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-1 duration-150">
                  <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                    {review.product || "Unknown Product"}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {review.customer || "Unknown Customer"}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-yellow">
                    {"★".repeat(review.rating || 0)}{"☆".repeat(5 - (review.rating || 0))}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body max-w-xs truncate">
                    {review.comment}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      review.status === "approved" ? "bg-green/10 text-green" :
                      review.status === "rejected" ? "bg-red/10 text-red" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {review.status ?? "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {review.date ? new Date(review.date).toLocaleDateString("id-ID") : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ReviewActions id={review.id} status={review.status ?? "pending"} />
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-body text-sm">No reviews yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
