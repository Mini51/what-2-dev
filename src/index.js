const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config.json');
const filterdWoerds = require('./filterdWords');
const Ideas = require('./models/ideas');
const staticPath = path.join(__dirname, 'static');

// setup app
const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(staticPath));

try {
    mongoose.connect(config.mongo.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('✅:Connected to MongoDB');
} catch (err) {
    console.log('❌:Error connecting to MongoDB');
    console.log(err);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(staticPath, 'about.html'));
});

app.get('/random', (req, res) => {
    Ideas.countDocuments({}, (err, count) => {
        if (err) {
            console.log(err);
            res.send('error');
        } else {
            const random = Math.floor(Math.random() * count);
            Ideas.findOne().skip(random).exec((err, idea) => {
                if (err) {
                    console.log(err);
                    res.send('error');
                } else {
                    res.render('random', {
                        title: idea.title,
                        description: idea.description,
                        createdAt: idea.createdAt
                    });
                }
            });
        }
    });
});

app.post('/post', (req, res) => {
    if (!req.body.title || !req.body.description) {
        return res.status(400).json({message: 'Please enter a title and description'});
    }
    if (req.body.title.length > 75) {
        return res.status(400).json({message: 'Title must be less than 75 characters'});
    }
    if (req.body.description.length > 300) {
        return res.status(400).json({message: 'Description must be less than 300 characters'});
    }
    if (req.body.title.length < 3) {
        return res.status(400).json({message: 'Title must be at least 3 characters'});
    }
    if (filterdWoerds.some(word => req.body.title.includes(word)) || filterdWoerds.some(word => req.body.description.includes(word))) {
        return res.status(400).json({message: 'The title or description contains a filterd word'});
    }

    let cleanTitle = req.body.title.replace(/<script>/g, '');
    let cleanDescription = req.body.description.replace(/<script>/g, '');


    const idea = new Ideas({title: cleanTitle, description: cleanDescription, createdAt: Date.now()});

    idea.save().then(idea => {
        console.log(`✅:New idea created: ${cleanTitle}`);
        res.status(201).json({message: 'New idea created'});
    }).catch(err => {
        console.log(err);
        res.status(400).json({message: 'Error creating idea'});
    });
});

app.get('/post', (req, res) => {
    res.render('post');
});

app.listen(config.server.port, () => {
    console.log(`🚀:Server is listening on port ${
        config.server.port
    }`);
});
