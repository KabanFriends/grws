const WebSocketClient = require("websocket").client;

const client = new WebSocketClient();

console.log("# Gensokyo Radio WebSocket Client Demo");

client.on("connectFailed", function(error) {
    console.log("# Connection error: " + error.toString());
});

client.on("connect", function(connection) {
    var clientId;

    function sendMessage(message) {
        console.log("< " + message);
        connection.sendUTF(message);
    }

    console.log("# Connected");
    connection.on("error", function(error) {
        console.log("# Connection error: " + error.toString());
    });
    connection.on("close", function() {
        console.log("# Connection closed");
    });
    connection.on("message", function(message) {
        if (message.type === "utf8") {
            console.log("> " + message.utf8Data);

            if (message.utf8Data.startsWith("welcome:")) {
                //Keep the client ID for ponging
                clientId = message.utf8Data.split("welcome:")[1];
                console.log("# Client ID received: " + clientId);
            } else if (message.utf8Data === "ping") {
                //Pong
                sendMessage("pong:" + clientId);
            } else if (isJsonString(message.utf8Data)) {
                //Json for the song info
                const json = JSON.parse(message.utf8Data);
                console.log("# Song information received:");
                console.log("# Title: " + json.title);
                console.log("# Artist: " + json.artist);
                console.log("# Album: " + json.album);
                console.log("# Circle: " + json.circle);
            }
        }
    });

    //Call this to get client ID and information about currently playing song
    sendMessage("grInitialConnection");
});

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

client.connect("wss://gensokyoradio.net/wss");
