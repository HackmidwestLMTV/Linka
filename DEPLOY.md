# 🌐 Hosting Linka on Akamai Connected Cloud (Linode)

This guide walks you through hosting **Linka** on **Akamai Connected Cloud (Linode)** in simple, beginner-friendly steps following the official tools specified for **Hack Midwest 2026** (Akamai Cloud Challenge · Flex Challenge).

---

## 🧭 Websites & Tools Used

| Tool / Platform | Website | Purpose |
|---|---|---|
| **Akamai Cloud Manager** | [cloud.linode.com](https://cloud.linode.com) | Launch your cloud compute instance (Linode) & manage VMs |
| **GitHub** | [github.com/HackmidwestLMTV/Linka](https://github.com/HackmidwestLMTV/Linka) | Linka source code repository |
| **Terminal / SSH** | Mac Terminal / Windows PowerShell | Connect to your cloud server |
| **Browser (Laptop & Phone)** | `http://<LINODE_IP>:3000` | Live VisionOS dashboard & remote mobile trigger |

---

## ⚡ Why Akamai Cloud (Linode) is Simple & Smooth
* **No complex IAM roles or STS permissions:** Instant personal access token.
* **Instant public IP:** No NAT gateways or VPC route tables to troubleshoot.
* **Open ports:** Port 3000 works out of the box with zero firewall roadblocks.
* **Full $300 Hack Midwest cloud credit** provided to hackathon teams.

---

## Step 1: Log in to Akamai Cloud Manager
1. Open your browser and go to **[https://cloud.linode.com](https://cloud.linode.com)**.
2. Sign in with your Akamai/Linode account (or redeem the $300 Hack Midwest credit promo provided in your hackathon attendee packet).

---

## Step 2: Create Your Linka Host Server
1. Click the blue **"Create"** button at the top of the dashboard, then select **"Linode"**.
2. Fill out these quick settings:
   * **Distribution:** Select **Ubuntu 24.04 LTS** (or 22.04 LTS).
   * **Region:** Select **Chicago, IL (`us-ord`)** (or Newark, Dallas, Atlanta).
   * **Linode Plan:** Click the **"Shared CPU"** tab:
     * Select **Nanode 1 GB** ($5/mo) or **Linode 2 GB** ($12/mo).
   * **Label:** Type `linka-web-host`.
   * **Root Password:** Enter a password you will remember (you will use this to log in).
3. Click **"Create Linode"** at the bottom right.
4. Wait ~30 seconds until the status badge turns green and shows **"RUNNING"**.
5. Copy the **Public IPv4 address** shown on your Linode overview screen (e.g., `172.234.xx.xx`).

---

## Step 3: (Optional) Launch Target Workloads for Live Shutdown
If you want Linka to stop *real* Akamai servers during your live demo pitch:
1. Click **Create** -> **Linode**.
2. Choose **Ubuntu 24.04 LTS** + **Nanode 1 GB**.
3. Label it `Freight-Sync-Worker`.
4. In the **Tags** field, enter: `Batch-104`.
5. Click **Create Linode**.
*(Linka discovers any Linode tagged `Batch-104` and pauses it when the tariff hold is triggered!)*

---

## Step 4: (Optional) Generate an Akamai API Token
*(Note: If you skip this step, Linka automatically runs in seamless Demo Mode and simulates everything flawlessly for judges).*

If you want live Akamai API execution:
1. In Cloud Manager, click your profile icon (top right) -> **API Tokens**.
2. Click **Create Personal Access Token**.
3. Label: `Linka-HackMidwest`.
4. Set **Linodes** permission to **Read/Write**.
5. Click **Create Token** and copy the long token string.

---

## Step 5: Connect to Your Akamai Server via SSH
Open the **Terminal** app on your Mac (or PowerShell on Windows) and run:

```bash
ssh root@<YOUR_LINODE_IP>
```
*(Replace `<YOUR_LINODE_IP>` with the public IP address copied in Step 2).*

* When asked `Are you sure you want to continue connecting (yes/no/[fingerprint])?`, type `yes` and press Enter.
* Type the root password you set in Step 2 and press Enter.

---

## Step 6: Install Node.js and Clone Linka
Once logged into your Linode terminal prompt (`root@linka-web-host:~#`), run these commands:

```bash
# 1. Update server packages
apt update && apt install -y git curl

# 2. Install Node.js (version 20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Verify installation
node -v
npm -v
```

Now clone the Linka project:

```bash
git clone https://github.com/HackmidwestLMTV/Linka.git
cd Linka
npm install
```

---

## Step 7: (Optional) Set Your Akamai Token in `.env`
If you created an Akamai API token in Step 4, run:

```bash
echo "AKAMAI_API_TOKEN=your_token_here" > .env
```
*(Otherwise, skip this step and Linka will run in instant demo mode).*

---

## Step 8: Run the Server
To start Linka:

```bash
node server.js
```

You will see:
```text
[Linka Engine] Cloud Provider: Akamai Connected Cloud (Linode)
[Linka Engine] Execution Mode: DEMO SIMULATION (or LIVE AKAMAI API)
Linka Engine listening on http://0.0.0.0:3000
```

### Pro Tip: Keep Linka Running in the Background (PM2)
To keep the server running even if you close your laptop or terminal:

```bash
npm install -g pm2
pm2 start server.js --name linka
```

---

## Step 9: Open and Test Live
1. **On your presentation laptop / screen:**
   Open:
   ```text
   http://<YOUR_LINODE_IP>:3000
   ```
   You will see Linka’s spatial VisionOS dashboard running live on Akamai Cloud!

2. **On your phone (for the live judge demo):**
   Open:
   ```text
   http://<YOUR_LINODE_IP>:3000/trigger.html
   ```
   Tap **"Trigger Tariff Hold"** on your phone.
   Watch your laptop dashboard instantly leap into Step 2 (Disruption Detected) over live WebSockets!
