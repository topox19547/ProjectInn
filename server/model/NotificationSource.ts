import { ClientNotifier } from "./ClientNotifier.js";

export interface NotificationSource{
    setNotifier(notifier : ClientNotifier) : void;
}