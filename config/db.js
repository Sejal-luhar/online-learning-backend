const mongoose=require('mongoose')

mongoose.connect(process.env.MONGOURL)
.then(()=>{
    console.log('database connected successfully');
    
})
.catch((err)=>{
    console.log(err.message);
    
})