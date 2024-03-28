const express = require('express');
const morgan = require('morgan');





//IMPORT ANY ROUTER MODULES
const employeesRouter = require('./routes/employees'); // Will look for index.js
const customersRouter = require('./routes/customers');

// create an instance of an express app
const app = express();

// Configure a folder to serve static content
app.use(morgan('tiny'));
app.use(express.static('public'));
app.use(express.json()); // capture data in a post and assign to req.body
app.use(express.urlencoded({ extended: true }));

// INJECT OUR ROUTERS INTO THE APP
app.use('/api/employees', employeesRouter);
app.use('/api/customers', customersRouter);

// create an endpoint to handle a GET for /
app.get('/', (req, res) => {
    res.send('Hello from /');
});









app.listen('3000', () => {
    console.log("Now listening on port 3000");
});