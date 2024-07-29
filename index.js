const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const MikroNode = require("mikronode");

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
  // Ambil data dari Mikrotik dan kirim ke WhatsApp
  sendHotspotDataToWhatsApp();
});

client.initialize();

// Fungsi untuk mengambil data dari Mikrotik dan mengirimkannya ke WhatsApp
function sendHotspotDataToWhatsApp() {
  const connection = MikroNode.getConnection({
    host: "103.175.202.94",
    user: "admin",
    password: "mallawa2024!",
    port: 8728, // Port default MikroTik API
  });

  connection
    .connect()
    .then(([login]) => {
      console.log("Connected to Mikrotik");
      return login();
    })
    .then((conn) => {
      console.log("Logged into Mikrotik");
      console.log("Opening channel 'hotspot'");
      const chan = conn.openChannel("hotspot");
      console.log("Channel 'hotspot' opened");

      console.log("Sending command to retrieve active hotspot users");
      chan.write("/ip/hotspot/active/print");

      chan.on("done", (data) => {
        console.log("Data received from Mikrotik:", data);
        const users = MikroNode.resultsToObj(data);
        console.log("Parsed Users Data:", users);

        users.forEach((user) => {
          const message = `Kode Voucher: ${
            user.name
          }\nTanggal: ${new Date().toLocaleDateString()}\nJam: ${new Date().toLocaleTimeString()}\nIP Address: ${
            user.address
          }\nMac Address: ${user.mac_address}\nDevice: ${
            user.host_name || "N/A"
          }\nPaket: ${user.profile}\nWaktu Terpakai: ${user.uptime}\nExpired: ${
            user.comment || "N/A"
          }\nUsers Yang Online: ${users.length}`;
          console.log("Sending message:", message);
          client.sendMessage("whatsapp:+6282347838252", message);
        });

        console.log("Closing channel 'hotspot'");
        chan.close();
        conn.close();
        console.log("Connection closed");
      });

      chan.on("error", (err) => {
        console.error("Error in channel 'hotspot':", err);
      });
    })
    .catch((err) => {
      console.error("Error:", err);
    });
}
