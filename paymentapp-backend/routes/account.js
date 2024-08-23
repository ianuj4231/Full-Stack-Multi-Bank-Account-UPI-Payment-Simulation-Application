const express = require(
    "express"
);
const router = express.Router();

const mongoose = require('mongoose');

const { User, Account } = require("../db");
const { customerJwtMiddleware } = require("../middlewares/customerMiddleware");

router.post("/transfer", customerJwtMiddleware, async function (req, res) {
    console.log("Transfer endpoint hit");
    let sender_obj = await User.findOne({ _id: req.user.userId });
    let sender_account_obj  = await Account.findOne({userId: req.user.userId });
    if(sender_account_obj.banks.length === 0){
        return res.json({message: "pls add a bank account if you want to initiate a payment to the other person"});
    }
    
    let toId = req.body.toId;
    let transaction_amount = req.body.amount;

    let listx = await Account.find(); 
    // console.log(listx);
    let recobj  = listx.find(x=> x.userId.toString()=== toId );
    // console.log(recobj);
         
    let sender_fullname = sender_obj.firstname + " " + sender_obj.lastname;

    let receiver_account_obj = await Account.findOne({ userId:  recobj.userId});
    console.log(receiver_account_obj);
    let recuserobj = await User.findOne({_id: receiver_account_obj.userId});
    console.log("receiver_account_obj ", recuserobj.firstname);
    
    if (receiver_account_obj.banks.length===0) {
        return res.json({ message: `${sender_fullname} is trying to pay you. Add your bank account to receive payment` });
    }
    

////////////////////////////////////////////////////////////////////////////////////////////
    
try{
    const session = await mongoose.startSession();
    session.startTransaction();

    let sender_primary_id = sender_account_obj.currentPrimaryBankId;
    let receiver_primary_id = receiver_account_obj.currentPrimaryBankId;

    let sender_primary_bank_initial_data  = sender_account_obj.banks.find(x=> x.bankId.toString() === sender_primary_id.toString() );
    let receiver_primary_bank_initial_data = receiver_account_obj.banks.find(x=> x.bankId.toString() === receiver_primary_id.toString());
    console.log("sender_primary_bank_initial_data ", sender_primary_bank_initial_data.balance);
    console.log("receiver_primary_bank_initial_data ", receiver_primary_bank_initial_data.balance);
    
    if(sender_primary_bank_initial_data.balance - transaction_amount < 0){
        await session.abortTransaction();
        session.endSession();
        return res.json({message : "insufficient balance"});
    }

    try{
        await Account.updateOne(
            { userId: req.user.userId, "banks.bankId": sender_primary_id },
            { $inc: { "banks.$.balance": -transaction_amount } },
            { session }
        )
        
        await Account.updateOne(
            {userId: toId, "banks.bankId": receiver_primary_id},
            {$inc:{"banks.$.balance": transaction_amount}},
            {session}
        )
        await session.commitTransaction();
        console.log("committing transaction");

        // let sender_account_obj_final = await Account.findOne({userId: req.user.userId}, {session});
        // let sender_list_final = sender_account_obj_final.banks;
        // console.log(sender_account_obj_final.currentPrimaryBankId);
        // let sender_primary_bank_final_data  = sender_list_final.find(x => x.bankId.toString() === sender_account_obj.currentPrimaryBankId.toString())
        //let sender_primary_bank_final_data_balance =  sender_primary_bank_final_data.balance;
        // let all_users_list = await Account.find();
        // let recobj = all_users_list.find(x=> x.userId.toString() ===  toId  )
        // let banksof1userlist = recobj.banks;   
        // let primary_bank_1_user_obj = banksof1userlist.find(x=> x.bankId === recobj.currentPrimaryBankId.toString());
        // let receiver_primary_bank_final_data_balance = primary_bank_1_user_obj.balance;
        // console.log("sender_primary_bank_final_data ",  sender_primary_bank_final_data_balance);
        // console.log("receiver_primary_bank_final_data ",  receiver_primary_bank_final_data_balance );

        res.json({message :"transfer success"})

    }
    catch(error){
        await session.abortTransaction();
        console.log("Transaction aborted due to error:", error);
        res.status(500).json({ message: "Transaction failed. Please try again." });
    }
    finally{
        session.endSession();
    }
    }
    catch(err){
        console.log(err);
        
        res.status(500).json({ message: "An error occurred. Please try again." });
    }    
})
module.exports = router;