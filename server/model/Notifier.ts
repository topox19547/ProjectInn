import { Message } from "./messages/Message.js"

export interface Notifier<T = void>{
    notify(message : Message) : void
    notifyIf(message : Message, check : (identity : T) => boolean) : void
}