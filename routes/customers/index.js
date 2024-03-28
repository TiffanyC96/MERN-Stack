const express=require('express');
const Database = require('better-sqlite3');

const router = express.Router();
const db = Database(process.cwd() + '/database/chinook.sqlite')

router.get('/', (req,res)=>{
    // get customers from database
    const statement = db.prepare('SELECT * FROM customers');
     const data = statement.all();

     res.json(data);

})




module.exports = router;