"use client";

import { MessageSquare } from "lucide-react";

// Tailwind gradient classes - extracted to avoid linter false positives
const GRADIENT_BG = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50";
const GRADIENT_ICON = "bg-gradient-to-br from-indigo-100 to-purple-100";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center h-full ${GRADIENT_BG}`}>
      <div className="text-center max-w-md px-4">
        {icon || (
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${GRADIENT_ICON} mb-6 shadow-lg`}>
            <MessageSquare className="h-12 w-12 text-indigo-600" />
          </div>
        )}
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
}

