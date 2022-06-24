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
    res.send('home page of What2Dev'); 
});


// random idea 
app.get('/random', (req, res) => { 
    // get a random idea 
    Ideas.findOne().then(idea => {
        res.render('random',{
            title: idea.title, 
            description: idea.description,
            createdAt: idea.createdAt
        });
    }).catch(err => {
        console.log(err);
        res.send('there was a error getting a random idea'); 
    });
});

app.post('/post', (req, res) => {
    // create a new idea
    if(!req.body.title || !req.body.description) { 
        return res.send('you need to provide a title and description'); 
    }  
    // if there is more then 50 characters in the title, reject the idea 
    if(req.body.title.length > 50) {
        return res.send('the title is too long');
    }
    if(req.body.description.length > 3000) {
        return res.send('the description is too long');
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
        res.redirect('/random');
    }).catch(err => {
        console.log(err);
        res.send('there was a error creating a new idea');
    });
});

app.listen(config.server.port, () => { 
    console.log(`🚀:Server is listening on port ${config.server.port}`); 
});

