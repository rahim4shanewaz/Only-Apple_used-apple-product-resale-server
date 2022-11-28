const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();



const port = process.env.PORT || 5000;
const app = express();

// console.log(process.env.TOKEN)
// console.log(process.env.REACT_MONGODB_USER)
// console.log(process.env.REACT_MONGODB_PASS)

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.REACT_MONGODB_USER}:${process.env.REACT_MONGODB_PASS}@cluster0.upngnl9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




function verifyJWt(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}




async function run(){
    try{

        const serviceCollection = client.db('interior-services').collection('services');
        const usersCollection = client.db('re-sell-services').collection('user');
        const categories_macBook_Collection = client.db('categories').collection('apple-mac');
        const categories_iPhone_Collection = client.db('categories').collection('home-accessories');
        const categories_accessories_Collection = client.db('categories').collection('iphone');

        app.get('/allservices', async (req, res) =>{
           
            const query ={};
            const cursor =  serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });




        app.get('/macBook', async (req, res) =>{
           
            const query ={};
            const cursor =  categories_macBook_Collection.find(query);
            const macBooks = await cursor.toArray();
            res.send(macBooks);
        });
        
        app.get('/iphone', async (req, res) =>{
           
            const query ={};
            const cursor =  categories_iPhone_Collection.find(query);
            const iphones = await cursor.toArray();
            res.send(iphones);
        });
        app.get('/accessories', async (req, res) =>{
           
            const query ={};
            const cursor =  categories_accessories_Collection.find(query);
            const accessories = await cursor.toArray();
            res.send(accessories);
        });




        app.get('/categories/macBook', async (req, res) =>{
           
            const query ={};
            const cursor =  categories_macBook_Collection.find(query);
            const macBooks = await cursor.toArray();
            res.send(macBooks);
        });
        app.get('/categories/iphone', async (req, res) =>{
           
            const query ={};
            const cursor =  categories_iPhone_Collection.find(query);
            const iphones = await cursor.toArray();
            res.send(iphones);
        });
        app.get('/categories/accessories', async (req, res) =>{
           
            const query ={};
            const cursor =   categories_accessories_Collection.find(query);
            const accessories = await cursor.toArray();
            res.send(accessories);
        });














        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send(user);
        })


        

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })


        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.role === 'buyer' });
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });













    }
    finally{

    }
}
run().catch(err => console.log(err));






















app.get('/', async (req, res) => {
    res.send('server is running');
})
app.listen(port, () => console.log(`server running on ${port}`))