const express = require('express');
const cors = require('cors');
const dotEnv = require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

//client request handler function
const clientRequestHandler = express();
const database_name = 'brandShop';
const brands_collection_name = 'brands';
const products_collection_name = 'products';

//middlewares
clientRequestHandler.use(cors());
clientRequestHandler.use(express.json());


let brandNames = null;
let brandCountries = null;


const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2jixdw6.mongodb.net/?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

mongoClient.addListener('connectionCreated', (event) => console.log(event));
mongoClient.addListener('connectionClosed', (event) => console.error(event));


function getTechBrandsNamesAndLogos() {
    try {
        mongoClient.connect()
            .then((client) => {
                const brandShopDB = client.db(database_name);
                const brandShopCollection = brandShopDB.collection(brands_collection_name);
                brandShopCollection.findOne()
                    .then((document) => {
                        brandNames = document;
                    }, (reason) => {
                        console.log(reason);
                    })

            })
            .catch((reason) => console.log(reason));

    } finally {
        mongoClient.close();
    }
}
function getTechProduct() {
    try {
        mongoClient.connect()
            .then((client) => {
                const brandShopDB = client.db(database_name);
                const brandShopCollection = brandShopDB.collection(products_collection_name);
                const query = { brand_name: "Apple" };
                brandShopCollection.findOne(query)
                    .then((document) => {
                        console.log(document);

                    }, (reason) => {
                        console.log(reason);
                    })

            })
            .catch((reason) => console.log(reason));

    } finally {
        mongoClient.close();
    }
}


getTechBrandsNamesAndLogos();
getTechProduct();


clientRequestHandler.get('/', (req, res) => {
    res.send("Brand Shop server is running");
})

clientRequestHandler.get('/brands', (req, res) => {
    res.send(brandNames);
})

clientRequestHandler.listen(port, () => {
    console.log(`Brand Shop Server is running at port ${port}`);
})
