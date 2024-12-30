# ProjectInn
A simple, quick, and easy to use virtual tabletop application designed to play role playing games like Dungeons & Dragons and Pathfinder.

## Features
🎨 Import your own assets and use them as tokens or maps\
🔒 Robust permission system, enabling the DM to assign tokens and choose what each user can do\
✏️ Easily manage your characters by adding stats and notes to your tokens\
💾 Save and autosave functionality, so that losing your games won't ever be an issue\
🗨 A simple chat with some useful tricks like dice rolling

## Screenshots
![token-view](deliverables/screenshots/TokenView.png)
![chat-view](deliverables/screenshots/ChatView.png)
![lobby-view](deliverables/screenshots/LobbyView.png)

## Setup
A hosted instance of ProjectInn can be found on my website at https://topox.dev/ProjectInn.
If you're looking to self-host follow the guide below.
Before you continue, make sure you've already installed Node.js and npm.
#building and deploying the client
1.cd into the "ProjectInn Client" directory and run "npm install" to install the required packages\
2.modify the serverUrl in Client.vue according to your needs. By default, the client will try connecting to a server on the same hostname with port 23435.\
keep in mind that the client will try to connect using a secured websocket. if you're looking to run it locally or in dev mode, you might want to change the serverURL's protocol to "ws".
3.edit the "base" property of the vite.config.ts file so that it matches the directory where the client is going to be served.
4.build the client with "npm run build"
5.the built client will be in /dist. move the contents of the directory to your http server of choice and have fun!
#building and running the server
1.cd into the "server" directory
2.run "npm install" to install the required packages
3.if desired, edit the port variable in Server.ts to change the default port.
4.run "npx tsc" to compile the server. the output will be in the /js folder.
5.optionally, add a file named "KEYPATHS" in the /js folder with two lines: the first one must be the path to the ssl key, while the second one has to be the path to the ssl certificate. Doing this will enable secured websocket mode.
6.cd into the /js folder and type "nodejs Server.js" to run the server.


