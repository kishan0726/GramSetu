const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}))

app.use(express.json());

app.post('/adminLogin', (req,res) => {
    const {admin_id, admin_pass} = req.body;
    console.log(admin_id);
    console.log(admin_pass);
    // console.log(admin_type);
})

app.listen(5000, () => {
    console.log("Server Start on http://localhost:5000");
})