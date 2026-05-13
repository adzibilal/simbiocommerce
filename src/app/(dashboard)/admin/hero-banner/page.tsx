import React from "react";

const HeroBannerPage = () => {
  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Hero Banner</h1>
        <p className="text-custom-sm text-body">
          Manage the main hero banner on the homepage.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <form className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-custom-sm font-medium text-dark mb-2">
              Banner Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. Summer Collection 2026"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label htmlFor="subtitle" className="block text-custom-sm font-medium text-dark mb-2">
              Subtitle
            </label>
            <input
              type="text"
              id="subtitle"
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. Up to 50% off on selected items."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Button Text */}
            <div>
              <label htmlFor="btnText" className="block text-custom-sm font-medium text-dark mb-2">
                Button Text
              </label>
              <input
                type="text"
                id="btnText"
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                placeholder="e.g. Shop Now"
              />
            </div>

            {/* Button Link */}
            <div>
              <label htmlFor="btnLink" className="block text-custom-sm font-medium text-dark mb-2">
                Button Link
              </label>
              <input
                type="text"
                id="btnLink"
                className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                placeholder="e.g. /shop"
              />
            </div>
          </div>

          {/* Background Image (Mock) */}
          <div>
            <label className="block text-custom-sm font-medium text-dark mb-2">
              Background Image
            </label>
            <div className="border-2 border-dashed border-gray-3 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-1 hover:bg-gray-2 duration-200 cursor-pointer">
              <svg className="w-10 h-10 text-gray-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-custom-sm text-body">Click to upload image</p>
              <p className="text-custom-xs text-body mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroBannerPage;
