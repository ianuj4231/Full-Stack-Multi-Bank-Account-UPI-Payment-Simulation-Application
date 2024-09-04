const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt");
const { User, Bank, Account } = require("../db");
const { signupMiddleware, zodMiddleware, customerJwtMiddleware } = require("../middlewares/customerMiddleware")
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config")


router.post('/signup', zodMiddleware, signupMiddleware, async function (req, res) {

    console.log("Router Working");
    const { username, password, firstname, lastname, bankId } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log("Attempting to create user");
        const obj = await User.create({
            username,
            password: hashedPassword,
            firstname,
            lastname,
            role: 'customer'
        });

        const payload = {
            userId: obj._id,
            username: obj.username,
            role: obj.role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
        console.log("token is " , token);
        
        console.log("User created, id:", obj._id);
        await Account.create({
            userId: obj._id,
            banks: [{
                bankId,
                balance: ((Math.random() * 1000).toFixed(2)) 
            }],

            currentPrimaryBankId: bankId

        });

        console.log("Account created successfully.");
        console.log("Sending response");
        return res.status(200).json({
            message: 'Created successfully', token});
        
    }   catch (error) {
        if (!res.headersSent) {
            if (error.code === 11000) {
                console.log("Duplicate user error");
                res.status(409).json({ message: "User with this username already exists." });
            } else {
                console.log("Internal server error");
                res.status(500).json({ message: "Internal server error" });
                console.log(error);
            }

        }

    }

});


