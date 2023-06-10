const User = require("../models/userModel");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
// const Mailgen = require("mailgen")
const sendEmail = require("../utils/email")
const client = require("twilio")("ACa22b4d8cdbc0f3fb8007541778518f86","680404ca511a6c89460bcef8bb614a8c")
///for user signup 

exports.signup = async(req,res)=>{
    
    try {
            const { first_name, last_name, email, password ,number , message} = req.body;
         
            if(!( first_name && last_name && email && password && number && message))
            {
            res.status(400).send("all fields are required")
        }
        
        const oldUser = await User.findOne({ email });
        
    if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
      encryptedPassword = await bcrypt.hash(password, 10);
        
      const user = await User.create({
        first_name,
        last_name,
        message,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
        number
      });
  
            const token = jwt.sign(
                {user_id:user._id , email},
                process.env.TOKEN_KEY,{
                    expiresIn: "3h"
                }
            );
            user.token= token;

        const messageemail = 'Account created successfully 🎉🌹'
        await sendEmail(user.email, "Message from Soumi",messageemail);
            res.status(200).json({
                success: true,
                message: `reset token has been send to ${user.email}`,
              });
} catch (err) {
          console.log(err);
        }
        }
    
      
        

// const {EMAIL , PASSWORD} =require("../env")
// //     //testing mail account //
//     let testAccount = await nodemailer.createTestAccount();

//      // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: testAccount.user, // generated ethereal user
//       pass: testAccount.pass, // generated ethereal password
//     },
//   });
//    // send mail with defined transport object
//    let message = {
//     from: '"Fred Foo 👻" soumi.paul@hih7.com', // sender address
//     to: "soumipaul645@gmail.com, spmamon1999@gmail.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>", // html body
//   };

//   transporter.sendMail(message).then((info)=>{
//     return res.status(201).json({message:"you should receive an email",
// info:info.messageId,
// preview:nodemailer.getTestMessageUrl(info)}).catch(error=>{
//         return res.status(500).json({error})
//     })
//   })

// }


        //for login 



exports.login = async(req,res)=>{
            try {
                const {email , password} = req.body;
                if(!(email && password))
                {
                res.status(400).send("all fields are required")
            }
            
                const user = await User.findOne({email});
            
            if(user && (await bcrypt.compare(password,user.password))){
            
                const token = jwt.sign(
                    {user_id:user._id , email},
                    process.env.TOKEN_KEY,{
                        expiresIn: "3h"
                    }
                )
                user.token= token;
           
            }
            res.status(400).send("invalid credentials")
            } catch (error) {
                console.log("error")
            }
            }

           
           
        
          
            

//         const getBill = (req,res)=>{
// const {userEmail} = req.body;
//             let config = {
//                 service : "gmail",
//                 auth :{
//                     user:EMAIL,
//                     pass:PASSWORD
//                 }
//             }
//             let transporter = nodemailer.createTransport(config)

//             let MailGenarator = new Mailgen({
//                 theme:"default",
//                 product :{
//                     name:"Mailgen",
//                     link :"https://mailgen.js/"
//                 }
//             })

//             let response = {
//                 body:{
//                  name,
//                  intro:"your bill has arrived"   ,
//                  table:{
//                 data :[
//                     {item :"Nodemailer Stack Book",
//                 description:"A backend application",
//                 price : "$10.99"
//                 }
//                 ]
//                  }
//                 },
//                 outro:"looking forward to do more business"
//             }
//             let mail = MailGenarator.generate(response)
// let message = {
//     from : EMAIL,
//     to :userEmail,
//     subject:"Place Order",
//     html :mail
// }

// transporter.sendMail(message).then(()=>{
//     return res.status(201).json({
//         msg:"you should receive an email"
//     })
// }).catch(error=>{
//     return res.status(500).json({error})
// })
//             res.status(201).json("getBill successfully")
//         }

//twilio acc for otp send in phone
exports.test= (req, res)=>{
    res.status(200).send({
        message: "You are on Homepage",
        info: {
            login: "Send verification code through /login . It contains two params i.e. phonenumber and channel(sms/call)",
            verify: "Verify the recieved code through /verify . It contains two params i.e. phonenumber and code"
        }
    })
}

exports.signin = (req,res)=>{
    
if(req.query.phonenumber){
    client.verify.services("VA34132cb9205955fb3b2438b6074a17f3").verifications.create({
        to:`+${req.query.phonenumber}`,
        channel:req.query.channel==="call" ? "call" : "sms"
    })
    .then(data=>{
        res.status(200).send({
            message:"verification is sent",
            phonenumber:req.query.phonenumber,
            data
        })
    })
}else{
    req.status(400).send({message:"wrong phone number:(",
phonenumber:req.query.phonenumber,
data
})
}
}
    
//verify endpoint
exports.verify=(req,res)=>{
if(req.query.phonenumber && (req.query.code).length === 6)
{
    client.verify.services(process.env.TWILIO_SERVICE_ID).verificationChecks.create({
        to:`+${req.query.phonenumber}`,
        code:req.query.code
    })
    .then(data=>{
        if(data.status === "approved"){
            res.status(200).send({
                message:"User is verified!!",
                data
            })
        }
    })
} else {
    res.status(400).send({
        message:"wrong phn number or code :(",
        phonenumber:req.query.phonenumber,
      data
    })
}
}