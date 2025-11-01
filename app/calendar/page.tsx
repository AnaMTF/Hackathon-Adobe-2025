"use client";
import { useEffect, useRef, useState } from "react";
import Pikaday from "pikaday";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function Calendar() {
  const myDatepicker = useRef(null);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  type Event = { name: string; details: string; date: string };
  const [events, setEvents] = useState<Event[]>([
    // Example: { name: "Team Meeting", details: "Discuss project", date: "2025-11-03" }
  ]);
  const [eventName, setEventName] = useState("");
  const [eventDetails, setEventDetails] = useState("");


  useEffect(() => {
    const picker = new Pikaday({
      field: myDatepicker.current,
    });
    return () => picker.destroy();
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Create array for calendar cells
  const calendarCells = [];
  // Empty cells for days before the 1st of the month
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="aspect-square p-1" />);
  }
  // Cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasEvent = events.some(event => event.date === dateStr);

    calendarCells.push(
      <div
        key={day}
        className="aspect-square p-6 border rounded text-center cursor-pointer hover:bg-primary hover:text-white flex flex-col items-center justify-center text-lg"
        onClick={() => {
          setSelectedDate(dateStr);
          setShowModal(true);
        }}
      >
        {hasEvent && (
          <span className="w-3 h-3 bg-red-500 rounded-full mb-2"></span>
        )}
        <span>{day}</span>
      </div>
    );
  }

  // Navigation handlers
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="flex flex-row items-start justify-center min-h-screen gap-8 w-full px-8">
      {/* Calendar Section */}
      <div className="flex flex-col items-center flex-[2]">
        <div className="flex items-center mb-4 gap-4">
          <button className="btn btn-outline" onClick={prevMonth}>
            Prev
          </button>
          <span className="font-bold text-lg">
            {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })} {currentYear}
          </span>
          <button className="btn btn-outline" onClick={nextMonth}>
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 gap-4 w-full max-w-3xl">
          {daysOfWeek.map((day) => (
            <div key={day} className="font-semibold text-center text-lg py-4">
              {day}
            </div>
          ))}
          {calendarCells}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="flex-[1] w-full max-w-xs bg-base-200 rounded-lg shadow-lg p-6">
        {/* Today's Events Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Today's Events</h2>
          <ul>
            {events
              .filter(e => e.date === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`)
              .map((event, idx) => (
                <li key={idx} className="mb-4">
                  <div className="font-semibold">{event.name}</div>
                  <div className="text-sm text-gray-500">{event.details}</div>
                  <div className="text-xs text-gray-400">{event.date}</div>
                </li>
              ))}
            {events.filter(e => e.date === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`).length === 0 && (
              <li className="text-gray-500">No events today.</li>
            )}
          </ul>
        </div>
        {/* Upcoming Events Section */}
        <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
        <ul>
          {events
            .filter(e => new Date(e.date) > today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3)
            .map((event, idx) => (
              <li key={idx} className="mb-4">
                <div className="font-semibold">{event.name}</div>
                <div className="text-sm text-gray-500">{event.details}</div>
                <div className="text-xs text-gray-400">{event.date}</div>
              </li>
            ))}
          {events.filter(e => new Date(e.date) > today).length === 0 && (
            <li className="text-gray-500">No upcoming events.</li>
          )}
        </ul>
      </div>

      {/* Modal for adding event */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-grey p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-2">Add Event</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (eventName && selectedDate) {
                  setEvents([
                    ...events,
                    {
                      name: eventName,
                      details: eventDetails,
                      date: selectedDate,
                    },
                  ]);
                  setShowModal(false);
                  setEventName("");
                  setEventDetails("");
                }
              }}
            >
              <div className="mb-2">
                <label className="block text-sm">Event Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Details</label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={eventDetails}
                  onChange={e => setEventDetails(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm">Date</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={selectedDate ?? ""}
                  readOnly
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    setEventName("");
                    setEventDetails("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}