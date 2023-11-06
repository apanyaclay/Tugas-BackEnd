import express from 'express'
import mysql from 'mysql2'

const app = express()
app.use(express.json());

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'store_db'
})

const hostname = '127.0.0.1'
const port = 9000

conn.connect(err => {
    if(err){
        console.error('Database is disconnect!')
        console.error(err)
    }else {
        console.log("Database is connected")
    }
})

app.get('/todos', (req, res) => {
    let sql = "SELECT *, IF(completed, 'true', 'false') AS completed FROM `todos`";

    conn.query(sql, (err, result) => {
        if (err) {
            res.status(500).json({"status": 500,
                                "error": err,})
        } else {
            res.status(200).json({"status": 200,
                            "response": result})
        }
    })
})

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT *, IF(completed, 'true', 'false') AS completed FROM `todos` WHERE id = ?";
    const value = [id];
    conn.query(sql, value, (err, result) => {
        if (err) {
            res.status(500).json({"status": 500,
                                "error": err,});
        } else {
            if (result.length === 0) {
                res.status(404).json({"status": 404,
                                "message": "Todo is not found"})
            } else {
            res.status(200).json({"status": 200,
                                "response": result});
            }
        }
    })
})

app.post('/todos', (req, res) => {
    const title = req.query.title;
    let completed = req.query.completed;
    if (!title) {
        res.status(404).json({"status": 404,
                            "message": "Title is required"})
    }
    if (!completed) {
        completed = 0;
    }
    if (completed === "true") {
        completed = 1
    } else {
        completed = 0
    }
    const sql = "INSERT INTO `todos` (title, completed) VALUES (?, ?)";
    const values = [title, completed];
    conn.query(sql, values, (err, result) => {
        if (err) {
            res.status(500).json({"status": 500,
            "error": err});
        } else {
            res.status(201).json({"status": 201,
                                "response": {id : result.insertId,
                                    ...req.query}});
        }
    })
})

app.put('/todo/:id', (req, res) => {
    const id = req.params.id;
    const title = req.query.title;
    let completed = req.query.completed;
    if (!title) {
        res.status(404).json({"status": 404,
                            "message": "Title is required"})
    }
    if (!completed) {
        res.status(404).json({"status": 404,
                            "message": "Complated is required"})
    }
    if (completed === "true") {
        completed = 1
    } else {
        completed = 0
    }
    const sql = "UPDATE `todos` SET title=?, completed=? WHERE id=?";
    const values = [title, completed, id];
    conn.query(sql, values, (err, result) => {
        if (err) {
            res.status(500).json({"status": 500,
                                "error": err});
        } else {
            if (result['affectedRows'] === 0) {
                res.status(404).json({"status": 404,
                                "message": "Todo is not found"})
            } else {
            res.status(200).json({"status": 200,
                                "response": {id : req.params.id,
                                    ...req.query}});
            }
        }
    })
})

app.delete('/todo/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM `todos` WHERE id=?";
    const value = [id];
    conn.query(sql, value, (err, result) => {
        if (err) {
            res.status(500).json({"status": 500,
                                "error": err})
        } else {
            if (result['affectedRows'] === 0) {
                res.status(404).json({"status": 404,
                                "message": "Todo is not found"})
            } else {
                res.json({"status": 200,
                        "message": "Todo "+id+" deleted successfully"})
            }
        }
    })
})

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}`)
})