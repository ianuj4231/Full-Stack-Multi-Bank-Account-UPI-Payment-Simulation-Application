const {User} =  require("../db");
const mongoose = require('mongoose');

async function createAdmin() {
    try {
        await mongoose.disconnect();

        // await mongoose.connect('mongodb://127.0.0.1:27017/paytm');
        await mongoose.connect("mongodb+srv://admin:password@cluster0.nbknzly.mongodb.net/paytm?retryWrites=true&w=majority&appName=Cluster0"
          );  
          console.log("jdndenndejn");
                     
           await User.create({
            username: 'admin@gmail.com',
            password: 'adminPassword123@', 
            role: 'admin', 
            firstname: "jackson",
            lastname: "durai"
        });

        console.log('Admin user created successfully');

    } catch (error) {
                console.error('Error creating admin user:', error);
                await mongoose.disconnect();
    }
}

createAdmin();
