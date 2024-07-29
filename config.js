module.exports = {
  mikrotik: {
    baseURL: "http://103.175.202.94/rest", // Ganti dengan IP MikroTik Anda
    auth: {
      username: "admin",
      password: "mallawa2024!",
    },
  },
  whatsappNumber: "6282347838252@c.us", // Ganti dengan nomor WhatsApp tujuan
};

// const axios = require("axios");

// axios
//   .get("http://103.175.202.94/rest/ip/hotspot/active", {
//     auth: {
//       username: "admin",
//       password: "mallawa2024!",
//     },
//   })
//   .then((response) => {
//     console.log(response.data);
//   })
//   .catch((error) => {
//     console.error("Error:", error.message);
//   });
