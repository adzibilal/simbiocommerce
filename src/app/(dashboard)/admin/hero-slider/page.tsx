import React from "react";

const HeroSliderPage = () => {
  const slides = [
    {
      id: 1,
      title: "Slide 1: New Arrivals",
      order: 1,
      status: "Active",
    },
    {
      id: 2,
      title: "Slide 2: Big Sale",
      order: 2,
      status: "Active",
    },
    {
      id: 3,
      title: "Slide 3: Winter Collection",
      order: 3,
      status: "Inactive",
    },
  ];

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Hero Slider</h1>
          <p className="text-custom-sm text-body">
            Manage the homepage slider.
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
          Add Slide
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-custom-xs font-bold text-dark-3 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {slides.map((slide) => (
                <tr key={slide.id} className="hover:bg-gray-1 duration-150">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <div className="h-10 w-16 bg-gray-2 rounded-lg flex items-center justify-center text-dark-5 border border-gray-3">
                      🖼️
                    </div>
                    <span className="text-custom-sm font-medium text-dark">
                      {slide.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-custom-sm text-body">
                    {slide.order}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-custom-xs font-semibold rounded-full ${
                        slide.status === "Active"
                          ? "bg-green/10 text-green"
                          : "bg-red/10 text-red"
                      }`}
                    >
                      {slide.status}
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

export default HeroSliderPage;
