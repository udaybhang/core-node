const mongoose = require('mongoose')

var schema = mongoose.Schema({
    firstname : {type:String,default:null},
    lastname : {type:String,default:null},
    mobileno : {type:String,default:null},
    email : {type:String,default:null},
    password : {type:String,default:null},
    accesstoken : {type:String,default:null}
},{
    timestamps : true
})

module.exports = mongoose.model('user',schema)