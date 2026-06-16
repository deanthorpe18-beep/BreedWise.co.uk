"use client";

import { useState } from "react";
import { CheckCircle, Circle, Shield, Stethoscope, Home, FileText, MessageCircle, Award } from "lucide-react";

const ICON_MAP = {
  Shield,
  Stethoscope,
  Home,
  FileText,
  MessageCircle,
  Award,
};

export default function BreederChecklistClient({ checklistData }) {
  const [checked, setChecked] = useState(new Set());

  const toggle = (key) => {
    const next = new Set(checked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setChecked(next);
  };

  const total = checklistData.reduce((sum, s) => sum + s.items.length, 0);
  const progress = Math.round((checked.size / total) * 100);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Checklist progress</span>
          <span className="text-sm font-bold text-[#00BFA5]">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-[#00BFA5] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-xs text-slate-500">{checked.size} of {total} items checked</p>
      </div>

      <div className="space-y-4">
        {checklistData.map((section) => {
          const Icon = ICON_MAP[section.icon] || Shield;
          return (
            <div key={section.category}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5 text-[#00BFA5]" />
                <h3 className="text-sm font-bold text-slate-900">{section.category}</h3>
              </div>
              <div className="space-y-1">
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const isChecked = checked.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggle(key)}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${isChecked ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-700 hover:bg-[#E6FFFB]/50"}`}
                    >
                      {isChecked ? <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /> : <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />}
                      <span className={isChecked ? "line-through opacity-70" : ""}>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
