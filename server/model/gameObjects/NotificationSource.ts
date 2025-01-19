import { Player } from "./player/Player.js";
import { Notifier } from "../Notifier.js";

/**
 * defines an object that can notify the players in a game
 */
export interface NotificationSource{
    setNotifier(notifier : Notifier<Player>) : void;
}