const express = require("express");
const bodyParser = require("body-parser");
const { User } = require("./models/User");
const config = require("./config/key");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const app = express();
const port = 3000;

//application / x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//applrication / json
app.use(bodyParser.json());
app.use(cookieParser);

const mongoose = require("mongoose");
const { idText } = require("typescript");
mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log("MongoDB Connected...");
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("열렸다!"));

app.post("/api/users/register", (req, res) => {
  //회원 가입할 때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.

  const user = new User(req.body); // bodyparser가 있기에 가능

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true }); // status(200)은 성공을 의미 성공하면 true 리턴
  }); //mongoDB에서 오는 save
}); // 회원가입을 위한 route

app.post("/api/users/login", (req, res) => {
  User,
    findOne({ email: req.body.emal }, (err, user) => {
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: "제공된 이메일에 해당하는 정보가 없습니다",
        });
      }
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch) {
          return res.json({
            loginSuccess: false,
            message: "비밀번호가 틀렸습니다.",
          });
        }
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);
          res
            .cookie("x_auth", user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id });
        });
      });
    });
});

app.get("/api/users/auth", auth, (req, res) => {
  //여기까지 미들웨어를 통과 했다는 얘기는 authentication 이 true라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, 
    { token: "" }, 
    (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({ success: true });
    }
  );
});

app.listen(port, () =>
  console.log(`Example app Listening on http://localhost:3000`)
);
