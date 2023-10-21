const express = require('express');
const cors = require('cors');
const dotEnv = require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//client request handler function
const clientRequestHandler = express();
const database_name = 'brandShop';
const brands_collection_name = 'brands';
const banner_collection_name = 'banner';
const products_collection_name = 'products';
const advertisement_collection_name = 'advertisement';
const cart_collection_name = 'cart';
const currentoffer_collection_name = 'currentOffer';


//middlewares
clientRequestHandler.use(cors());
clientRequestHandler.use(express.json());



const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2jixdw6.mongodb.net/?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// mongoClient.addListener('connectionCreated', (event) => console.log(event));
// mongoClient.addListener('connectionClosed', (event) => console.error(event));


async function serverRunning() {
    console.log("Server running");
    try {
        await mongoClient.connect();

        clientRequestHandler.get('/brands', async (request, response) => {
            const brandsCollection = mongoClient.db(database_name).collection(brands_collection_name);
            const brands = await brandsCollection.findOne();
            response.send(brands);
        });

        clientRequestHandler.get('/banner', async (request, response) => {
            const bannerCollection = mongoClient.db(database_name).collection(banner_collection_name);
            const banner = await bannerCollection.findOne();
            response.send(banner);
        });

        clientRequestHandler.post('/addproduct', async (request, response) => {
            const productsCollection = mongoClient.db(database_name).collection(products_collection_name);
            const newProduct = request.body;
            const addedProduct = await productsCollection.insertOne(newProduct);
            response.send(addedProduct);
        })

        clientRequestHandler.get('/allproducts/:name', async (request, response) => {
            const productsCollection = mongoClient.db(database_name).collection(products_collection_name);
            const brand = request.params.name;
            const query = { brand: brand };
            const allProductsCursor = productsCollection.find(query);
            const allProducts = await allProductsCursor.toArray();
            response.send(allProducts);
        })

        clientRequestHandler.get('/product/:id', async (request, response) => {
            const productsCollection = mongoClient.db(database_name).collection(products_collection_name);
            const id = request.params.id;
            const query = { _id: id };
            const product = await productsCollection.findOne(query);
            response.send(product);
        })

        clientRequestHandler.get('/advertisement', async (request, response) => {
            const advertisementCollection = mongoClient.db(database_name).collection(advertisement_collection_name);
            const advertisementsCursor = advertisementCollection.find();
            const advertisements = await advertisementsCursor.toArray();
            response.send(advertisements);
        })

        clientRequestHandler.get('/productdetails/:id', async (request, response) => {
            const productsCollection = mongoClient.db(database_name).collection(products_collection_name);
            const id = request.params.id;
            const query = { _id: new ObjectId(id) };
            const product = await productsCollection.findOne(query);
            response.send(product);
        })

        clientRequestHandler.post('/addcart/:id', async (request, response) => {
            const cartCollection = mongoClient.db(database_name).collection(cart_collection_name);
            const cart = request.body;
            const storeCart = await cartCollection.insertOne(cart);
            response.send(storeCart);
        })
        clientRequestHandler.get('/removecart/:id', async (request, response) => {
            const cartCollection = mongoClient.db(database_name).collection(cart_collection_name);
            const query = { _id: new ObjectId(request.params.id) };
            const deletedCartItem = await cartCollection.deleteOne(query);
            response.send(deletedCartItem);

        })

        clientRequestHandler.get('/cart/:uid', async (request, response) => {
            const cartCollection = mongoClient.db(database_name).collection(cart_collection_name);
            const uid = request.params.uid;
            const query = { userId: uid };
            const cartedProductsCursor = cartCollection.find(query);
            const cartedProductsOfUser = await cartedProductsCursor.toArray();
            response.send(cartedProductsOfUser);
        })

        clientRequestHandler.patch('/updateproduct/:id', async (request, response) => {
            const productsCollection = mongoClient.db(database_name).collection(products_collection_name);
            const updateFields = request.body;
            const productId = request.params.id;
            const query = { _id: new ObjectId(productId) };
            const updates = {
                $set: {
                    name: updateFields[0],
                    image: updateFields[1],
                    type: updateFields[2],
                    price: updateFields[3],
                    rating: updateFields[4],
                    brand: updateFields[5]
                },
            };
            const updatedProduct = await productsCollection.updateOne(query, updates);
            console.log(updatedProduct);
            response.send(updatedProduct);
        })

        clientRequestHandler.get('/currentoffer', async (request, response) => {
            const currentOfferCollection = mongoClient.db(database_name).collection(currentoffer_collection_name);
            const currentOffer = await currentOfferCollection.findOne();
            response.send(currentOffer);
        });


    } finally {

    }
}

serverRunning().catch((reason) => console.log(reason));


clientRequestHandler.get('/', (req, res) => {
    res.send("Brand Shop server is running");
})



clientRequestHandler.listen(port, () => {
    console.log(`Brand Shop Server is running at port ${port}`);
})
