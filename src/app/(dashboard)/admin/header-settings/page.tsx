import React from "react";

const HeaderSettingsPage = () => {
  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Header Settings</h1>
        <p className="text-custom-sm text-body">
          Manage your website's header and navigation.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <form className="space-y-5">
          {/* Site Name */}
          <div>
            <label htmlFor="siteName" className="block text-custom-sm font-medium text-dark mb-2">
              Site Name
            </label>
            <input
              type="text"
              id="siteName"
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. SimbioCommerce"
            />
          </div>

          {/* Announcement Bar */}
          <div>
            <label htmlFor="announcement" className="block text-custom-sm font-medium text-dark mb-2">
              Announcement Bar Text
            </label>
            <input
              type="text"
              id="announcement"
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. Free shipping on orders over $50!"
            />
          </div>

          {/* Logo Upload (Mock) */}
          <div>
            <label className="block text-custom-sm font-medium text-dark mb-2">
              Site Logo
            </label>
            <div className="border-2 border-dashed border-gray-3 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-1 hover:bg-gray-2 duration-200 cursor-pointer">
              <svg className="w-10 h-10 text-gray-4 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-custom-sm text-body">Click to upload logo</p>
              <p className="text-custom-xs text-body mt-1">PNG, SVG up to 2MB</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeaderSettingsPage;
