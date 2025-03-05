import { sign, verify, decode } from "hono/jwt";

const payload = {
  sub: "user123",
  role: "admin",
  exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
};
const secretKey = "mySecretKey";
const token = await sign(payload, secretKey);
console.log(token);

const verifiedPayload = await verify(token, secretKey);
console.log(verifiedPayload);

const { header, payload: decodedPayload } = decode(token);

console.log("Decoded Header:", header);
console.log("Decoded Payload:", decodedPayload);
