import { io } from "socket.io-client";

export const socket = io("http://localhost:5000"); //change to http://<<ip-address>>:5000 if different device

socket.on("connect", () => {
    console.log(socket.id);
    socket.emit("broadcast", "someone join");
    socket.emit("register", socket.id.toString().slice(0,2)); // Let username be first 2 letter of socket id (for testing)
    socket.emit("getUsers")
});

socket.on("message", (msg) => {
    console.log("Received:", msg);
});
socket.on("usersList", (list) =>{
    console.log(list);
    socket.emit("privateMessage", list[0], "whdjkla");
})
socket.on("getPrivateMessage", (from, msg) => {
    console.log(from, ": ", msg);
});