import jwt from 'jsonwebtoken'
import { SECREAT_KEY, SECREAT_KEY_REFRESH } from '../config/globalKey.js'
import CryptoJS from 'crypto-js'
import connect from '../config/db.js'

// function Object
export const CheckEmail = async (email) => {
    return new Promise(async (resovle, reject) => {
      try {
        const checkEmail = "Select * from user where email=?";
        connect.query(checkEmail, email, (err, result) => {
          if (err) reject(err);
          if (result[0]) reject("Email Already");
          resovle(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  

export const GenerateToken = async (data) => {
    return new Promise(async (resovle, reject) => { // resovle = true reject = false
        try {
            const payload = {
                id: CryptoJS.AES.encrypt(data.id, SECREAT_KEY).toString()
            }
            const payload_refresh = {
                id: CryptoJS.AES.encrypt(data.id, SECREAT_KEY_REFRESH).toString()
            }
            const token = jwt.sign(payload, SECREAT_KEY, { expiresIn: "2h" })
            const refreshToken = jwt.sign(payload, SECREAT_KEY, {
                expiresIn: "4h"
            })
            resovle({ token, refreshToken });
        } catch (error) {
            reject(error)
        }
    })
}