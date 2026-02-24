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

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Verification",
            text: `Your OTP is ${otp}`
        })

        res.json({ success: true });
    }
    else {
        res.json({ success: false });
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
        const recentActivity = snapshot2.val();
        const { admin_pass, ...safeData } = adminData;
        const Data = { ...safeData, recentActivity };
        res.json(Data);
    }
    catch (error) {
        res.json({ message: "server error" });
    }
})

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


app.listen(5000, () => {
    console.log("Server Start on http://localhost:5000");
})