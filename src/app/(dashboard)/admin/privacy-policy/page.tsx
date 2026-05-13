import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Privacy Policy</h1>
        <p className="text-custom-sm text-body">
          Manage your website's privacy policy content.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <form className="space-y-5">
          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-custom-sm font-medium text-dark mb-2">
              Policy Content
            </label>
            <textarea
              id="content"
              rows={15}
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="Enter privacy policy content in HTML or Markdown..."
              defaultValue={`<h1>Privacy Policy</h1>
<p>Last updated: May 13, 2026</p>
<p>Your privacy is important to us. It is SimbioCommerce's policy to respect your privacy regarding any information we may collect from you across our website.</p>
<h2>1. Information We Collect</h2>
<p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>`}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark"
            >
              Save Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
