const express 	= require("express");
const dotenv  	= require("dotenv").config();
const mongoose 	= require("mongoose");

const app 		= express();
app.use(express.json());



mongoose.connect(process.env.DB_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true }, () => {
	console.log("Connected to DB");
});



// App Routes
app.use("/user", require("./app/routes/auth"));


app.listen(process.env.APP_PORT, () => {
	console.log(`Listining on port ${process.env.APP_PORT} at http://localhost:${process.env.APP_PORT}/`);
});