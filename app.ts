import { config } from "dotenv"
import  mongoose  from "mongoose"
import express, { request } from 'express'


// Process .env file
config();

const { APP_PORT, DB_CONNECT } = process.env;

if (!APP_PORT){
	throw new Error("Please ensure that APP_PORT is defined in your .env file.");
}

if (!DB_CONNECT){
	throw new Error("Please ensure that DB_CONNECT is defined in your .env file.");
}

const app 		= express();

// body-parser - allows us to read $req.body
app.use(express.json());

const dbConnect = async () => {
	return new Promise((resolve: any, reject: any) => {
		mongoose.connect(DB_CONNECT as string, { 
			useNewUrlParser: true, 
			useUnifiedTopology: true,
			useCreateIndex: true
		}).then(resolve).catch(reject)
	});
}


dbConnect().then((e) => {
	console.log("Connected to MongoDb");
	app.listen(APP_PORT, () => {
		console.log(`Listining on port ${APP_PORT} at http://localhost:${APP_PORT}/`);
	});
}).catch(e => {
	console.log(`Unable to connect to MongoDb with error: ${e.message}`);
})

// App Routes
app.use("/", require("./app/routes/auth"));