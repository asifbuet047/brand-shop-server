const express = require('express');
const cors = require('cors');
const dotEnv = require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

//client request handler function
const clientRequestHandler = express();

//middlewares
clientRequestHandler.use(cors());
clientRequestHandler.use(express.json());

//TegXvFh56RlNxeWV



const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2jixdw6.mongodb.net/?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

function run() {
    try {
        mongoClient.connect()
            .then((client) => console.log("Successfully connect with mongodb"))
            .catch((reason) => console.log(reason));

    } catch {
        mongoClient.close();
    }
}


run();

clientRequestHandler.listen(port, () => {
    console.log(`Brand Shop Server is running at port ${port}`);
})
