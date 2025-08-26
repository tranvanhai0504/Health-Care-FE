"use client";

export function ScheduleHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          My Schedules
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage appointments and visits
        </p>
      </div>
    </div>
  );
}
