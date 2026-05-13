import React from "react";

const SEOSettingsPage = () => {
  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">SEO Settings</h1>
        <p className="text-custom-sm text-body">
          Manage your website's SEO metadata.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <form className="space-y-5">
          {/* Meta Title */}
          <div>
            <label htmlFor="metaTitle" className="block text-custom-sm font-medium text-dark mb-2">
              Meta Title
            </label>
            <input
              type="text"
              id="metaTitle"
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. SimbioCommerce - Best Online Shop"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="metaDescription" className="block text-custom-sm font-medium text-dark mb-2">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              rows={4}
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="Enter meta description..."
            ></textarea>
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="keywords" className="block text-custom-sm font-medium text-dark mb-2">
              Keywords
            </label>
            <input
              type="text"
              id="keywords"
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. ecommerce, shop, electronics (comma separated)"
            />
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

export default SEOSettingsPage;
