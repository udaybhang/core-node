
const User = require('../modals/user')
exports.requireToken = async (req,res,next)=> {
    let {access_token} = req.headers;
    if(access_token){
        userdata = await User.findOne({accesstoken : access_token}).exec();
        if(userdata){
            req.userdata = userdata;
        }else{
            return res.status(401).json({message : 'invalid accesstoken'})
        }
        next()
    }else{
        return res.status(401).json({'message':'accesstoken is required'})
    }
    
}