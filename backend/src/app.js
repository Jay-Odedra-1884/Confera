import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { ConnectToServer } from './controller/socketManager.js';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';

const app = express();
const server = createServer(app);
const io = ConnectToServer(server);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

//*seeting Routers
app.use("/api/v1/users", userRoutes)


const port = process.env.PORT || 8000

const start = () => {
    mongoose.connect("mongodb+srv://odedrajay1884:JNzv0GrMsOAZVKou@confera0.blsxpcz.mongodb.net/?retryWrites=true&w=majority&appName=Confera0")
    .then(() => {
        console.log("Database Connected..");
    })
    .catch((e) => {
        console.error("Error connecting to MongoDB:", e);
    })
    app.listen(port, () => {
        console.log(`server listing on port: ${port}`);
    })
}

start();