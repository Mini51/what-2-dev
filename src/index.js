const express = require('express'); 
const mongoose = require('mongoose'); 
const path = require('path');
const config = require('./config.json');
const Ideas = require('./models/ideas');

const staticPath = path.join(__dirname, 'static');

//setup app 
const app = express();
app.use(express.json());
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(staticPath));

// connect to mongoDB 
try { 
    mongoose.connect(config.mongo.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅:Connected to MongoDB'); 
} catch(err) {
    console.log('❌:Error connecting to MongoDB');
    console.log(err);
}


// home page 
app.get('/', (req, res) => { 
    // send file from ./static/index.html
    res.sendFile(path.join(staticPath, 'index.html'));
});


app.get('/about', (req, res) => {
    res.sendFile(path.join(staticPath, 'about.html'));
}); 


// random idea 
app.get('/random', (req, res) => { 
    // get a random idea 
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
                        createdAt: idea.createdAt,
                    });
                }
            });
        }
    });
});


app.post('/post', (req, res) => {
    // create a new idea
    console.log(req.body);
    
    if(!req.body.title || !req.body.description) { 
        return res.status(400).json({ 
            message: 'Please enter a title and description'
        }); 
    }  
    // if there is more then 50 characters in the title, reject the idea 
    if(req.body.title.length > 75) {
        return res.status(400).json({
            message: 'Title must be less than 75 characters'
        });
    }
    if(req.body.description.length > 300) {
        return res.status(400).json({
            message: 'Description must be less than 300 characters'
        });
    }
    //REMOVE XSS ATTACKS 
    let cleanTitle = req.body.title.replace(/<script>/g, '');
    let cleanDescription = req.body.description.replace(/<script>/g, '');


    const idea = new Ideas({
        title: cleanTitle,
        description: cleanDescription,
        createdAt: Date.now()
    });
    
    idea.save().then(idea => {
        console.log(`✅:New idea created: ${cleanTitle}`);
        res.status(201).json({ 
            message: 'New idea created', 
        });
    }).catch(err => {
        console.log(err);
        res.status(400).json({ 
            message: 'Error creating idea'
        });
    });
});


app.get('/post', (req, res) => { 
    res.render('post');
});

app.listen(config.server.port, () => { 
    console.log(`🚀:Server is listening on port ${config.server.port}`); 
});

