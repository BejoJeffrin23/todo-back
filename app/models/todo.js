const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const tododetails=new Schema({
   
    eventId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    adminName:{
        type:String,
        default:''
    },
    event:{
        type:String,
        default:""
    },
   
    adminId:{
        type:String,
        default:''
    },
    startYear:{
        type:Number,
        default:''
    },
    startMonth:{
        type:Number,
        default:''
    },
    startDay:{
        type:Number,
        default:''
    }
})

mongoose.model('Todo',tododetails)