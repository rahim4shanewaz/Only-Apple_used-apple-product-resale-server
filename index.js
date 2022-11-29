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


        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }








        app.get('/allservices', async (req, res) =>{
           
            const query ={};
            const cursor =  serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });
        




        app.get('/macBook',verifyJWt, async (req, res) =>{
           
            const query ={};
            const cursor =  categories_macBook_Collection.find(query);
            const macBooks = await cursor.toArray();
            res.send(macBooks);
        });
        
        app.get('/iphone',verifyJWt, async (req, res) =>{
           
            const query ={};
            const cursor =  categories_iPhone_Collection.find(query);
            const iphones = await cursor.toArray();
            res.send(iphones);
        });
        app.get('/accessories',verifyJWt, async (req, res) =>{
           
            const query ={};
            const cursor =  categories_accessories_Collection.find(query);
            const accessories = await cursor.toArray();
            res.send(accessories);
        });




        app.get('/categories/macBook',verifyJWt, async (req, res) =>{
           
            const query ={};
            const cursor =  categories_macBook_Collection.find(query);
            const macBooks = await cursor.toArray();
            res.send(macBooks);
        });
        app.get('/categories/iphone',verifyJWt, async (req, res) =>{
           
            const query ={};
            const cursor =  categories_iPhone_Collection.find(query);
            const iphones = await cursor.toArray();
            res.send(iphones);
        });
        app.get('/categories/accessories',verifyJWt, async (req, res) =>{
           
            const query ={};
            const cursor =   categories_accessories_Collection.find(query);
            const accessories = await cursor.toArray();
            res.send(accessories);
        });






        app.get('/users/allbuyer', verifyJWt,verifyAdmin, async (req, res) => {
            const role = req.query.role;
            
            const query = {role:"buyer"};
            const buyer = await usersCollection.find(query).toArray();
            res.send(buyer);
        });





        


        app.get('/users/allseller', verifyJWt,verifyAdmin, async (req, res) => {
            const role = req.query.role;
            
            const query = {role:"seller"};
            const seller = await usersCollection.find(query).toArray();
            res.send(seller);
        });


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send(user);
        })

        // app.get('/users/buyer/', async (req, res) => {
           
        //     const query = { email }
        //     const user = await usersCollection.find(query);
        //     res.send({ isBuyer: user?.role === 'buyer' });
        // })


        

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


        app.delete('/buyer/:id', verifyJWt, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })
        app.delete('/seller/:id', verifyJWt, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        app.put('/seller/verify/:id', verifyJWt, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: 'verified'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
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