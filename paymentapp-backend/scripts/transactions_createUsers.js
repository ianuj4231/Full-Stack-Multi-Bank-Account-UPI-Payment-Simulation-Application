const dummyModel = require("./transactions_db")

async function createUser(){
      let obj = await dummyModel.create({balance:  ((  Math.random()* 1000 ).toFixed(2) ) * 100   })
      console.log(obj);      
      console.log("------");
}

async function starter() {
    for(let i=0; i<5; ++i)
        {
           await new Promise((r)=> {
            setTimeout(r, 3000)  
            createUser();
        });
    
    }
}



starter();