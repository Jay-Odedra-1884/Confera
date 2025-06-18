// import { connection } from 'mongoose';
import { Server } from 'socket.io';

let connection = {};
let messages = {};
let timeOnline = {};

const ConnectToServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            // credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`New client connected: ${socket.id}`);
        
        socket.on("join-call", (path) => {
            if(connection[path] === undefined) {
                connection[path] = [];
            }
            connection[path].push(socket.id);


            // connection = {
            //     "room123": ["socket1", "socket2"] this socket is represent a user
            // }

            for(let i = 0; i < connection[path].length; i++) {
                io.to(connection[path][i]).emit("user-joint", socket.id, connection[path])
            }

            if(messages[path] !== undefined) {
                // messsages = {
                //     "room123": ["message1", "message2"]
                // }
                for(let i = 0; i < messages[path].length; i++) {
                    io.to(socket.id).emit("chat-message", messages[path][i]['data'], messages[path][i]['sender'], messages[path][i]['socket-id-sender']);
                }
            }

        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {
            //to find a matchin room to send chat on this room to all users
            const [matchingRoom, found] = Object.entries(connection)
            .reduce(([room, isFound], [roomKey, roomValue]) => {
                if(!isFound && roomValue.includes(socket.id)) {
                    return [roomKey, true];
                }

                return [room, isFound];
            }, ['', false]);

            if(!found) {
                if(messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({"data": data, "sender": sender, "socket-id-sender": socket.id});
                console.log("message", matchingRoom, ":", sender, data);

                connection[matchingRoom].forEach(element => {
                    io.to(element).emit("chat-message", data, sender, socket.id)
                });
                
            }
        })

        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date());
            var key;

            for(const [k, v ] of JSON.parse(JSON.stringify(Object.entries(connection)))) {
                for(let i = 0; i < v.length; i++) {
                    if(v[a] === socket.id) {
                        key = k;

                        for(let j =0; j < connection[key].length; j++) {
                            io.to(connection[key][j]).emit('user-left', socket.id);
                        }

                        var index = connection[key].indexOf(socket.id);

                        connection[key].splice(index, 1);

                        if(connection[key].length === 0) {
                            delete connection[key]
                        }
                    }
                }
            }
        })
        
    })

    return io;
}

export { ConnectToServer }