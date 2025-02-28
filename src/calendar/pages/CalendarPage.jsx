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

  const [lastView, setLastView] = useState(localStorage.getItem('lastView') || 'week') //Si no hay nada en lastview por defecto es week

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

      <Calendar
        culture='es'
        localizer={localizer}
        events={events}
        defaultView={lastView}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 80px)'/* , width: 'calc(100vh - 250px)'  */ }}
        messages={getMessagesES()}
        eventPropGetter={eventStyleGetter}
        components={{ event: CalendarEvent }}
        onDoubleClickEvent={onDoubleClick}
        onSelectEvent={onSelect}
        onView={onViewChanged}
      />
      <CalendarModal />
      <FabAddNew />
      <FabDelete />
    </LayoutApp>


  )
};