export const calculatedCurrentTime = () => {
    const currentDate = new Date();

    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Add 1 as months are zero-based
    const year = currentDate.getFullYear();

    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    return `${year}-${month}-${day} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
}

export enum Messages{
    START = "startListener",
    GETPOPUPSTATE = "getPopupState",
    SETPOPUPSTATE = "setPopupState",
    GETTIME = "GetTime",
    GETSTARTANDEND = "GetStartAndEnd"
}