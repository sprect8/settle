import { notification } from "antd";

const sendInfoNotification = (config) => {
    config.duration = 0;
    notification.info(config);
}
const closeNotification = (key) => {
    notification.close(key);
}
const sendErrorNotification = (config) => {
    config.duration = 0;
    notification.error(config);
}
export {
    sendInfoNotification,
    closeNotification,
    sendErrorNotification
};