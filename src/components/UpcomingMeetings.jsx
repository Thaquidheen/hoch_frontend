import React, { useEffect, useState } from "react";
import { Upcomingmeeting } from "../service/application_api";

const UpcomingMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingMeeting = async () => {
      try {
        const response = await Upcomingmeeting();
        setMeetings(response);
      } catch (err) {
        console.error("Error fetching upcoming meeting:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingMeeting();
  }, []);

  if (loading) {
    return <p className="text-white">Loading upcoming meetings...</p>;
  }

  if (meetings.length === 0) {
    return <p className="text-white">No upcoming client meetings found.</p>;
  }

  // Sort meetings by date (most upcoming at the top)
  const sortedMeetings = [...meetings].sort(
    (a, b) => new Date(a.meeting_date) - new Date(b.meeting_date)
  );

  return (
    <div className="bg-gray-900 shadow-lg rounded-lg p-4 w-full max-w-sm border border-red-700">
      <h2 className="text-xl font-bold mb-4 text-red-500 text-center">
        Upcoming Meetings
      </h2>

      {/* Scrollable List */}
      <div className="max-h-70 overflow-y-auto scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-gray-800">
        <ul className="space-y-3">
          {sortedMeetings.map((meeting) => (
            <li
              key={meeting.customer_id}
              className="p-3 border border-red-700 rounded-md hover:shadow transition"
            >
              <div className="text-white font-medium">
                {meeting.customer_name}
              </div>
              <div className="text-sm text-yellow-500">
                Meeting Date: {meeting.meeting_date}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UpcomingMeetings;
