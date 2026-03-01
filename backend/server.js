require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("./cloudinary");
const db = require("./firebase");
const otpGenerator = require("otp-generator");
const transporter = require("./emailService");
const app = express();
const axios = require("axios");

const router = express.Router();
const otpStore = {};

app.use(cors({
    origin: "http://localhost:3000"
}))

app.use(express.json());
app.use(router);

// Login components
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

        const htmlTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Verification</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                    
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f8fafc;
                    }
                    
                    .email-container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        border-radius: 24px;
                        overflow: hidden;
                        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
                        border: 1px solid #e2e8f0;
                    }
                    
                    .email-header {
                        background: linear-gradient(135deg, #38bdf8, #0ea5e9);
                        padding: 40px 30px;
                        text-align: center;
                    }
                    
                    .logo {
                        font-size: 48px;
                        margin-bottom: 10px;
                        display: inline-block;
                        background: rgba(255, 255, 255, 0.2);
                        width: 80px;
                        height: 80px;
                        line-height: 80px;
                        border-radius: 50%;
                    }
                    
                    .header-title {
                        color: #ffffff;
                        font-size: 28px;
                        font-weight: 700;
                        margin: 15px 0 5px;
                        letter-spacing: -0.5px;
                    }
                    
                    .header-subtitle {
                        color: rgba(255, 255, 255, 0.9);
                        font-size: 14px;
                        font-weight: 400;
                        margin: 0;
                    }
                    
                    .email-body {
                        padding: 40px 30px;
                        background: #ffffff;
                    }
                    
                    .greeting {
                        font-size: 18px;
                        color: #1e293b;
                        font-weight: 600;
                        margin-bottom: 10px;
                    }
                    
                    .message {
                        font-size: 15px;
                        color: #475569;
                        line-height: 24px;
                        margin-bottom: 30px;
                    }
                    
                    .otp-container {
                        background: #f8fafc;
                        border-radius: 20px;
                        padding: 30px;
                        text-align: center;
                        border: 2px dashed #38bdf8;
                        margin-bottom: 30px;
                    }
                    
                    .otp-label {
                        font-size: 14px;
                        color: #64748b;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        font-weight: 500;
                        margin-bottom: 15px;
                    }
                    
                    .otp-code {
                        font-size: 48px;
                        font-weight: 700;
                        color: #0ea5e9;
                        letter-spacing: 8px;
                        margin: 20px 0;
                        font-family: 'Courier New', monospace;
                        background: #ffffff;
                        padding: 15px;
                        border-radius: 16px;
                        border: 2px solid #e2e8f0;
                        display: inline-block;
                    }
                    
                    .otp-expiry {
                        font-size: 13px;
                        color: #ef4444;
                        font-weight: 500;
                        margin-top: 15px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 5px;
                    }
                    
                    .expiry-icon {
                        font-size: 16px;
                    }
                    
                    .info-box {
                        background: #f1f5f9;
                        border-radius: 16px;
                        padding: 20px;
                        margin-top: 20px;
                    }
                    
                    .info-title {
                        font-size: 14px;
                        color: #334155;
                        font-weight: 600;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    
                    .info-text {
                        font-size: 13px;
                        color: #64748b;
                        line-height: 20px;
                        margin: 5px 0;
                    }
                    
                    .email-footer {
                        background: #f1f5f9;
                        padding: 30px;
                        text-align: center;
                        border-top: 1px solid #e2e8f0;
                    }
                    
                    .footer-text {
                        font-size: 13px;
                        color: #64748b;
                        line-height: 20px;
                        margin: 5px 0;
                    }
                    
                    .footer-note {
                        font-size: 12px;
                        color: #94a3b8;
                        margin-top: 15px;
                    }
                    
                    .divider {
                        height: 1px;
                        background: linear-gradient(to right, transparent, #cbd5e1, transparent);
                        margin: 20px 0;
                    }
                    
                    .badge {
                        display: inline-block;
                        background: #38bdf8;
                        color: white;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 500;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <div class="logo">🔐</div>
                        <h1 class="header-title">GramSetu</h1>
                        <p class="header-subtitle">Digital Village Management System</p>
                    </div>
                    
                    <div class="email-body">
                        <div class="greeting">Hello Admin,</div>
                        
                        <p class="message">
                            We received a request to verify your email address for the GramSetu admin portal. 
                            Use the following One-Time Password (OTP) to complete your verification.
                        </p>
                        
                        <div class="otp-container">
                            <div class="otp-label">Verification Code</div>
                            <div class="otp-code">${otp}</div>
                            <div class="otp-expiry">
                                <span class="expiry-icon">⏰</span>
                                This OTP will expire in 5 minutes
                            </div>
                        </div>
                        
                        <div class="info-box">
                            <div class="info-title">
                                <span>📋</span>
                                Important Security Information
                            </div>
                            <p class="info-text">• Never share this OTP with anyone, including GramSetu staff.</p>
                            <p class="info-text">• If you didn't request this verification, please ignore this email.</p>
                            <p class="info-text">• For security reasons, this OTP is valid for only 5 minutes.</p>
                        </div>
                        
                        <div class="badge">Secure Verification</div>
                    </div>
                    
                    <div class="email-footer">
                        <p class="footer-text">This is an automated message from GramSetu.</p>
                        <p class="footer-text">Please do not reply to this email.</p>
                        <div class="divider"></div>
                        <p class="footer-note">
                            GramSetu - Connecting Villages Digitally<br>
                            © 2024 GramSetu. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const textTemplate = `
            GramSetu - Admin OTP Verification
            
            Hello Admin,
            
            We received a request to verify your email address for the GramSetu admin portal.
            
            Your OTP is: ${otp}
            
            This OTP will expire in 5 minutes.
            
            Important Security Information:
            - Never share this OTP with anyone, including GramSetu staff.
            - If you didn't request this verification, please ignore this email.
            
            This is an automated message from GramSetu. Please do not reply to this email.
            
            GramSetu - Connecting Villages Digitally
            © 2024 GramSetu. All rights reserved.
        `;

        await transporter.sendMail({
            from: `"GramSetu Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "🔐 GramSetu Admin OTP Verification",
            text: textTemplate,
            html: htmlTemplate
        });

        res.json({ success: true });
    }
    else {
        res.json({ success: false });
    }
});

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
});

router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    const snapshot = await db.ref("admin").once("value");

    if (!snapshot.exists()) return false;
    let update = false;
    snapshot.forEach(child => {
        const data = child.val();
        if (data.personal_information.email === email) {
            const adminKey = child.key;
            db.ref(`admin/${adminKey}`).update({
                admin_pass: newPassword
            })
            update = true;
        }
    })

    update ? res.json({ success: true }) : res.json({ success: false });
})

router.post("/change-password", async (req, res) => {
    const { id, currentPassword, newPassword } = req.body;
    const snapshot = await db.ref(`admin/${id}`).once("value");
    if (!snapshot.exists()) return false;
    let update = false;
    const data = snapshot.val();
    if (data.admin_pass === currentPassword) {
        db.ref(`admin/${id}`).update({
            admin_pass: newPassword
        })
        update = true;
    }
    update ? res.json({ success: true }) : res.json({ success: false });
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

// Admin Profile components
app.get('/get-admin/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const snapshot = await db.ref(`admin/${id}`).once("value");
        const snapshot2 = await db.ref("admin_recent_activity").once("value");

        const adminData = snapshot.val();
        const activityObj = snapshot2.val() || {};

        const recentActivity = Object.keys(activityObj).map(key => ({
            id: key,
            ...activityObj[key]
        }));

        recentActivity.sort((a, b) => b.timestamp - a.timestamp);

        const { admin_pass, ...safeData } = adminData;

        res.json({
            ...safeData,
            recentActivity
        });

    } catch (error) {
        res.status(500).json({ message: "server error" });
    }
});

app.put('/update-admin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        await db.ref(`admin/${id}`).update(updateData);
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
})

app.post('/admin-recent-activity', async (req, res) => {
    try {
        const { action, description } = req.body;

        const newActivity = {
            action,
            description,
            timestamp: Date.now()
        };

        await db.ref("admin_recent_activity").push(newActivity);
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
})

// Dashboard components
app.get('/get-village-data', async (req, res) => {
    try {
        const snapshot = await db.ref("village_data").once("value");
        const villageData = snapshot.val();

        const snapshot2 = await db.ref("admin/admin1/personal_information").once("value");
        const { name, phone1, ...otherData } = snapshot2.val();

        const snapshot3 = await db.ref("quick_links").once("value");
        const quickLinks = snapshot3.val();

        const snapshot4 = await db.ref("recent_activity").once("value");
        const recentActivity = snapshot4.val();

        const snapshot5 = await db.ref("live_data").once("value");
        const liveData = snapshot5.val();

        const snapshot6 = await db.ref("recent_updates").once("value");
        const recentUpdates = snapshot6.val();

        const data = { ...villageData, name, phone1, quickLinks, recentActivity, liveData, recentUpdates };
        res.json(data);
    }
    catch (error) {
        console.error(error)
        res.json({ success: false })
    }
})

// Announcement components
app.put('/update-published-announcement/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        await db.ref(`published_announcement/${id}`).update(updateData);
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
})

app.get('/get-published-announcement', async (req, res) => {
    try {
        const snapshot = await db.ref("published_announcement").once("value");
        const data = snapshot.val() || {};
        const announcement = Object.values(data);
        res.json({ data: announcement, success: true });
    }
    catch (error) {
        res.json({ data: [], success: false });
    }
})

app.delete('/delete-published-announcement/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`published_announcement/${id}`).remove();
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
})

// Shop components
app.get('/get-shops', async (req, res) => {
    try {
        const snapshot = await db.ref("shops_list").once("value");
        const data = snapshot.val() || {};
        const shops = Object.values(data);
        res.json({ data: shops, success: true });
    }
    catch (error) {
        res.json({ data: [], success: false });
    }
})

app.get('/get-shop-documents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const shopId = id.toLowerCase();

        const snapshot = await db.ref(`shops_list/${shopId}/shop_image`).once("value");
        const data = snapshot.val() || {};

        const documents = {};
        Object.keys(data).forEach(docType => {
            documents[docType] = {
                url: data[docType].url,
                fileName: data[docType].fileName,
                uploadedAt: data[docType].uploadedAt,
                public_id: data[docType].public_id
            };
        });

        res.json({ data: documents, success: true });
    }
    catch (error) {
        console.error("Error fetching shop documents:", error);
        res.json({ data: {}, success: false });
    }
});

app.get('/download-document/:id/:docType', async (req, res) => {
    try {
        const { id, docType } = req.params;
        const shopId = id.toLowerCase();

        const snapshot = await db.ref(`shops_list/${shopId}/shop_image/${docType}`).once("value");
        const docData = snapshot.val();

        if (!docData || !docData.url) {
            return res.status(404).json({ error: "Document not found" });
        }

        const response = await axios({
            method: 'GET',
            url: docData.url,
            responseType: 'stream'
        });

        res.setHeader('Content-Disposition', `attachment; filename="${docData.fileName || `${shopId}_${docType}.jpg`}"`);
        res.setHeader('Content-Type', response.headers['content-type']);

        response.data.pipe(res);
    }
    catch (error) {
        console.error("Error downloading document:", error);
        res.status(500).json({ error: "Failed to download document" });
    }
});


app.put('/update-shop-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await db.ref(`shops_list/${id.toLowerCase()}`).update({
            status,
            lastUpdated: new Date().toISOString().split("T")[0]
        });
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
})

app.delete('/delete-shop/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`shops_list/${id.toLowerCase()}`).remove();
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
})

// Complaint components
app.get('/get-complaint', async (req, res) => {
    try {
        const snapshot = await db.ref("complaints_list").once("value");
        const data = snapshot.val() || {};
        const complaint = Object.values(data);
        res.json({ data: complaint, success: true });
    }
    catch (error) {
        res.json({ data: [], success: false });
    }
})

app.put('/update-complaint-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        await db.ref(`complaints_list/${id.toLowerCase()}`).update(updateData);
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
})

app.delete('/delete-complaint/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`complaints_list/${id.toLowerCase()}`).remove();
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
})

// User components
app.put('/update-user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        await db.ref(`user_data/${id}`).update(updateData);
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
})

app.get("/get-users", async (req, res) => {
    try {
        const snapshot = await db.ref("user_data").once("value");
        const data = snapshot.val() || {};

        const usersArray = Object.values(data);

        res.json({ success: true, data: usersArray });
    } catch (error) {
        res.json({ success: false, data: [] });
    }
});

// User Detail Components
app.get("/get-user-detail/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const snapshot = await db.ref(`user_data/${id}`).once("value");
        const user = snapshot.val();
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.json({ success: false, data: [] })
    }
})


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

app.post("/profile/upload", upload.single("image"), async (req, res) => {
    try {
        const uid = "admin";
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        if (!file.mimetype.startsWith("image/")) {
            return res.status(400).json({ error: "Only images allowed" });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "profileImages",
                public_id: uid,
                overwrite: true,
                transformation: [
                    { width: 300, height: 300, crop: "fill" }
                ]
            },
            async (error, result) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ error: "Cloudinary upload failed" });
                }

                res.json({
                    success: true,
                    photoURL: result.secure_url
                });
            }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
});


// Forgot password - send OTP to shopkeeper email
router.post("/shopkeeper-forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const snapshot = await db.ref('shops_list').orderByChild('email').equalTo(email).once('value');

        if (!snapshot.exists()) {
            return res.json({
                success: false,
                message: "No shop found with this email address"
            });
        }

        let shopData = null;
        let shopId = null;
        snapshot.forEach((child) => {
            shopData = child.val();
            shopId = child.key;
        });

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        otpStore[email] = {
            otp,
            shopId,
            shopData,
            expires: Date.now() + 5 * 60 * 1000,
            purpose: 'forgot-password'
        };

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP - Shopkeeper Account",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #38bdf8; text-align: center;">Password Reset Request</h2>
                    <p style="font-size: 16px; color: #334155;">Hello ${shopData.ownerName || shopData.shopName},</p>
                    <p style="font-size: 16px; color: #334155;">We received a request to reset your password for your shop account.</p>
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h1 style="font-size: 36px; color: #38bdf8; letter-spacing: 5px; margin: 0;">${otp}</h1>
                        <p style="font-size: 14px; color: #64748b; margin-top: 10px;">This OTP is valid for 5 minutes</p>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">GramSetu - Digital Village Management System</p>
                </div>
            `
        });

        res.json({
            success: true,
            message: "OTP sent to your email",
            email: email
        });

    } catch (error) {
        console.error("Error in forgot password:", error);
        res.json({
            success: false,
            message: "Failed to process request"
        });
    }
});

// Verify OTP for password reset
router.post("/verify-reset-otp", async (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record || record.purpose !== 'forgot-password') {
        return res.json({
            success: false,
            message: "No OTP request found. Please request again."
        });
    }

    if (Date.now() > record.expires) {
        delete otpStore[email];
        return res.json({
            success: false,
            message: "OTP has expired. Please request again."
        });
    }

    if (record.otp != otp) {
        return res.json({
            success: false,
            message: "Invalid OTP. Please try again."
        });
    }

    const resetToken = otpGenerator.generate(20, {
        digits: true,
        lowerCaseAlphabets: true,
        upperCaseAlphabets: true,
        specialChars: false
    });

    otpStore[email] = {
        ...record,
        resetToken,
        otpVerified: true,
        expires: Date.now() + 15 * 60 * 1000
    };

    res.json({
        success: true,
        message: "OTP verified successfully",
        resetToken: resetToken
    });
});

