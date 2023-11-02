const express = require('express');
const cors = require('cors');
const dotEnv = require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const cookieParser = require('cookie-parser');

//client request handler function
const clientRequestHandler = express();
const JWT_SECRET = process.env.JWT_SECRECT_KEY;
const database_name = 'brandShop';
const brands_collection_name = 'brands';
const banner_collection_name = 'banner';
const products_collection_name = 'products';
const advertisement_collection_name = 'advertisement';
const cart_collection_name = 'cart';
const currentoffer_collection_name = 'currentOffer';
const mostsold_collection_name = 'mostSold';


//middlewares
clientRequestHandler.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
})); // third party middlewares
clientRequestHandler.use(express.json());
clientRequestHandler.use(cookieParser());
clientRequestHandler.use('/brands', (req, res, next) => {
    console.log("App level specific route middleware");
    next();
}); //app level custom middlewarae example with specific route

clientRequestHandler.use((req, res, next) => {
    console.log("App level all routes middleware");
    next();
})


const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.2jixdw6.mongodb.net/?retryWrites=true&w=majority`;

const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const verifyUser = (request, response, next) => {
    const token = request.cookies?.ACCESS_TOKEN;
    console.log(token);
    if (token) {
        jwt.verify(token, process.env.JWT_SECRECT_KEY, {
            algorithms: 'HS512',
            expiresIn: '1d',
        }, (error, decoded) => {
            if (decoded) {
                console.log(decoded);
                response.user = decoded;
                next();
            } else {
                console.log(error);
                response.status(401).send({ message: 'Unauthorized user' });
            }
        })
    } else {
        return response.status(401).send({ message: 'Unauthorized user' });
    }
}


clientRequestHandler.post('/api/v1/token', (request, response) => {
    console.log(request.body);
    jwt.sign(request.body, process.env.JWT_SECRECT_KEY, {
        algorithm: 'HS512',
        expiresIn: '1d',
    }, (error, token) => {
        if (token) {
            response.cookie('ACCESS_TOKEN', token, { httpOnly: true, secure: true, sameSite: 'none' }).send({ user: 'valid', token });
        } else {
            response.send({ user: 'unauthorized', error: error });
        }
    });

});


//example of a route level custom middlewire
clientRequestHandler.get('/brands', (req, res, next) => {
    console.log("Rote level middleware");
    next();
}, async (request, response) => {
    try {
        await mongoClient.connect();
        const brandsCollection = mongoClient.db(database_name).collection(brands_collection_name);
        const brands = await brandsCollection.findOne();
        response.send(brands);

    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }
});

clientRequestHandler.get('/banner', async (request, response) => {
    try {
        await mongoClient.connect();
        const bannerCollection = mongoClient.db(database_name).collection(banner_collection_name);
        const banner = await bannerCollection.findOne();
        response.send(banner);
    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }

});

clientRequestHandler.post('/addproduct', async (request, response) => {
    try {
        await mongoClient.connect();
        const productsCollection = mongoClient.db(database_name).collection(products_collection_name);
        const newProduct = request.body;
        const addedProduct = await productsCollection.insertOne(newProduct);
        response.send(addedProduct);

    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }


})

clientRequestHandler.get('/allproducts/:name', async (request, response) => {
    try {
        await mongoClient.connect();
        const productsCollection = mongoClient.db(database_name).collection(products_collection_name);
        const brand = request.params.name;
        const query = { brand: brand };
        const allProductsCursor = productsCollection.find(query);
        const allProducts = await allProductsCursor.toArray();
        response.send(allProducts);

    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }

})

clientRequestHandler.get('/product/:id', async (request, response) => {
    try {
        await mongoClient.connect();
        const productsCollection = mongoClient.db(database_name).collection(products_collection_name);
        const id = request.params.id;
        const query = { _id: id };
        const product = await productsCollection.findOne(query);
        response.send(product);

    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }

})

clientRequestHandler.get('/advertisement', async (request, response) => {
    try {
        await mongoClient.connect();
        const advertisementCollection = mongoClient.db(database_name).collection(advertisement_collection_name);
        const advertisementsCursor = advertisementCollection.find();
        const advertisements = await advertisementsCursor.toArray();
        response.send(advertisements);

    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }
})

clientRequestHandler.get('/productdetails/:id', async (request, response) => {
    try {
        await mongoClient.connect();
        const productsCollection = mongoClient.db(database_name).collection(products_collection_name);
        const id = request.params.id;
        const query = { _id: new ObjectId(id) };
        const product = await productsCollection.findOne(query);
        response.send(product);

    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }

})

clientRequestHandler.post('/addcart/:id', async (request, response) => {
    try {
        await mongoClient.connect();
        const cartCollection = mongoClient.db(database_name).collection(cart_collection_name);
        const cart = request.body;
        const storeCart = await cartCollection.insertOne(cart);
        response.send(storeCart);

    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }
})


clientRequestHandler.get('/removecart/:id', async (request, response) => {
    try {
        await mongoClient.connect();
        const cartCollection = mongoClient.db(database_name).collection(cart_collection_name);
        const query = { _id: new ObjectId(request.params.id) };
        const deletedCartItem = await cartCollection.deleteOne(query);
        response.send(deletedCartItem);

    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }
})

clientRequestHandler.get('/cart/:uid', verifyUser, async (request, response) => {
    const userId = request.params.uid;
    if (userId === response.user.uid) {
        try {
            console.log(userId);
            console.log(response.user.uid);
            await mongoClient.connect();
            const cartCollection = mongoClient.db(database_name).collection(cart_collection_name);
            const uid = request.params.uid;
            const query = { userId: uid };
            const cartedProductsCursor = cartCollection.find(query);
            const cartedProductsOfUser = await cartedProductsCursor.toArray();
            response.send(cartedProductsOfUser);

        } catch (error) {
            console.log(error);
        } finally {
            mongoClient.close();
        }
    } else {
        response.status(401).send({ message: 'Unauthorized' });
    }

})

clientRequestHandler.patch('/updateproduct/:id', async (request, response) => {
    try {
        await mongoClient.connect();
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

    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }


})

clientRequestHandler.get('/currentoffer', async (request, response) => {
    try {
        await mongoClient.connect();
        const currentOfferCollection = mongoClient.db(database_name).collection(currentoffer_collection_name);
        const currentOffer = await currentOfferCollection.findOne();
        response.send(currentOffer);
    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }

});

clientRequestHandler.get('/mostsold', async (request, response) => {
    try {
        await mongoClient.connect();
        const mostsoldCollection = mongoClient.db(database_name).collection(mostsold_collection_name);
        const mostSold = await mostsoldCollection.findOne();
        response.send(mostSold);
    } catch (error) {
        console.log(error);
    } finally {
        mongoClient.close();
    }


});





clientRequestHandler.listen(port, () => {
    console.log(`Brand Shop Server is running at port ${port}`);
})
