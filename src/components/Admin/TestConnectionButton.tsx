"use client";

import { useState } from "react";

interface TestConnectionButtonProps {
  onTest: () => Promise<{ success: boolean; message: string }>;
  disabled?: boolean;
}

export default function TestConnectionButton({
  onTest,
  disabled = false,
}: TestConnectionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await onTest();
      setResult(response);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "Connection test failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleTest}
        disabled={disabled || loading}
        className="font-medium text-blue bg-blue/10 py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Testing...
          </>
        ) : (
          "Test Connection"
        )}
      </button>

      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
