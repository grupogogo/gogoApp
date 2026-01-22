

export const CalendarEvent = ({event}) => {
    
    const {title, user} = event;
    return (
        <>
        <strong>{title}</strong>
        <hr />
        <span> - {user.name}</span>
        </>
    )
}
