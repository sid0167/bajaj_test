const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const EMAIL = "siddharth2531.be23@chitkara.edu.in"; 

// ---------- Helpers ----------
const fibonacci = (n) => {
  if (n < 0) return [];
  const res = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
};

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++)
    if (n % i === 0) return false;
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const hcf = (arr) => arr.reduce((a, b) => gcd(a, b));
const lcm = (arr) =>
  arr.reduce((a, b) => (a * b) / gcd(a, b));

// ---------- Routes ----------
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const key = Object.keys(body)[0];

    if (!key || Object.keys(body).length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Invalid request"
      });
    }

    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(body[key])) throw "Invalid Fibonacci input";
        data = fibonacci(body[key]);
        break;

      case "prime":
        if (!Array.isArray(body[key])) throw "Invalid Prime input";
        data = body[key].filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(body[key])) throw "Invalid LCM input";
        data = lcm(body[key]);
        break;

      case "hcf":
        if (!Array.isArray(body[key])) throw "Invalid HCF input";
        data = hcf(body[key]);
        break;

      case "AI":
        if (typeof body[key] !== "string") throw "Invalid AI input";

        // 🔹 Gemini API
        const response = await axios.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
          {
            contents: [{ parts: [{ text: body[key] }] }]
          },
          {
            params: { key: process.env.GEMINI_API_KEY }
          }
        );

        data =
          response.data.candidates?.[0]?.content?.parts?.[0]?.text
            ?.split(" ")[0] || "Unknown";
        break;

      default:
        throw "Unknown key";
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });
  } catch (err) {
    res.status(400).json({
      is_success: false,
      official_email: EMAIL,
      error: String(err)
    });
  }
});

// ---------- Start ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