// Reset password
router.post("/reset-password", async (req, res) => {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.json({
            success: false,
            message: "Passwords do not match"
        });
    }

    if (newPassword.length < 6) {
        return res.json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }

    const record = otpStore[email];

    if (!record || record.purpose !== 'forgot-password') {
        return res.json({
            success: false,
            message: "Invalid reset request"
        });
    }

    if (!record.otpVerified) {
        return res.json({
            success: false,
            message: "OTP not verified"
        });
    }

    if (record.resetToken !== resetToken) {
        return res.json({
            success: false,
            message: "Invalid reset token"
        });
    }

    if (Date.now() > record.expires) {
        delete otpStore[email];
        return res.json({
            success: false,
            message: "Reset session expired"
        });
    }

    try {
        await db.ref(`shops_list/${record.shopId}`).update({
            password: newPassword,
            confirmPassword: newPassword,
            lastUpdated: new Date().toISOString().split('T')[0]
        });

        delete otpStore[email];

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Successful",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #10b981; text-align: center;">✓ Password Reset Successful</h2>
                    <p style="font-size: 16px; color: #334155;">Hello ${record.shopData.ownerName || record.shopData.shopName},</p>
                    <p style="font-size: 16px; color: #334155;">Your password has been successfully reset.</p>
                    <p style="font-size: 14px; color: #64748b;">You can now login with your new password.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you didn't make this change, please contact support immediately.</p>
                </div>
            `
        });

        res.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.json({
            success: false,
            message: "Failed to reset password"
        });
    }
});

// Resend OTP for forgot password
router.post("/resend-reset-otp", async (req, res) => {
    const { email } = req.body;
    const record = otpStore[email];

    if (!record || record.purpose !== 'forgot-password') {
        return res.json({
            success: false,
            message: "No OTP request found"
        });
    }

    const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });

    otpStore[email] = {
        ...record,
        otp,
        expires: Date.now() + 5 * 60 * 1000,
        otpVerified: false
    };

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "New OTP for Password Reset",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #38bdf8; text-align: center;">New OTP Request</h2>
                <p style="font-size: 16px; color: #334155;">Hello ${record.shopData.ownerName || record.shopData.shopName},</p>
                <p style="font-size: 16px; color: #334155;">Here's your new OTP for password reset:</p>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h1 style="font-size: 36px; color: #38bdf8; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    <p style="font-size: 14px; color: #64748b; margin-top: 10px;">This OTP is valid for 5 minutes</p>
                </div>
            </div>
        `
    });

    res.json({
        success: true,
        message: "New OTP sent successfully"
    });
});

router.post("/get-shop-by-email", async (req, res) => {
    const { email } = req.body;

    try {
        const snapshot = await db.ref('shops_list').orderByChild('email').equalTo(email).once('value');

        if (!snapshot.exists()) {
            return res.json({
                success: false,
                message: "No shop found with this email"
            });
        }

        let shopData = null;
        snapshot.forEach((child) => {
            shopData = child.val();
        });

        res.json({
            success: true,
            data: {
                shopName: shopData.shopName || shopData.name,
                ownerName: shopData.ownerName,
                email: shopData.email
            }
        });

    } catch (error) {
        console.error("Error fetching shop:", error);
        res.json({
            success: false,
            message: "Failed to fetch shop data"
        });
    }
});

// Optional: Clean up expired OTPs periodically
setInterval(() => {
    const now = Date.now();
    Object.keys(otpStore).forEach(email => {
        if (otpStore[email].expires < now) {
            delete otpStore[email];
        }
    });
}, 60 * 1000);

app.listen(5000, () => {
    console.log("Server Start on http://localhost:5000");
})