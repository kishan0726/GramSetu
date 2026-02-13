require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./firebase");
const otpGenerator = require("otp-generator");
const transporter = require("./emailService");
const app = express();

const router = express.Router();
const otpStore = {};

app.use(cors({
    origin: "http://localhost:3000"
}))

app.use(express.json());
app.use(router);

router.post("/send-otp", async(req, res) => {
    const {email} = req.body;
    console.log(email);
    const otp = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false
    });

    otpStore[email] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Verification",
        text: `Your OTP is ${otp}`
    })

    res.json({success: true});
})

async function adminData(admin_id,admin_pass) {
    const snapshot = await db.ref("admin").orderByChild("admin_id").equalTo(admin_id).once("value");
    const adminID = Object.values(snapshot.val())[0].admin_id;
    const adminPass = Object.values(snapshot.val())[0].admin_pass;
    if(admin_id === adminID && admin_pass === adminPass)
        return Object.values(snapshot.val())[0].admin_type;
    return false
}

app.post('/adminLogin', async(req,res) => {
    const {admin_id, admin_pass} = req.body;
    const isVerified = await adminData(admin_id, admin_pass);
    console.log(isVerified);

    if(!isVerified){
        res.json({adminType: null});
    }
    else{
        res.json({adminType: "admin"});
    }
})

app.listen(5000, () => {
    console.log("Server Start on http://localhost:5000");
})