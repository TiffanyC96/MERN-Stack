const express=require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const db = Database(process.cwd() + '/database/chinook.sqlite');
const Joi = require('joi');
const multer = require('multer');
const path = require('path');

const employeeSchema = Joi.object({
    LastName: Joi.string().max(20).required(),
    FirstName: Joi.string().max(20).required(),
    Title: Joi.string().max(30),
    ReportsTo: Joi.number().integer().positive(),
    BirthDate: Joi.date(),
    City : Joi.string().max(40)
});

console.log(__dirname + '/database/chinook.sqlite')

// GET ALL EMPLOYEES
router.get('/', (req, res) => {
    // define a query to send to the database
    const statement = db.prepare('SELECT * FROM employees');
    const data = statement.all();

    res.json(data);
});

router.get('/:id', (req, res) => {

    const statement = db.prepare('SELECT * FROM employees WHERE EmployeeId = ?');
    const data = statement.get(req.params.id);

    // It is possible that the ID doesnt exist. If that is the case, data is undefined
    if (data !== undefined) {
        res.json(data);
    } else {
        res.status(404).send();
    }
    console.log(data);

    // capture the id portion of the path and use it in my database query
    res.send(req.params.id);
});

router.post('/', (req, res) => {
    //Validate req.body
    // JavaScript Destructure
    const {error} = employeeSchema.validate(req.body,{abortEarly: false});
    if(error){
        return res.status(422).send(error.details);
    }

    // console.log(VALIDATION HAS PASSED);
    // console.log(validationResult.error.details);

    const columns = [];
    const parameters = [];
    const values = [];

    console.log(req.body);
    for (key in req.body) {  // loop to iterate JS Objects
        parameters.push('?');
        columns.push(key);
        values.push(req.body[key]);
    }

    // Build a database query that we can send to the database that will enter a new record
    let sql = `INSERT INTO employees (${columns.join(', ')}) VALUES (${parameters.join(', ')});`;
    console.log(sql);

    const statement = db.prepare(sql);
    const result = statement.run(values);

    console.log(result);

    res.status(201).json(result);
});

router.patch('/:id', (req, res) => {

    // Loop through each field in our req.body object
    // In order to dynamically build out a portion of the update statement

    const columns = [];
    const values = [];

    const{error} = employeeSchema.validate(req.body,{abortEarly:false});
    if(error){
        return res.status(422).send(error.details);
    }
    
    for (key in req.body) {
        // Append our keys for our UPDATE statement
        columns.push(`${key}=?`);

        // push the corresponding values into an array
        let id = values.push(req.body[key]);
    }

    // Push the id into the array
    values.push(req.params.id);
    // JSON data will be available in req.body
    const sql = `UPDATE employees SET ${columns.join(',')} WHERE EmployeeId = ?`;
    console.log(sql);
    const statement = db.prepare(sql);

    const result = statement.run(values);

    // Make sure a record was actually updated
    if (result.changes > 0) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }


});

// create an endpoint to delete an existing employee
router.delete('/:id', (req, res) =>{

    // Remove any references to the employee in the customers table
    const updateCustomerSql = `UPDATE customers SET SupportRepId = null WHERE SupportRepId = ?;`;
    const updateCustomerStatement = db.prepare(updateCustomerSql);
    const updateCustomerResult = updateCustomerStatement.run([req.params.id]);

    // Remove any references to the employee in the employee table
    const updateEmployeeSql = `UPDATE employees SET ReportsTo = null WHERE ReportsTo = ?;`;
    const updateEmployeeStatement = db.prepare(updateEmployeeSql);
    const updateEmployeeResult = updateEmployeeStatement.run([req.params.id]);

    // Remove any references to the employee in the employee table
   
    // Execute DELETE in Employees table
    const deleteSql = `DELETE FROM employees WHERE EmployeeId = ?`;
    const deleteStatement = db.prepare(deleteSql);
    const deleteResult = deleteStatement.run([req.params.id]);

    if(deleteResult.changes >0){
        res.json(deleteResult);
    } else{
        res.status(404).json(deleteResult);
    }

});

// Endpoint to handle file upload-- specify a path where the endpoint should go to
const storage = multer.diskStorage({
    destination: './public/images/employees',
    filename: function (req, file, callback) {
        callback(null, Date.now().toString() + path.extname(file.originalname)) // a function that multer executes. names the file that comes in its original name
    }
});

const upload = multer({ storage: storage }); // A middleware specifically for this endpoint
router.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file);
    res.json(req.body);
});

module.exports = router;