const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const PORT = 3001;
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to serve notes.html
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'notes.html'))
);

// Route to get all notes
app.get('/api/notes', (req, res) => {
    console.log('GET request received at /api/notes');
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to read notes' });
        }
        const notes = JSON.parse(data);
        res.json(notes);
    });
});

// Route to add a new note
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);

    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuidv4()
        };

        fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ error: 'Failed to read notes' });
            }

            const parsedNotes = JSON.parse(data);
            parsedNotes.push(newNote);

            fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(parsedNotes, null, 4), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing file:', writeErr);
                    return res.status(500).json({ error: 'Failed to add note' });
                }
                res.status(201).json(newNote);
            });
        });
    } else {
        res.status(400).json({ error: 'Title and text are required' });
    }
});

// Route to delete a note
app.delete('/api/notes/:id', (req, res) => {
    console.log('DELETE request received at /api/notes/:id');
    const { id } = req.params;

    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to read notes' });
        }

        const notes = JSON.parse(data);
        const updatedNotes = notes.filter(note => note.id !== id);

        fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(updatedNotes, null, 4), (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                return res.status(500).json({ error: 'Failed to delete note' });
            }
            res.status(200).json(updatedNotes);
        });
    });
});

// Route to serve index.html
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.listen(PORT, () =>
    console.log(`Express server listening on port ${PORT}!`)
);