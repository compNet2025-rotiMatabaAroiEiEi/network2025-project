import { io } from "socket.io-client";

export const socket = io("http://192.168.1.118:5000");

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