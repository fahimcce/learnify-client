"use client";

import { MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Tailwind gradient classes - extracted to avoid linter false positives
const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50";
const GRADIENT_ERROR_ICON = "bg-gradient-to-br from-red-100 to-orange-100";

export default function BackendUnavailable() {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${GRADIENT_BG}`}>
      <div className="text-center max-w-md px-4">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${GRADIENT_ERROR_ICON} mb-6 shadow-lg`}>
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          Backend Server Unavailable
        </h3>
        <p className="text-slate-600 mb-4">
          The chat server is not running. Please make sure the backend server
          is started on port 5000.
        </p>
        <p className="text-sm text-slate-500">
          Socket and API connection errors in the console are expected when
          the backend is not running.
        </p>
      </div>
    </div>
  );
}

