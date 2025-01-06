import { ClientNotifier } from "../ClientNotifier.js";
import { Player } from "./player/Player.js";
import { Notifier } from "../Notifier.js";

export interface NotificationSource{
    setNotifier(notifier : Notifier<Player>) : void;
}