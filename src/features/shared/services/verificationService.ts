import axios from "axios";

export async function sendVerificationCode(
  method: "email" | "phone",
  value: string,
  resend: boolean = false
) {

  const res = await axios.post(
    "http://localhost:5000/api/verification/send-code",
    {
      method,
      value,
      resend
    }
  );

  return res.data;

}

export async function verifyVerificationCode(
  method: "email" | "phone",
  value: string,
  code: string
) {

  const res = await axios.post(
    "http://localhost:5000/api/verification/verify-code",
    {
      method,
      value,
      code
    }
  );

  return res.data;

}