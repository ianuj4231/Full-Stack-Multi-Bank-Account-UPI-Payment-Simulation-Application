const express= require("express")
const {adminJwtAuthenticateMiddleware, adminZodMiddleware} = require("../middlewares/adminMiddleware")
const router  =express.Router();
const bcrypt = require("bcrypt");
const {Bank, User}  = require("../db")
const saltRounds = 10;
const jwt  = require("jsonwebtoken");
const JWT_SECRET =  require("../config")


router.get("/signin", async function(req, res, next){
    //first do email checking
    const obj = await User.findOne({ username: req.body.username});
    if(!obj){
        return res.status(401).send('Invalid username or password');
    }
    //second do password checking            //entered one  // in db
    const isMatch = await bcrypt.compare(req.body.password, obj.password);
    if(!isMatch){
            return res.status(401).json({message : "not authenticated due to invalid credentials"});
    }  
    const paylaod = {  userId: obj._id ,  role: obj.role, username : obj.username};
    const token = jwt.sign(paylaod, JWT_SECRET);
    res.status(200).json({ token });
})

router.put("/changePassword",adminJwtAuthenticateMiddleware, adminZodMiddleware,  async function (req, res, next) {
  console.log("can change password");
  const {oldPwd, newPwd} =  req.body;
  const entireRow = await User.findOne({username: req.user.username}); 
                                        //entered     // (hashed/db)
    const isMatch =await bcrypt.compare(oldPwd,   entireRow.password);
    if(!isMatch){
        return res.json({message : "old password u entered is wrong"});
    }
  const hashedPassword = await bcrypt.hash(newPwd, saltRounds);
  await User.updateOne({username : req.user.username}, {$set: {password: hashedPassword}})
  res.status(200).json({message : "changed"})
})

router.post("/addBankToDb",adminJwtAuthenticateMiddleware, async function(req, res){
    const {bankname}=  req.body;
    const obj = await Bank.find({bankname});
    if(obj){
        res.json({message: "bank name already exists in db"});
        return;
    }
    await Bank.create({bankname});
    return res.status(200).json({message :"bank added to db "});
})

router.delete("/deleteBankFromDb", adminJwtAuthenticateMiddleware, async  function(req, res, next){
    await Bank.deleteOne({_id: req.body.bankId});
    return res.json({message : "bank deleted from db"})
})

router.get("/searchBulkBank", adminJwtAuthenticateMiddleware, async  function(req, res, next){
    let  searchWord = req.query.searchWord
    searchWord = String(searchWord)
    let banks = await Bank.find({
        bankname: { $regex: searchWord, $options: 'i' }
    });

    banks= banks.map(x=> {return x.bankname});
    res.json(banks);
})

module.exports = router;