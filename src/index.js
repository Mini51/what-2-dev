const express = require('express'); 
const mongoose = require('mongoose'); 
const path = require('path');
const config = require('./config.json');
const Ideas = require('./models/ideas');

//setup app 
const app = express();
app.use(express.json());
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); 

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
    res.render('index');
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
    if(!req.body.title || !req.body.description) { 
        return res.json({
            status: 'error',
            data: 'Title and description are required'
        });
    }  
    // if there is more then 50 characters in the title, reject the idea 
    if(req.body.title.length > 50) {
        return res.json({
            status: 'error',
            data: 'title must be less than 50 characters'
        });
    }
    if(req.body.description.length > 3000) {
        return res.json({
            status: 'error',
            data: 'description must be less than 3000 characters'
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
        res.json({
            status: 'success',
            data: idea.title
        });
    }).catch(err => {
        console.log(err);
        res.send('there was a error creating a new idea');
    });
});


app.get('/post', (req, res) => { 
    res.render('post');
});

app.listen(config.server.port, () => { 
    console.log(`🚀:Server is listening on port ${config.server.port}`); 
});

