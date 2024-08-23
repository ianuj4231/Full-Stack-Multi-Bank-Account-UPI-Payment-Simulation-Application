const fromId = "66ba10886b3bfc28dad6d1e1";
const fromId2 = "66ba108e6b3bfc28dad6d1e6";
const toId="66ba108b6b3bfc28dad6d1e4";

const mongoose = require('mongoose');
const dummyModel =  require("./transactions_db");

async function  transfer(req){
        try {
            const  toId = req.body.toId;
            const fromId = req.body.fromId;
            const amount= req.body.amount;
            const session = await mongoose.startSession();
            session.startTransaction();
           // both fromId and toId are strings so to get it in object format:
           let list_of_objects = await dummyModel.find({}, {session});
           let sender_obj = list_of_objects.find(x => x._id.toString()===fromId );
           let rec_obj = list_of_objects.find(x=> x._id.toString()===toId);
           if (!sender_obj || !rec_obj) {
            throw new Error('Sender or receiver not found');
        }
           if(sender_obj.balance  < amount  * 100){
               session.abortTransaction();
               console.log("Insufficient balance")
               return ;
           }
           await dummyModel.updateOne({_id: sender_obj._id } , {
               $inc: {
                   balance : amount* 100
               }
           }, {session} )
   
           await dummyModel.updateOne({_id: rec_obj._id}, {$inc: {balance: -amount*100}}, {session})
           await session.commitTransaction();
           console.log("committing");
        } catch (error) {
            console.error("Transaction aborted due to error:", error);
            session.abortTransaction();
        }
        finally{
            session.endSession();
            console.log("session ended");
        }
}

transfer({
    body:{
        amount: 50,
        fromId: fromId,
        toId: toId
    }
});

transfer({
    body:{
        amount: 50,
        fromId: fromId,
        toId: toId
    }
});
