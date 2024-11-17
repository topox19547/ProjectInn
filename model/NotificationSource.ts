import { ClientNotifier } from "./ClientNotifier";

export interface NotificationSource{
    setNotifier(notifier : ClientNotifier) : void;
}