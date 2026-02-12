const express = require("express");
const cors = require("cors");
const db = require("./firebase");

const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}))

app.use(express.json());

async function adminData(admin_id,admin_pass) {
    const snapshot = await db.ref("admin").orderByChild("admin_id").equalTo(admin_id).once("value");
    const adminID = Object.values(snapshot.val())[0].admin_id;
    const adminPass = Object.values(snapshot.val())[0].admin_pass;
    // snapshot.forEach(child => {
    //   console.log(child.val().admin_id);
    // });

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