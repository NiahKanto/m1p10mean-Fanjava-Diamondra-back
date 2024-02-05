const {MongoClient} = require('mongodb');

require('dotenv').config();
const connectionString = process.env.MONGO_URL;
const db = 'salon';

let client = null;

async function connectToDB(){
    if(!client){
        client = await MongoClient.connect(connectionString, { useUnifiedTopology: true });
    }
    return client.db(db);
}

module.exports = {connectToDB}