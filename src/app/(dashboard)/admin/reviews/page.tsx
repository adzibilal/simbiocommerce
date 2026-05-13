import React from "react";
import { getReviews } from "@/app/actions/review";

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
                  <td className="px-6 py-4 text-custom-sm text-yellow flex items-center">
                    {"★".repeat(review.rating || 0)}
                    {"☆".repeat(5 - (review.rating || 0))}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body max-w-xs truncate">
                    {review.comment}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {review.date}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-blue hover:text-blue-dark duration-200">
                      Approve
                    </button>
                    <button className="text-red hover:text-red-dark duration-200">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
