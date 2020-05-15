const express 	= require("express");
const dotenv  	= require("dotenv").config();
const mongoose 	= require("mongoose");

const app 		= express();


// body-parser - allows us to read $req.body
app.use(express.json());



mongoose
	.connect(process.env.DB_CONNECT, { 
		useNewUrlParser: true, 
		useUnifiedTopology: true,
		useCreateIndex: true
	})
	.then(() => console.log("DB Connected"))
	.catch(err => console.log(`DB Connection Error: ${err.message}`));



// App Routes
app.use("/user", require("./app/routes/auth"));


app.listen(process.env.APP_PORT, () => {
	console.log(`Listining on port ${process.env.APP_PORT} at http://localhost:${process.env.APP_PORT}/`);
});