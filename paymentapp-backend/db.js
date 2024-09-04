const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/paytm');

mongoose.connect("mongodb+srv://admin:password@cluster0.nbknzly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
); 

const bcrypt = require('bcrypt');   

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
            ,

            role: {
                type: String,
                enum: ['customer', 'admin']
            }
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.role === 'admin') {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const bankSchema = new mongoose.Schema({
    bankname: {
        type: String,
        required: true,
    }
})

const User = mongoose.model("User", userSchema);
const Bank = mongoose.model("Bank", bankSchema);

const accountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    , banks: [
        {
            bankId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bank' },
            balance: { type: Number, required: true }
        },
    ],
    currentPrimaryBankId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bank' }
}
)

const Account = mongoose.model("Account", accountSchema);
module.exports = { User, Bank, Account };
