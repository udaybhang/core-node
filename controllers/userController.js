const joi = require('joi');
const User = require('../modals/user');
const md5 = require('md5');
const sk = "";
const stripe = require('stripe')(sk);

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
exports.success_url = async (req, res)=>{
    console.log(res.body)
    res.status(200).json({
        message:"Success url!",
        data: res.body
    })
}
exports.cancel_url = async (req, res)=>{
    console.log(res.body)
    res.status(200).json({
        message:"Cancel url!",
        data: res.body
    })
}
exports.retreavePaymentIntent = async(req, res)=>{
    let {p_in} = req.body
    // found client secreat in response
    const paymentIntent = await stripe.paymentIntents.retrieve(p_in);
    res.status(200).json({
        message:"Payment Intent!",
        data: paymentIntent
    })
}
exports.charge = async(req, res)=>{
    let {token_id} = req.body
    // found client secreat in response
    const charge = await stripe.charges.create({
        amount: 50,
        currency: 'usd',
        source: token_id,
        description: 'My First Test Charge (created for API docs at https://www.stripe.com/docs/api)',
      });
    res.status(200).json({
        message:"Payment Intent!",
        data: charge
    })
}
  exports.checkout = async(req, res)=> {
    const session = await stripe.checkout.sessions.create({
        submit_type: 'pay',
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: "INR",
                unit_amount: 130,
                product_data: { name: "Basketball", description: "play ground" }
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: 'http://localhost:3000/success_url',
        cancel_url: 'http://localhost:3000/cancel_url'
      });
        res.status(200).json({
          message:"Success!",
          data: session
      })
  };

  exports.token = async(req, res)=> {
    const token = await stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 7,
          exp_year: 2023,
          cvc: '314',
        },
      });
        res.status(200).json({
          message:"Success!",
          data: token
      })
  };

  exports.create = async(req, res)=> {
      let pk = "";
      let cusData = await stripe.customers.create({email: "uexefm@gmail.com", name: "Amrita", address: { line1: "Fakrabad" }, metadata: { email: "uexefm@gmail.com" } });
        res.status(200).json({
          message:"Success!",
          data: cusData
      })
  };

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

