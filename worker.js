/**
 * Cloudflare Worker — proxy kirim log ke Telegram.
 * Token bot disimpan sebagai "Secret" di Cloudflare, TIDAK ada di kode ini
 * ataupun di kode client (index.html). Paket gratis Cloudflare Workers:
 * 100.000 request/hari, TIDAK perlu kartu kredit.
 *
 * ================= CARA DEPLOY (lewat browser, tanpa install apa pun) =================
 * 1. Buka https://dash.cloudflare.com → daftar akun gratis (cukup email, tanpa kartu kredit)
 * 2. Di menu kiri: Workers & Pages → Create → Create Worker
 * 3. Beri nama, misal "telegram-log-proxy" → Deploy (akan muncul kode contoh dulu, itu normal)
 * 4. Klik "Edit code" → HAPUS semua isi default → TEMPEL isi file ini → Save and Deploy
 * 5. Kembali ke halaman Worker → tab "Settings" → "Variables and Secrets"
 *    → Add → Type: Secret → Name: TELEGRAM_BOT_TOKEN → Value: (token BARU hasil revoke dari BotFather)
 *    → Save (worker akan otomatis redeploy)
 * 6. Salin URL worker-mu, bentuknya seperti:
 *    https://telegram-log-proxy.NAMA-AKUNMU.workers.dev
 * 7. Tempel URL itu ke index.html, ganti baris:
 *      const TELEGRAM_PROXY_URL = "...";
 */

const TELEGRAM_CHAT_ID = "980829495"; // ini bukan rahasia, boleh tetap di sini

export default {
  async fetch(request, env) {
    // Izinkan dipanggil dari domain web-mu (CORS)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const bersih = (v) => (typeof v === "string" ? v.slice(0, 200) : "-");

      const teks =
        `🔔 *${(bersih(body.tipeAktivitas) || "AKTIVITAS").toUpperCase()}*\n` +
        `------------------------------------\n` +
        `🏢 *Toko:* \`${bersih(body.toko)}\`\n` +
        `👤 *Pengguna:* \`${bersih(body.user)}\`\n` +
        `📱 *Device:* ${bersih(body.platform)}\n` +
        `⏰ *Waktu:* ${new Date().toLocaleString("id-ID", { timeZoneName: "short" })}\n` +
        `------------------------------------`;

      const tgUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: teks,
          parse_mode: "Markdown",
        }),
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
