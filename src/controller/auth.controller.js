import connect from "../config/db.js";
import { SECREAT_KEY } from "../config/globalKey.js";
import { EMessage, ROLE, SMessage } from "../service/message.js";
import { SendCreate, SendError, SendError400, SendSuccess } from "../service/response.js";
import { ValidateData } from "../service/validate.js";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from 'uuid'
import { GenerateToken } from "../service/service.js";



export default class AuthController {

    // get All 
    static async getAll(req, res) {
        try {
            const users = "Select * from user";
            connect.query(users, (err, result) => {
                if (err) return SendError(res, 404, EMessage.NotFound + "user", err);
                if (!result[0]) return SendError(res, 404, EMessage.NotFound + "user");
                return SendSuccess(res, SMessage.SelectAll, result);
            });
        } catch (error) {
            return SendError(res, 500, EMessage.ServerError, error);
        }
    }

    // get One 
    static async getOne(req, res) {
        try {
            const uuid = req.params.uuid; // 1 body: {} 2 params ແມ່ນ string ທີ່ຈະຢູ່ກັບ url , 3 query ຄ້າຍຄືກັບ params ແຕ່ສາມາດຂຽນຂໍ້ມູນໃນ url ໄດ້
            const checkUuid = "select * from user where uuid=?";
            connect.query(checkUuid, uuid, (err, result) => {
                if (err) return SendError(res, 404, EMessage.NotFound+ "user", err);
                if (!result[0]) return SendError(res, 404, EMessage.NotFound + "user");
                return SendSuccess(res, SMessage.SelectOne, result[0]);
            });
        } catch (error) {
            return SendError(res, 500, EMessage.ServerError, error);
        }
    }



    // function Login 
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const validate = await ValidateData({ email, password })
            if (validate.length > 0) {
                return SendError400(res, EMessage.PleaseInput + validate.join(","))
            }
            const checkEmail = " Select * from user where email=?"


            connect.query(checkEmail, email, async (err, result) => {
                if (err) return SendError(res, 404, EMessage.NotFound, err);

                if (!result[0]) return SendError(res, 404, EMessage.ServerError);

                const decryptPassword = CryptoJS.AES.decrypt(
                    result[0]["password"],
                    SECREAT_KEY
                ).toString(CryptoJS.enc.Utf8);
                if (decryptPassword != password) {
                    return SendError(res, 404, "password is not match", err)
                }
                const data = {
                    id: result[0]['uuid'],
                }
                // generate token 
                const token = await GenerateToken(data);
                // const newData = Object.assign(
                //     JSON.parse(JSON.stringify(result[0])),
                //     JSON.parse(JSON.stringify(token))
                // )


                const newData = {
                    ...result[0],
                    ...token
                }
                return SendSuccess(res, SMessage.Logon, newData)
            })
        } catch (error) {
            return SendError(res, 500, "Server Error", newData)
        }
    }

    // function Register 
    static async register(req, res) {
        try {
            const { username, email, phoneNumber, password } = req.body;

            //validate data
            const validate = await ValidateData({
                username,
                email,
                phoneNumber,
                password
            });
            if (validate.length > 0) {
                return SendError400(res, "please Input" + validate.join(','))
            }


            const checkEmail = " Select * from user where email=?"
            connect.query(checkEmail, email, (errEmail, isMath) => {
                if (errEmail) return SendError(res, 404, "Not found Email", errEmail)
                if (isMath[0]) return SendError(res, 208, "Email Already ")
                const uuid = uuidv4();
                const datetime = new Date()
                    .toISOString()
                    .replace(/T/, " ")
                    .replace(/\..+/, "");
                const genPassword = CryptoJS.AES.encrypt(  // AES = a-z And DES z-a
                    password,
                    SECREAT_KEY
                ).toString();

                const insert = `INSERT INTO user 
                    (uuid,username,phoneNumber,email,password,role,createdAt,updatedAt) 
                    VALUES(?,?,?,?,?,?,?,?)`

                connect.query(
                    insert,
                    [
                        uuid,
                        username,
                        phoneNumber,
                        email,
                        genPassword,
                        ROLE.user,
                        datetime,
                        datetime
                    ],
                    function (err) {
                        if (err) return SendError(res, 409, "Error Insert User")
                        const newData = {
                            ...req.body,
                            uuid: uuid,
                            role: ROLE.user,
                            createdAt: datetime,
                            updatedAt: datetime,
                        }
                        return SendCreate(res, "Register Success", newData)
                    })
            })
        } catch (error) {
            return SendError(res, 500, "Server Error", error)
        }
    }
}