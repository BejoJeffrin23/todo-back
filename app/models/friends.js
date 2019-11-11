const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const friendsdetails=new Schema({
    friendreqId:{
        type:String,
        default:''
    },
    senderId:{
        type:String,
        default:''
    },
    senderName:{
        type:String,
        default:''
    },
    receiverId:{
        type:String,
        default:''
    },
    receiverFirstName:{
        type:String,
        default:''
    },
    receiverLastName:{
        type:String,
        default:''
    }
})

mongoose.model('friends',friendsdetails)