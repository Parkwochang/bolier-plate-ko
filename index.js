const express = require("express");
const bodyParser = require("body-parser");
const { User } = require("./models/User");
const config = require("./config/key");
const app = express();
const port = 3000;

//application / x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//applrication / json
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log("MongoDB Connected...");
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("열렸다!"));

app.post("/register", (req, res) => {
  //회원 가입할 때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.

  const user = new User(req.body); // bodyparser가 있기에 가능

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true }); // status(200)은 성공을 의미 성공하면 true 리턴
  }); //mongoDB에서 오는 save
}); // 회원가입을 위한 route

app.listen(port, () =>
  console.log(`Example app Listening on http://localhost:3000`)
);
