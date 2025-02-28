import { useDispatch, useSelector } from "react-redux"
import { onAddNewEvent, onDeleteEvent, onSetActiveEvent, onUpdateEvent } from "../store";


export const useCalendarStore = () => {

  const { events, activeEvent } = useSelector(state => state.calendar);

  const dispatch = useDispatch();
  const setActiveEvent = (calendarEvent) => {
    dispatch(onSetActiveEvent(calendarEvent));
  }

  const startSavingEvent = async (calendarEvent) => {
    // TODO: llegar al backend

    //Todo bien
    if (calendarEvent._id) {
      //Actualizacion
      dispatch(onUpdateEvent({ ...calendarEvent }));
    } else {
      //creando
      dispatch(onAddNewEvent({ ...calendarEvent, _id: new Date().getTime() }))
    }
  }

  const startDeleteEvent = () => {
    //TODO llegar al backend
    dispatch(onDeleteEvent());
  }
  return {
    //*Propiedades
    events,
    activeEvent,
    hasEventSelected: !!activeEvent,

    //*Metodos
    setActiveEvent,
    startSavingEvent,
    startDeleteEvent
  }
}
