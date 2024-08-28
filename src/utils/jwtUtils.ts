import jwt from "jsonwebtoken";

export const generateToken = (payload: any) => {
  const secretKey = "12345678";
  const options = {
    expiresIn: "1h"
  };
  
  const token = jwt.sign(payload, secretKey, options);
  return token;
};
