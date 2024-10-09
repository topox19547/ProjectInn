class ClientNotifier{
    private readonly subscribers : Map<ClientHandler, Player | undefined>;

    constructor(){
        this.subscribers = new Map();
    }

    public subscribe(clientHandler : ClientHandler, player?: Player) : void{
        this.subscribers.set(clientHandler, player);
    }

    public unsubscribe(clientHandler : ClientHandler) : void{
        this.subscribers.delete(clientHandler);
    }

    public notify(message : Object) : void{
        this.subscribers.forEach((_, c) => {
            c.send(message);
        })
    }

    public notifyIf(message : Object, check : (player : Player) => boolean) : void{
        this.subscribers.forEach((p, c) => {
            if(p != undefined && check(p)){
                c.send(message);
            }
        });
    }
}