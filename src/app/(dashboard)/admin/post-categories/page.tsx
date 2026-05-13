import React from "react";

const PostCategoriesPage = () => {
  const categories = [
    {
      id: 1,
      name: "Guides",
      slug: "guides",
    },
    {
      id: 2,
      name: "Reviews",
      slug: "reviews",
    },
    {
      id: 3,
      name: "News",
      slug: "news",
    },
  ];

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Post Categories</h1>
          <p className="text-custom-sm text-body">
            Manage blog post categories.
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
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-1 duration-150">
                  <td className="px-6 py-4 text-custom-sm font-medium text-dark">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {category.slug}
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

export default PostCategoriesPage;
