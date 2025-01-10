import { Message } from "./messages/Message.js"

/**
 * Basic interface for all types of notifiers. includes a method for filtering the objects that will be notified
 * by leveraging an identity assigned to each of them.
 */
export interface Notifier<T = void>{
    notify(message : Message) : void
    notifyIf(message : Message, check : (identity : T) => boolean) : void
}