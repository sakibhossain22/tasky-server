const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT | 5000

// middleWare
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://tasky-cb8ab.firebaseapp.com',
        'https://tasky-cb8ab.web.app'
    ],
    credentials: true
}))
app.use(express.json())
// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.60qibw3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const taskCollection = client.db('task-collection').collection('tasks')


        app.get('/all-tasks', async (req, res) => {
            const email = req?.query.email
            const todoQ = { email: email, status : 'Todo' }
            const todo = await taskCollection.find(todoQ).toArray()
            const ongoingQ = { email: email, status : 'Ongoing' }
            const ongoing = await taskCollection.find(ongoingQ).toArray()
            const completedQ = { email: email, status : 'Completed' }
            const completed = await taskCollection.find(completedQ).toArray()
            const result = await taskCollection.find().toArray()
            console.log({todo, ongoing, completed,result});
            return res.send({todo, ongoing, completed,result})
        })
        app.get('/home-stat', async (req, res) => {
            const email = req?.query.email;
            const query = { email: email };
            const result = await taskCollection.find(query).toArray();
        
            // Create a new array with reversed order
            const reversedResult = [...result].reverse();
        
            res.send(reversedResult);
        });
        

        app.post('/my-task', async (req, res) => {
            const data = req.body
            const result = await taskCollection.insertOne(data)
            res.send(result)
        })

        // manage delivery
        app.patch('/update-status/:id', async (req, res) => {
            try {
                const id = req.params.id
                const data = req.body
                const query = { _id: new ObjectId(id) }
                const options = { upsert: true };
                const doc = {
                    $set: {
                        status: data?.status
                    }
                }
                const result = await taskCollection.updateOne(query, doc, options)
                res.send(result)
            } catch (error) {
                console.log(error);
            }
        })
        app.patch('/update-status/:id', async (req, res) => {
            try {
                const id = req.params.id
                const data = req.body
                const query = { _id: new ObjectId(id) }
                const options = { upsert: true };
                const doc = {
                    $set: {
                        status: data?.status
                    }
                }
                const result = await taskCollection.updateOne(query, doc, options)
                res.send(result)
            } catch (error) {
                console.log(error);
            }
        })



        app.delete('/task/:id', async (req, res) => {
            const user = req.params.id
            const query = { _id: new ObjectId(user) }
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task Manager Is Going')
})
app.listen(port, console.log('Task Manager is running'))