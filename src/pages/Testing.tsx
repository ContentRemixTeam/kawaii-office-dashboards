import ToolShell from "@/components/ToolShell";
import TestingChecklist from "@/components/TestingChecklist";

export default function Testing() {
  return (
    <ToolShell title="Feature Testing Checklist">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
            🎯 Testing Guidelines
          </h2>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p><strong>Before Making Changes:</strong> Run through this checklist to establish a baseline</p>
            <p><strong>After Making Changes:</strong> Re-test affected areas and related functionality</p>
            <p><strong>Console Check:</strong> Always monitor F12 → Console for JavaScript errors</p>
            <p><strong>Multi-Browser:</strong> Test critical features in Chrome, Firefox, and Safari</p>
            <p><strong>Mobile Testing:</strong> Verify responsive design on actual mobile devices</p>
          </div>
        </div>

        <TestingChecklist />
      </div>
    </ToolShell>
  );
}