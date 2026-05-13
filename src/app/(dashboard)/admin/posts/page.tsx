import React from "react";

const PostsPage = () => {
  const posts = [
    {
      id: 1,
      title: "How to Choose the Right Headphones",
      author: "John Doe",
      category: "Guides",
      date: "2026-05-12",
      status: "Published",
    },
    {
      id: 2,
      title: "Top 10 Smart Watches in 2026",
      author: "Alice Smith",
      category: "Reviews",
      date: "2026-05-10",
      status: "Draft",
    },
    {
      id: 3,
      title: "The Future of Ecommerce",
      author: "Bob King",
      category: "News",
      date: "2026-05-08",
      status: "Published",
    },
  ];

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Blog Posts</h1>
          <p className="text-custom-sm text-body">
            Manage your blog content.
          </p>
        </div>
        <button className="flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-1 duration-150">
                  <td className="px-6 py-4 text-custom-sm font-medium text-dark max-w-xs truncate">
                    {post.title}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {post.category}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {post.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full ${
                        post.status === "Published"
                          ? "bg-green/10 text-green"
                          : "bg-gray-4/10 text-gray-5"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-blue hover:text-blue-dark duration-200">
                      Edit
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

export default PostsPage;
