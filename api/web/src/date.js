

const timezoneOffsetHour = () => {
    const x = new Date();
    return x.getTimezoneOffset() / 60;
}

export const getLocalHour=(hourUTC) => {
    const date = new Date();
    date.setHours(hourUTC - timezoneOffsetHour());
    const hour = date.getHours();
    return hour;
}

export const getUTCHour=(hourLocal) => {
    const date = new Date();
    date.setHours(hourLocal + timezoneOffsetHour());
    return date.getHours()
}

