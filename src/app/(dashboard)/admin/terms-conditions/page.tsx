import React from "react";

const TermsConditionsPage = () => {
  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Terms &amp; Conditions</h1>
        <p className="text-custom-sm text-body">
          Manage your website's terms and conditions content.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <form className="space-y-5">
          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-custom-sm font-medium text-dark mb-2">
              Terms Content
            </label>
            <textarea
              id="content"
              rows={15}
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="Enter terms and conditions content in HTML or Markdown..."
              defaultValue={`<h1>Terms & Conditions</h1>
<p>Last updated: May 13, 2026</p>
<p>Welcome to SimbioCommerce. These terms and conditions outline the rules and regulations for the use of our website.</p>
<h2>1. Acceptance of Terms</h2>
<p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use SimbioCommerce if you do not agree to take all of the terms and conditions stated on this page.</p>`}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="font-medium text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark"
            >
              Save Terms
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
