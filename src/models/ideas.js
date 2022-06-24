const mongoose = require('mongoose'); 

const ideaSchema = new mongoose.Schema({ 
    title: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    ideaID: {
        type: Number,
        default: 0
    }
});


module.exports = mongoose.model('Idea', ideaSchema); 