router.post("/signin", async function (req, res, next) {
    const { username, password } = req.body;
    console.log("xxx");
    console.log(req.body);
    
    try {
        const obj = await User.findOne({ username });
        if (!obj) {
            console.log(obj);
            
            return res.status(401).json({message : 'Invalid username or password' });
        }
        console.log(obj);
        
        const isMatch = await bcrypt.compare(password, obj.password);
        if (!isMatch) {
            return res.status(401).send('Invalid username or password');
        }


        const token = jwt.sign({ role: obj.role, userId: obj._id, username: obj.username }, JWT_SECRET)
        res.status(200).json({ token })
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
})

router.put("/changePassword", customerJwtMiddleware, async function (req, res) {
    const obj = await User.findOne({ username: req.user.username });

    const isMatch = bcrypt.compare(req.body.oldPwd, obj.password);
    if (!isMatch) {
        return res.status(403).json({ message: "the old password u entered is wrong" })
    }
    const hashedPassword = await bcrypt.hash(req.body.newPwd, saltRounds);
    console.log("xx");

    await User.updateOne({ _id: req.user.userId }, {
        "$set": {
            password: hashedPassword
        }
    })

    // await User.updateOne({
    //     username : req.user.username, 
    // },{"$set":{password: hashedPassword}})
    return res.status(200).json({ message: "password changed" });
})


router.put("/addBankAccount", customerJwtMiddleware, async function (req, res, next) {
console.log("api hit ");

    try {
        const obj = await Account.findOne({ userId: req.user.userId });
        console.log("obj is : ", obj);
        if (obj.banks.length === 0) {
            await Account.updateOne({ userId: req.user.userId },
                {
                    $push: {                                                    // [ actual amount of customer ]   
                        banks: { bankId: req.body.bankId, balance: ((Math.random() * 1000).toFixed(2))  }
                    },
                    $set: {
                        currentPrimaryBankId: req.body.bankId
                    }
                }
            )

            return res.status(200).json({ message: "added bank account to your profile" })
        }

        const ifAlreadyAdded = obj.banks.some(x => x.bankId.toString() === req.body.bankId);
        if (ifAlreadyAdded === true) {
            return res.json({ message: "already added bank account" });
        }
        await Account.updateOne({ userId: req.user.userId }, { $push: { banks: { bankId: req.body.bankId, balance: ((Math.random() * 1000).toFixed(2))  } } })
        return res.json({ message: "added bank account to your profile" })
    } catch (error) {
        console.log("error ", error);

    }
})

router.put("/makePrimaryBank", customerJwtMiddleware, async function (req, res) {
    let obj = await Account.findOne({ userId: req.user.userId });
    let ifExists = obj.banks.some(x => x.bankId.toString() === req.body.bankId);
    if (ifExists === false) {
        return res.status(403).json({ message: "you dont have an account in this bank" });
    }
    await Account.updateOne({ userId: req.user.userId }, { "$set": { currentPrimaryBankId: req.body.bankId } });
    res.json({ message: "updated primary bank"})
})

router.get("/getBalance", customerJwtMiddleware, async function (req, res, next) {
    let obj = await Account.findOne({ userId: req.user.userId });

    let requiredBankId = obj.currentPrimaryBankId;
    let requiredBankDetails = obj.banks.find(x => x.bankId.toString() === requiredBankId.toString())
    console.log(requiredBankDetails);

    let balance = requiredBankDetails.balance;
    return res.json({ message: "balance from primary account", balance: balance  })
})


router.get("/searchBulkUsers", customerJwtMiddleware, async function (req, res, next) {
    try {
        let searchWord = req.query.searchWord
        console.log(searchWord);

        let users = await User.find({
            $and: [
                {
                    $or: [
                        { firstname: { $regex: searchWord, $options: 'i' } },
                        { lastname: { $regex: searchWord, $options: 'i' } }
                    ]
                },
                { role: "customer" }
                ,
                { _id: { $ne: req.user.userId } } 
            ]
        });
        
        users = users.map(function (x) {
          
            let fullname  = x.firstname + " " + x.lastname
            return {fullname, userId:  x._id};
            
        })
    //    console.log(users);
       
        res.json({users});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while searching for users." });
    }
})

router.get("/getCurrPrimary", customerJwtMiddleware, async (req, res, next) => {
    let obj = await Account.findOne({ userId: req.user.userId });
    console.log("in getCurrPrimary ", obj);
    // if(obj.banks.length === 0){
    //     return res.json({message: "no curr primary"})
    // }

    if(obj.banks.length===0){
        return res.json({message: "no curr primary"})
    }

    // let currentPrimaryBankId = obj?.currentPrimaryBankId?.toString();
    let currentPrimaryBankId = obj.currentPrimaryBankId.toString();
    
    return res.json({message: "sent currentPrimaryBankId from backend ", currentPrimaryBankId})
})

router.get("/getAllBanksOf1User", customerJwtMiddleware, async function (req, res) {
    console.log(req.userId);
    console.log("hit me");
    console.log("hit me");
    console.log("hit me");
    console.log("hit me");
    console.log("hit me");

    
    let obj = await Account.findOne({ userId: req.user.userId });
    let list1 = obj.banks;
    console.log(obj);
    if(!list1){
        return res.json({message : "no banks associated with this user"});
    }
    let currentPrimaryBankId = obj.currentPrimaryBankId.toString();
    console.log("currentPrimaryBankId ", currentPrimaryBankId);

    let list2 = list1.map(x => { return x.bankId });
    console.log("list2 ", list2);
    
    let list3 = list2.map(async (x) => {
        let bankobj = await Bank.findOne({ _id: x });

        return {bankname: bankobj.bankname, bankId: bankobj._id, currentPrimaryBankId };
    });
    let list4 = await Promise.all(list3);
    console.log("list4 ", list4);

    console.log(list4);
    res.json({ message: "fetched all banks of this particular user", list4, currentPrimaryBankId })
})

router.delete("/removeAccount", customerJwtMiddleware, async function (req, res, next) {
    console.log("entered remove account");
    
    let obj = await Account.findOne({ userId: req.user.userId });
    let listofbanks = obj.banks;
    console.log("typeof ", typeof (listofbanks[0].bankId)); // this prints - typeof  object

    console.log(req.body.bankId);

    if (!req.body.bankId)   // or if ===undefined or == null
    {
        return res.json({ message: " enter a bankId to be removed " });
    }

    if (req.body.bankId !== obj.currentPrimaryBankId.toString()) {
        let objx = await Account.updateOne({ userId: req.user.userId }, { $pull: { banks: { bankId: req.body.bankId } } });
        console.log(" objx ", objx);
        res.json({ message: "account deleted" })
    }
    else {
        let remaininglist = listofbanks.filter(x => x.bankId.toString() !== req.body.bankId)

        if (remaininglist.length === 0) {
            await Account.updateOne({ userId: req.user.userId }
                ,
                {
                    $set: {
                        currentPrimaryBankId: null
                    }
                    ,
                    $pull: { banks: { bankId: req.body.bankId } }
                }
            )

            return res.json({ message: "Account deleted" });

        }

        else {
            let firstObject = remaininglist[0];
            let firstbankId = firstObject.bankId;

            let madeNewPrimary = await Account.updateOne(
                { userId: req.user.userId },
                {
                    "$set": {
                        currentPrimaryBankId: firstbankId
                    },
                    "$pull": {
                        banks: { bankId: req.body.bankId }
                    }
                }
            );

            console.log("Made new primary and deleted account: ", madeNewPrimary);
            return res.json({ message: "Account deleted and primary bank updated" });
        }
    }
})



module.exports = router;