const joi = require('joi');
const User = require('../modals/user');
const md5 = require('md5');
exports.signup = async (req, res) => {
    const schema = joi.object().keys({
        firstname: joi.string().required().error(e => "firstname is required"),
        lastname: joi.string().required().error(e => "lastname is required"),
        mobileno: joi.string().required().error(e => "mobileno is required"),
        email: joi.string().required().error(e => "email is required"),
        password: joi.string().required().error(e => "password is required")
    });
    const result = joi.validate(req.body, schema, { abortEarly: true })
    if (result.error) {
        res.status(400).json({ message: result.error.details[0].message })
    }
    isemailfound = await User.findOne({ email: req.body.email }).exec()
    if (isemailfound) {
        return res.status(400).json({ message: 'Email already taken' })
    }
    ismobilefound = await User.findOne({ mobileno: req.body.mobileno }).exec()
    if (ismobilefound) {
        return res.status(400).json({ message: 'Mobile already taken' })
    }
    const accesstoken = generate_token(32)
    var userdetails = new User({ firstname: req.body.firstname, lastname: req.body.lastname,  mobileno: req.body.mobileno, email: req.body.email,  accesstoken: accesstoken, wholemobile_number: req.body.mobileno,  password: md5(req.body.password) })
    var userdetails = await userdetails.save()
    res.status(200).json({ message: 'User registered successfully', userdetails: userdetails })
}

exports.login = async (req, res) => {

    try {
            const schema = joi.object().keys({
            email: joi.string().required().error(e => "email is required"),
            password: joi.string().required().error(e => "Password is required")
        });
    
        const result = joi.validate(req.body, schema, { abortEarly: true })
        if (result.error) {
            res.status(400).json({ message: result.error.details[0].message })
            return;
        }
        var userdetails = await User.findOne({ email: req.body.email, password: md5(req.body.password) }).exec()
        if (!userdetails) throw new Error('Please enter valid credentials')
        accesstoken = generate_token(32)
        userdetails = await User.findOneAndUpdate({ _id: userdetails._id }, { accesstoken: accesstoken }, { new: true }).exec()
        if (!userdetails) new Error('token failed to store')
     res.status(200).json({ message: "user logged in successfully", userdetails: userdetails })   
    } catch (err) {
        res.status(300).json({
            message: err.message
        })
    }
}

exports.userList = async (req,res) => {
   try {
    userdetails = await User.find({}).sort( { _id: -1 } ).exec()
    if (!userdetails) throw new Error('No record found')
    res.status(200).json({userlist : userdetails})
   } catch (e) {
    res.status(403).json({
        message: e.message
    })
   }
}


exports.userUpdate = async(req, res) =>{
   try {
       let {firstname, lastname, mobileno, email} = req.body;
    let userModal = await User.findById(req.body.id).lean();
    if(!userModal) throw new Error('no record found');
     let userUpdate = await User.findOneAndUpdate({_id:req.body.id},{firstname:firstname ? firstname : userModal.firstname, lastname:lastname ? lastname : userModal.lastname, email:email ? email : userModal.email, mobileno:mobileno ? mobileno : userModal.mobileno},{new:true}).lean();
     if(!userUpdate) throw new Error('some error occured')
     res.status(200).json({message:'activity added successfully.',data:userUpdate})
   } catch (e) {
    res.status(403).json({
        message: e.message
    })
   }
  }

  exports.searchUser = async(req, res)=>{
    
    try {
          var query;
          
          let { page, firstname } = req.body;
          let options = { 
            page:page || 1,
            limit:10
        }
        if(firstname && firstname != ''){
            let re = { $regex:firstname, $options:'i' }
           let k = {"firstname": re} 
           
          query =  [
            { $match: k },
            { '$facet'    : {
              metadata: [ { $count: "total" }, { $addFields: { page: options.page } } ],
              data: [{ $skip: (options.page * 10) - 10 }, { $limit: options.limit }, {
              $project: {
                _id: 1,
                firstname: "$firstname",
                lastname: "$lastname",
                email: "$email",
                mobileno: "$mobileno"
                          }
            } ]
          } }
           ];
        }
        
        
        let user = await User.aggregate(query);
               if(!user) throw new Error('user not found')
           
               if(user && user[0].data.length > 0) {
                res.status(200).json({
                    result: user,
                    message:'list of user by search'
                })
             } 
         else {
            res.status(200).json({
                message:'list of user by search not found'
            })
         }
    } 
    catch(err) {
            res.status(403).json({
                message: err.message,
            })
        }
    }

generate_token = (length) => {
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];
    for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

