const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();

app.use(express.static('public'))

app.use(express.json());

const db = new sqlite3.Database('addresses.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS addresses (id INTEGER PRIMARY KEY AUTOINCREMENT, address TEXT, latitude REAL, longitude REAL)");
});


app.post('/addresses', (req, res) => {
    const { address, latitude, longitude } = req.body;
    if (!address || address.trim() === "") {
        res.status(400).send("Address cannot be empty");
        return;
    }

    db.get("SELECT MAX(id) AS maxId FROM addresses", (err, row) => {
        if (err) {
            console.error("Error retrieving max id:", err);
            res.sendStatus(500);
            return;
        }

        const newId = row.maxId ? row.maxId + 1 : 1;

        const stmt = db.prepare("INSERT INTO addresses (id, address, latitude, longitude) VALUES (?, ?, ?, ?)");
        stmt.run(newId, address, latitude, longitude, (insertErr) => {
            if (insertErr) {
                console.error("Error inserting address:", insertErr);
                res.sendStatus(500);
                return;
            }
            res.sendStatus(200);
        });
        stmt.finalize();
    });
});


app.get('/addresses', (req, res) => {
    db.all("SELECT * FROM addresses", (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(rows);
        }
    });
});

app.delete('/addresses', (req, res) => {
    
    db.run("DELETE FROM addresses", function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            console.log("All data removed from the addresses table");
            res.sendStatus(200); 
        }
    });
});


app.delete('/markAsVisited/:id', (req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM addresses WHERE id = ${id}`
    db.run(query, function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            console.log("All data removed from the addresses table");
            res.sendStatus(200); 
        }
    });
})


app.listen(3000, function(){
    console.log('Server is running at 3000');
})