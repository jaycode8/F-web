
const formatDateTime = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        weekday: "short",
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

export default formatDateTime;
