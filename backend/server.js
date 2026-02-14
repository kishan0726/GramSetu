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

router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    const isExist = await adminEmail(email);

    if (isExist) {
        const otp = otpGenerator.generate(6, {
  digits: true,
  lowerCaseAlphabets: false,
  upperCaseAlphabets: false,
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

        res.json({ success: true });
    }
    else {
        res.json({ success: false});
    }
})

router.post("/verity-otp", async (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore[email];
    if (!record) {
        return res.json({ success: false, message: "Resend OTP" });
    }
    if (Date.now() > record.expires) {
        return res.json({ success: false, message: "OTP Expire" });
    }
    if (record.otp != otp) {
        return res.json({ success: false, message: "Invalid OTP" });
    }
    delete otpStore[email];
    res.json({ success: true });
})

router.post("/reset-password", async(req,res) => {
    const {email, newPassword} = req.body;

    const snapshot = await db.ref("admin").once("value");

    if (!snapshot.exists()) return false;
    let update = false;
    snapshot.forEach(child => {
        const data = child.val();
        if(data.personal_information.email === email){
            const adminKey = child.key;
            db.ref(`admin/${adminKey}`).update({
                admin_pass: newPassword
            })
            update = true;
        }
    })

    update ? res.json({success: true}) : res.json({success: false});
})

async function adminEmail(email) {
    const snapshot = await db.ref("admin").once("value");

    if (!snapshot.exists()) return false;

    const admins = Object.values(snapshot.val());

    for (const admin of admins) {
        if (admin.personal_information?.email === email) 
            return true;
    }

    return false;
}

async function adminData(admin_id, admin_pass) {
    const snapshot = await db.ref("admin").orderByChild("admin_id").equalTo(admin_id).once("value");
    const adminID = Object.values(snapshot.val())[0].admin_id;
    const adminPass = Object.values(snapshot.val())[0].admin_pass;
    if (admin_id === adminID && admin_pass === adminPass)
        return Object.values(snapshot.val())[0].admin_type;
    return false
}

app.post('/adminLogin', async (req, res) => {
    const { admin_id, admin_pass } = req.body;
    const isVerified = await adminData(admin_id, admin_pass);

    if (!isVerified) {
        res.json({ adminType: null });
    }
    else {
        res.json({ adminType: "admin" });
    }
})

app.post('/getAdminProfile', async (req,res) => {
    const snapshot = await db.ref("admin").once("value");
})

app.listen(5000, () => {
    console.log("Server Start on http://localhost:5000");
})