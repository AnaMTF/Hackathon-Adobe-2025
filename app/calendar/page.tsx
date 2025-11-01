"use client";
import { useEffect, useRef, useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

type Event = {
  uuid: string;
  name: string;
  details: string;
  date: string;
  creatorUuid: string;
  creator?: {
    uuid: string;
    numeFullName: string;
  };
};

export default function Calendar() {
  const myDatepicker = useRef(null);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventDetails, setEventDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ userId: string } | null>(null);

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          // API returns { success, data: { user: { uuid, ... } } }
          if (data.success && data.data?.user?.uuid) {
            console.log('[Calendar] Current user UUID from /api/auth/me:', data.data.user.uuid);
            setCurrentUser({ userId: data.data.user.uuid });
          } else {
            console.warn('[Calendar] Could not resolve current user UUID from /api/auth/me payload:', data);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    fetchUser();
  }, []);

  // Fetch events from API (next 7 days and today)
  useEffect(() => {
    async function fetchEvents() {
      try {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const response = await fetch(
          `/api/events?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.events) {
            setEvents(data.data.events);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }
    fetchEvents();
  }, []);

  // Setup SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource('/api/events/sse');

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'connected':
            console.log('SSE connected:', message.timestamp);
            break;
            
          case 'eventCreated':
            console.log('New event created:', message.data);
            setEvents((prev) => {
              // Check if event already exists
              const exists = prev.some(e => e.uuid === message.data.uuid);
              if (!exists) {
                return [...prev, message.data];
              }
              return prev;
            });
            break;
            
          case 'eventUpdated':
            console.log('Event updated:', message.data);
            setEvents((prev) =>
              prev.map((e) => (e.uuid === message.data.uuid ? message.data : e))
            );
            break;
            
          case 'eventDeleted':
            console.log('Event deleted:', message.data.uuid);
            setEvents((prev) => prev.filter((e) => e.uuid !== message.data.uuid));
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    // Dynamically import Pikaday only on client side
    if (typeof window !== 'undefined') {
      import('pikaday').then((Pikaday) => {
        const picker = new Pikaday.default({
          field: myDatepicker.current as unknown as HTMLElement,
        });
        return () => picker.destroy();
      });
    }
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Calendar cell array
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="aspect-square p-1" />);
  }

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
    <div className="relative min-h-screen w-full px-8">
      <div className={`flex flex-row items-start justify-center gap-8 w-full ${showModal ? "blur-sm" : ""}`}>
        {/* Calendar */}
        <div className="flex flex-col items-center flex-2 bg-base-100 rounded-lg shadow p-4">
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

        <div className="flex-1 w-full max-w-xs bg-base-200 rounded-lg shadow-lg p-6 text-base-content">
          {/* Today's Events*/}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Today&apos;s Events</h2>
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
          {/* Upcoming events*/}
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
      </div>
      {/* Adding event */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded shadow-lg w-80 text-base-content">
            <h2 className="text-lg font-bold mb-2">Add Event</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!currentUser?.userId) {
                  alert('You must be logged in to create events.');
                  return;
                }
                
                console.log('Current user:', currentUser);
                console.log('Event details:', { eventName, selectedDate, eventDetails });
                
                if (eventName && selectedDate && currentUser?.userId) {
                  setIsLoading(true);
                  try {
                    const requestBody = {
                      action: 'create' as const,
                      fields: {
                        name: eventName,
                        date: selectedDate,
                        details: eventDetails || '',
                        creatorUuid: currentUser.userId,
                      },
                    };
                    
                    console.log('🚀 CREATING EVENT - Request Body:', JSON.stringify(requestBody, null, 2));
                    console.log('🚀 Current User ID:', currentUser.userId);
                    
                    const response = await fetch('/api/events', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(requestBody),
                    });

                    if (response.ok) {
                      const data = await response.json();
                      console.log('Event created:', data);
                      // Event will be added via SSE, so we don't need to manually add it
                      setShowModal(false);
                      setEventName("");
                      setEventDetails("");
                    } else {
                      const errorData = await response.json();
                      alert(`Error: ${errorData.message || 'Failed to create event'}`);
                    }
                  } catch (error) {
                    console.error('Error creating event:', error);
                    alert('Failed to create event. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
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
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={isLoading}
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