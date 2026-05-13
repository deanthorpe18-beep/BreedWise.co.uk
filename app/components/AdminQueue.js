"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Circle } from "lucide-react";

const initialTasks = [
  { id: "1", type: "New listing review", title: "Chichester Labrador Kennels", status: "pending" },
  { id: "2", type: "Claim request", title: "Worthing Golden Acres", status: "pending" },
  { id: "3", type: "Edit suggestion", title: "Bognor French Companion Kennels", status: "pending" }
];

export default function AdminQueue() {
  const [tasks, setTasks] = useState(initialTasks);

  const updateTask = (id, outcome) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: outcome } : task)));
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{task.type}</p>
              <p className="mt-1 text-sm text-slate-500">{task.title}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {task.status === "pending" ? <Circle className="h-3 w-3 text-[#FF6B6B]" /> : null}
                {task.status === "approved" ? <CheckCircle className="h-3 w-3 text-[#00BFA5]" /> : null}
                {task.status === "rejected" ? <XCircle className="h-3 w-3 text-[#FF6B6B]" /> : null}
                {task.status}
              </span>
              <button
                className="rounded-3xl bg-[#00BFA5] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00a98e]"
                onClick={() => updateTask(task.id, "approved")}
              >
                Approve
              </button>
              <button
                className="rounded-3xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => updateTask(task.id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
