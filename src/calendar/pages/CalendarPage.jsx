import { useState } from "react";
import { Calendar } from "react-big-calendar"
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { CalendarEvent, CalendarModal, FabAddNew, FabDelete } from "../"
import { getMessagesES, localizer } from "../../helpers";
import { useUiStore, useCalendarStore } from "../../hooks";
import { LayoutApp } from "../../layout/LayoutApp";




const events = [];

export const CalendarPage = () => {
  const { events, setActiveEvent } = useCalendarStore();
  const { openDateModal } = useUiStore();
  const eventStyleGetter = (event, start, end, isSelected) => {
    const style = {
      backgroundColor: '#347CF7',
      borderRadius: '3px',
      opacity: 0.8,
      color: 'white'
    }
    return { style }
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [lastView, setLastView] = useState(localStorage.getItem('lastView') || (isMobile ? 'agenda' : 'week'));

  const onDoubleClick = (event) => {
    openDateModal();
  }

  const onSelect = (event) => {
    setActiveEvent(event);
  }
  const onViewChanged = (event) => {
    localStorage.setItem('lastView', event);
    setLastView(event);
  }
  return (
    <LayoutApp>
      <div className="card border-0 shadow-sm rounded-4 p-2 p-md-3 bg-white overflow-hidden">
        <Calendar
          culture='es'
          localizer={localizer}
          events={events}
          defaultView={lastView}
          startAccessor="start"
          endAccessor="end"
          style={{ height: isMobile ? 'calc(100dvh - 160px)' : 'calc(100vh - 120px)', minHeight: '480px' }}
          messages={getMessagesES()}
          eventPropGetter={eventStyleGetter}
          components={{ event: CalendarEvent }}
          onDoubleClickEvent={onDoubleClick}
          onSelectEvent={onSelect}
          onView={onViewChanged}
        />
      </div>
      <CalendarModal />
      <FabAddNew />
      <FabDelete />
    </LayoutApp>


  )
};