import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
}

export const generateJwt = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h", 
  });
};
