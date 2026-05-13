import React from "react";

const CountdownPage = () => {
  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Countdown Settings</h1>
        <p className="text-custom-sm text-body">
          Manage flash sale countdown timers.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2">
        <form className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-custom-sm font-medium text-dark mb-2">
              Countdown Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="e.g. Flash Sale Ends In"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-custom-sm font-medium text-dark mb-2">
              End Date &amp; Time
            </label>
            <input
              type="datetime-local"
              id="endDate"
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-custom-sm font-medium text-dark mb-2">
              Status
            </label>
            <select
              id="status"
              className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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

export default CountdownPage;
