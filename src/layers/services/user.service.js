import UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import Joi from "joi";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const userSchema = Joi.object()
  .keys({
    email: Joi.string()
      .pattern(
        new RegExp(
          "^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$"
        )
      )
      .required(),
    password: Joi.string()
      .pattern(
        new RegExp(
          "^(?=.*[A-Za-z])(?=.*d)(?=.*[@$!%*#?&])[A-Za-zd@$!%*#?&]{8,16}$"
        )
      )
      .required(),
    nickname: Joi.string()
      .pattern(new RegExp("(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{1,10}$"))
      .required(),
  })
  .unknown(true);

class UserService {
  //회원가입              /api/user/signup
  singUp = async (body) => {
    await userSchema.validateAsync(body);
    const { email, nickname, password } = body;
    const salt = await bcrypt.genSalt(10); // 기본이 10번이고 숫자가 올라갈수록 연산 시간과 보안이 높아진다.
    const hashedpassword = await bcrypt.hash(password, salt); // hashedpassword를 데이터베이스에 저장한다.
    const repository_result = await UserRepository.singUp(
      email,
      nickname,
      hashedpassword
    );
    if (repository_result) return true;
  };

  //로그인                /api/user/login
  logIn = async (email, password, req) => {
    const user = await UserRepository.logIn(email);
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error("Mismatched password");
      }
      const accesstoken = jwt.sign(
        { key1: user.user_id + parseInt(process.env.SUM) },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      const refreshtoken = jwt.sign(
        {
          key2: accesstoken,
          key3: user.user_id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      req.session.a1 = refreshtoken;
      req.session.save((err) => {
        if (err) {
          console.log(err);
          throw new Error("session save error");
        }
      });
      return accesstoken;
    } else {
      throw new Error("not exist User");
    }
  };

  //로그 아웃             /api/user/logout
  logOut = async (req) => {
    if (req.session.a1)
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          throw new Error("session dstroy error");
        }
      });
    else throw new Error("not exist session");
  };

  //관심사 설정           /api/user/interest
  interest = async (body, user_id) => {
    body.sort();
    body.unshift("");
    body.push("");
    const interest = body.join("#");
    await UserRepository.interest(interest, user_id);
  };

  //유저정보              /api/user/mypage/info
  myInfo = async (userId) => {
    const user = await UserRepository.findUser(userId);
    if (!user) return { status: 400, message: "존재하지 않는 유저입니다." };

    const result = {
      email: user.email,
      nickname: user.nickname,
      point: user.point,
    };

    return { status: 200, message: "유저 정보", result };
  };
}

export default new UserService();
