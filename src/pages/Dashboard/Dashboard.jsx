// src/components/Dashboard.js

import React, { useEffect, useState } from "react";

function Dashboard() {
  // State variables to hold data
  const [newLeadsThisMonth, setNewLeadsThisMonth] = useState(0);
  const [transitionsByState, setTransitionsByState] = useState({});
  const [currentDistribution, setCurrentDistribution] = useState({});
  const [recentChanges, setRecentChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  fetch("http://127.0.0.1:8000/api/customers/dashboard/")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Handle 204 or empty body safely
      if (response.status === 204) return {};
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    })
    .then((data = {}) => {
      setNewLeadsThisMonth(data.new_leads_this_month ?? 0);
      setTransitionsByState(data.transitions_by_state || {});
      setCurrentDistribution(data.current_distribution || {});
      setRecentChanges(Array.isArray(data.recent_changes) ? data.recent_changes : []);
      setLoading(false);
    })
    .catch((err) => {
      setError(err.message);
      setLoading(false);
    });
}, []);
  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error loading dashboard data: {error}</div>;
  }

  // Convert transitionsByState object into an array for easy mapping
  const transitionsEntries = Object.entries(transitionsByState); 
  // e.g. [["Lead", 2], ["Pipeline", 3], ...]

  // Convert currentDistribution object into an array
  const distributionEntries = Object.entries(currentDistribution);
  // e.g. [["Lead", 10], ["Pipeline", 7], ...]

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      {/* 1) New Leads This Month */}
      <div style={{ marginBottom: "20px" }}>
        <h2>New Leads This Month</h2>
        <p>{newLeadsThisMonth}</p>
      </div>

      {/* 2) Transitions to Each State This Month */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Transitions to Each State (This Month)</h2>
        <ul>
          {transitionsEntries.map(([state, count]) => (
            <li key={state}>
              {state}: {count}
            </li>
          ))}
        </ul>
      </div>

      {/* 3) Current Distribution of States */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Current Distribution of States</h2>
        <ul>
          {distributionEntries.map(([state, count]) => (
            <li key={state}>
              {state}: {count}
            </li>
          ))}
        </ul>
      </div>

      {/* 4) Recently Changed */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Recently Changed (Last 10 Transitions)</h2>
        <ul>
          {recentChanges.map((change, index) => (
            <li key={index}>
              <strong>{change.customer}</strong>: {change.previous_state} {"->"}{" "}
              {change.new_state} at {change.timestamp}
            </li>
          ))}
        </ul>
      </div>

      {/* 5) (Optional) Historic Distribution */}
      {/* If you build a separate endpoint or date picker, you can fetch 
          snapshots or reconstruct data for a chosen date. */}
    </div>
  );
}

export default Dashboard;
