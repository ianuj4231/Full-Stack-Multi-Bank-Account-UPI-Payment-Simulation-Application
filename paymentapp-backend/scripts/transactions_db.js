//doing this after creating a table called dummy in db(paytm) 

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/paytm');



const dummySchema  = new mongoose.Schema({ balance: {type: Number} })
const dummyModel = mongoose.model("Dummy", dummySchema);

module.exports = dummyModel;