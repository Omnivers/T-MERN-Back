const router=require("express").Router();
const User=require('../models/User');
const CryptoJs=require('crypto-js');
const JWT=require("jsonwebtoken");


router.post('/register',async (req,res)=>{
    const newUser= new User({
        username:req.body.username,
        email:req.body.email,
        password: CryptoJs.AES.encrypt(req.body.password, process.env.PASSCRYPT).toString()
    });
    try{
        const savedUser= await newUser.save();
        res.status(201).json(savedUser);
    }catch(e){
        res.status(500).json(e); //On peut mieux definir l'erreur par exemple username required ou autre
    }
});

//LOGIN

router.post("/login", async(req,res)=>{
    try{
        const user = await User.findOne({username:req.body.username});
        if(!user){
            res.status(401).json("Wrong Username")
            return;
        }
        const hashedPassword=CryptoJs.AES.decrypt(user.password, process.env.PASSCRYPT);
        const originalPassword=hashedPassword.toString(CryptoJs.enc.Utf8);
        if(originalPassword !== req.body.password){
            res.status(401).json("Wrong Password");
            return;
        }
        // JWT part
        const accessToken= JWT.sign(
            {
                id:user.id,
                isAdmin:user.isAdmin
            },
            process.env.PASSJWT,{expiresIn:"1d"}
        );
        // 

        const {password,...others}=user._doc; // to prevent showing the password in our res.json down below
        res.status(200).json({...others,accessToken});
    }catch(e){
        res.status(500).json(e);
    }
})



module.exports = router;