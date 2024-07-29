const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const config = require("./config");

// Konfigurasi WhatsApp Bot
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  console.log("QR code received, scan it with your phone");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
  startMonitoring();
});

client.initialize();

let previousUsers = []; // Menyimpan status pengguna sebelumnya

// Fungsi untuk memulai monitoring
function startMonitoring() {
  checkHotspotUsers();
}

// Fungsi untuk memeriksa pengguna hotspot
async function checkHotspotUsers() {
  try {
    const mikrotikConfig = config.mikrotik;
    const axiosInstance = axios.create(mikrotikConfig);

    // Mengambil data dari endpoint REST API MikroTik
    const response = await axiosInstance.get("/ip/hotspot/active");
    const currentUsers = response.data;

    // Mendeteksi pengguna yang login
    const loggedInUsers = currentUsers.filter(
      (currUser) =>
        !previousUsers.find(
          (user) => user["mac-address"] === currUser["mac-address"]
        )
    );

    // Mendeteksi pengguna yang logout
    const loggedOutUsers = previousUsers.filter(
      (user) =>
        !currentUsers.find(
          (currUser) => currUser["mac-address"] === user["mac-address"]
        )
    );

    // Mengirim pesan saat pengguna login
    loggedInUsers.forEach((user) => {
      const message = `===============================\nDEVICE LOGIN\n===============================\n- Kode Voucher: ${
        user.name || "Unknown"
      }\n- Tanggal: ${new Date().toLocaleDateString()}\n- Jam: ${new Date().toLocaleTimeString()}\n- IP Address: ${
        user.address
      }\n- Mac Address: ${user["mac-address"]}\n- Device: ${
        user["host-name"] || "N/A"
      }\n- Paket: ${user.profile || "N/A"}\n- Waktu Terpakai: ${
        user.uptime || "N/A"
      }\n- Expired: ${user.comment || "N/A"}\n- Users Yang Online: ${
        currentUsers.length
      } Users`;

      client.sendMessage(config.whatsappNumber, message);
    });

    // Mengirim pesan detail saat pengguna logout
    loggedOutUsers.forEach((user) => {
      const message = `===============================\nDEVICE LOGOUT\n===============================\n- Kode Voucher: ${
        user.name || "Unknown"
      }\n- Tanggal: ${new Date().toLocaleDateString()}\n- Jam: ${new Date().toLocaleTimeString()}\n- IP Address: ${
        user.address
      }\n- Mac Address: ${user["mac-address"]}\n- Device: ${
        user["host-name"] || "N/A"
      }\n- Paket: ${user.profile || "N/A"}\n- Waktu Terpakai: ${
        user.uptime || "N/A"
      }\n- Expired: ${user.comment || "N/A"}\n- Users Yang Online: ${
        currentUsers.length
      } Users`;

      client.sendMessage(config.whatsappNumber, message);
    });

    // Menyimpan status pengguna saat ini untuk perbandingan selanjutnya
    previousUsers = currentUsers;
  } catch (error) {
    console.error("Error connecting to Mikrotik REST API:", error.message);
  } finally {
    // Memanggil kembali fungsi checkHotspotUsers setelah selesai
    setTimeout(checkHotspotUsers, 0);
  }
}
