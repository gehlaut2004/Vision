import React, { useState } from "react";
import OrgHeader from "./OrgHeader";
import OrgSidebar from "./OrgSidebar";
import CreateExamCard from "../../components/org/exams/CreateExamCard";
import LiveExamsCard from "../../components/org/exams/LiveExamsCard";
import UpcomingExamsCard from "../../components/org/exams/UpcomingExamsCard";
import RecentExamsCard from "../../components/org/exams/RecentExamsCard";

export default function ManageExamsPage() {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (key) => {
    setExpandedCard((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <OrgSidebar />
      <div className="flex-1 flex flex-col">
        <OrgHeader orgName="CodeAcademy" />
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6">📋 Manage Exams</h1>

          <div className={`grid gap-6 transition-all duration-500 ${
            expandedCard ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}>
            {(expandedCard === null || expandedCard === "create") && (
              <CreateExamCard
                expanded={expandedCard === "create"}
                onToggle={() => toggleCard("create")}
              />
            )}
            {(expandedCard === null || expandedCard === "live") && (
              <LiveExamsCard
                expanded={expandedCard === "live"}
                onToggle={() => toggleCard("live")}
              />
            )}
            {(expandedCard === null || expandedCard === "upcoming") && (
              <UpcomingExamsCard
                expanded={expandedCard === "upcoming"}
                onToggle={() => toggleCard("upcoming")}
              />
            )}
            {(expandedCard === null || expandedCard === "recent") && (
              <RecentExamsCard
                expanded={expandedCard === "recent"}
                onToggle={() => toggleCard("recent")}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
