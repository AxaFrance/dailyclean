
export const getLocalHour=(hourUTC) => {
    const date = new Date();
    date.setHours(hourUTC);
    const hour = date.getHours();
    return hour;
}

export const getUTCHour=(hourLocal) => {
    console.log(hourLocal)
    const date = new Date();
    date.setHours(hourLocal);
    return date.getHours()
}
