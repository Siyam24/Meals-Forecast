import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import DatePicker from "react-datepicker";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "../context/ThemeContext";
import { FaFileAlt, FaCalendarAlt } from "react-icons/fa";
import "../styles/Calendar.css"

const CalendarPage = () => {
  const { theme } = useTheme();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch events from the backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/calendar/events", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events. Please try again.");
    }
  };

  const validateEvent = (event) => {
    const newErrors = {};
    
    if (!event.title.trim()) {
      newErrors.title = "Event title is required";
    }
    
    if (!event.start) {
      newErrors.start = "Start date is required";
    }
    
    if (!event.end) {
      newErrors.end = "End date is required";
    } else if (event.end < event.start) {
      newErrors.end = "End date cannot be before start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEvent = async () => {
    if (!validateEvent(newEvent)) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newEvent,
          title: newEvent.title.trim()
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add event");
      }
      
      await fetchEvents();
      setNewEvent({ title: "", start: new Date(), end: new Date() });
      toast.success("Event added successfully!");
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error(error.message || "Failed to add event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!validateEvent(selectedEvent)) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:5000/calendar/events/${selectedEvent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            ...selectedEvent,
            title: selectedEvent.title.trim()
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update event");
      }
      
      await fetchEvents();
      setSelectedEvent(null);
      toast.success("Event updated successfully!");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(error.message || "Failed to update event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://127.0.0.1:5000/calendar/events/${event.id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to delete event");
        }
        
        await fetchEvents();
        setSelectedEvent(null);
        toast.success("Event deleted successfully!");
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error(error.message || "Failed to delete event. Please try again.");
      }
    }
  };

  const handleDateSelect = (selectInfo) => {
    setNewEvent({
      ...newEvent,
      start: selectInfo.start,
      end: selectInfo.end || new Date(selectInfo.start.getTime() + 60 * 60 * 1000),
    });
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: new Date(clickInfo.event.start),
      end: clickInfo.event.end ? new Date(clickInfo.event.end) : new Date(clickInfo.event.start),
    });
  };

  return (
    <div className={`calendar-wrapper ${theme}`}>
      <div className="calendar-container">
        <h2 className={`calendar-title ${theme}`}>Calendar</h2>
        
        <div className={`calendar-content ${theme}`}>
          <div className={`calendar-inner-container ${theme}`}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              editable={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }}
              eventContent={(eventInfo) => (
                <div className={`fc-event-content ${theme}`}>
                  {eventInfo.event.title}
                </div>
              )}
              eventClassNames={(eventInfo) => [
                `fc-event-${theme}`,
                eventInfo.event.extendedProps?.className || ''
              ]}
            />
          </div>
        </div>

        {/* Add Event Form */}
        <div className={`form-container ${theme}`}>
          <h3 className={`form-title ${theme}`}>Add Event</h3>
          
          <div className="input-container">
            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              className={`form-input ${theme} ${errors.title ? "error" : ""}`}
              aria-label="Event Title"
            />
            <FaFileAlt className={`input-icon ${theme}`} />
            {errors.title && <span className={`error-message ${theme}`}>{errors.title}</span>}
          </div>
          
          <div className="date-picker-container">
            <div className="input-container">
              <DatePicker
                selected={newEvent.start}
                onChange={(date) => setNewEvent(prev => ({ ...prev, start: date }))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className={`date-picker-input ${theme} ${errors.start ? "error" : ""}`}
                placeholderText="Start Date & Time"
              />
              <FaCalendarAlt className={`input-icon ${theme}`} />
              {errors.start && <span className={`error-message ${theme}`}>{errors.start}</span>}
            </div>
            
            <div className="input-container">
              <DatePicker
                selected={newEvent.end}
                onChange={(date) => setNewEvent(prev => ({ ...prev, end: date }))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className={`date-picker-input ${theme} ${errors.end ? "error" : ""}`}
                placeholderText="End Date & Time"
              />
              <FaCalendarAlt className={`input-icon ${theme}`} />
              {errors.end && <span className={`error-message ${theme}`}>{errors.end}</span>}
            </div>
          </div>
          
          <button 
            onClick={handleAddEvent} 
            className={`btn btn-add ${theme}`}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Event"}
          </button>
        </div>

        {/* Edit Event Form */}
        {selectedEvent && (
          <div className={`form-container ${theme}`}>
            <h3 className={`form-title ${theme}`}>Edit Event</h3>
            
            <div className="input-container">
              <input
                type="text"
                value={selectedEvent.title}
                onChange={(e) => setSelectedEvent(prev => ({ ...prev, title: e.target.value }))}
                className={`form-input ${theme} ${errors.title ? "error" : ""}`}
              />
              <FaFileAlt className={`input-icon ${theme}`} />
              {errors.title && <span className={`error-message ${theme}`}>{errors.title}</span>}
            </div>
            
            <div className="date-picker-container">
              <div className="input-container">
                <DatePicker
                  selected={selectedEvent.start}
                  onChange={(date) => setSelectedEvent(prev => ({ ...prev, start: date }))}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className={`date-picker-input ${theme} ${errors.start ? "error" : ""}`}
                  placeholderText="Start Date & Time"
                />
                <FaCalendarAlt className={`input-icon ${theme}`} />
                {errors.start && <span className={`error-message ${theme}`}>{errors.start}</span>}
              </div>
              
              <div className="input-container">
                <DatePicker
                  selected={selectedEvent.end}
                  onChange={(date) => setSelectedEvent(prev => ({ ...prev, end: date }))}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className={`date-picker-input ${theme} ${errors.end ? "error" : ""}`}
                  placeholderText="End Date & Time"
                />
                <FaCalendarAlt className={`input-icon ${theme}`} />
                {errors.end && <span className={`error-message ${theme}`}>{errors.end}</span>}
              </div>
            </div>
            
            <div className="button-group">
              <button 
                onClick={handleUpdateEvent} 
                className={`btn btn-update ${theme}`}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
              <button 
                className={`btn btn-delete ${theme}`}
                onClick={() => handleDeleteEvent(selectedEvent)}
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
        toastClassName={`toast-${theme}`}
      />
    </div>
  );
};

export default CalendarPage;