# 🚀 Deploying Linka on AWS (EC2 Hosting & Live Server Linking)

This guide walks you through hosting **Linka** on an AWS EC2 instance and linking real EC2 workloads to Linka's one-click protection engine.

---

## 🔒 Do I need an AWS Access Key ID?

### **Short Answer: NO (when running on EC2)**

When Linka is hosted on an **AWS EC2 instance**, you **do NOT need an AWS Access Key ID or Secret Key**. 
Instead, you attach an **IAM Role** to the EC2 server. AWS automatically and securely supplies rotating temporary credentials through the Instance Metadata Service (IMDS). 

* **Zero keys to generate, copy, paste, or risk leaking.**
* **Built-in least-privilege security** that judges look for in cloud architecture tracks.

*(Note: If you run Linka on your local laptop against real AWS, you can optionally configure credentials via `aws configure` or `.env`, but for AWS hosting, the IAM Role method below is the gold standard).*

---

## 🏗️ Architecture Overview

```
                      [Mobile Phone / Judge's Laptop]
                                     │
                                     ▼ (HTTP / WebSocket Port 3000)
                     ┌───────────────────────────────┐
                     │     Linka EC2 Host Server     │
                     │  - Runs Node.js & Socket.IO   │
                     │  - Attached: LinkaAppRole     │
                     │  - Mode: LINKA_MODE=live      │
                     └───────────────┬───────────────┘
                                     │
                     ec2:StopInstances / StartInstances
                     (Restricted to Tag: Project=Batch-104)
                                     ▼
      ┌─────────────────────────────────────────────────────────────┐
      │               Demo Target Workloads (AWS EC2)               │
      │  ┌───────────────────────────┐ ┌───────────────────────────┐│
      │  │   Freight-Sync-Worker     │ │     Staging-DB-Cluster    ││
      │  │  Tag: Project=Batch-104   │ │  Tag: Project=Batch-104   ││
      │  └───────────────────────────┘ └───────────────────────────┘│
      └─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Launch Your Target Demo Instances (The Servers Being Protected)

In the AWS Console:
1. Open the **EC2 Console** (`us-east-1` recommended).
2. Click **Launch instances**.
3. Launch 2 small instances (e.g., `t3.micro` or `t3.nano` - free-tier eligible):
   * **Instance 1 Name:** `Freight-Sync-Worker`
   * **Instance 2 Name:** `Staging-DB-Cluster`
4. Under **Advanced details** or **Tags**, click **Add tag**:
   * **Key:** `Project`
   * **Value:** `Batch-104`
5. Launch the instances. They are now "linked" to Freight Batch #104 by metadata tag!

---

## Step 2: Create the IAM Role for Linka (`LinkaAppRole`)

This role gives Linka permission to discover and pause **only** the instances tagged `Project=Batch-104`:

1. Open the **IAM Console** ➔ **Policies** ➔ **Create policy**.
2. Select the **JSON** tab and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowDescribeAllInstances",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AllowStopStartTaggedInstancesOnly",
      "Effect": "Allow",
      "Action": [
        "ec2:StopInstances",
        "ec2:StartInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/Project": "Batch-104"
        }
      }
    }
  ]
}
```

3. Name the policy `LinkaEC2ProtectionPolicy` and click **Create policy**.
4. In the IAM Console, go to **Roles** ➔ **Create role**:
   * **Trusted entity type:** AWS service
   * **Use case:** EC2
   * **Permissions:** Attach `LinkaEC2ProtectionPolicy`
   * **Role name:** `LinkaAppRole`
5. Click **Create role**.

---

## Step 3: Launch the Linka Web Server on EC2

Now launch the server that will host the dashboard:

1. In the EC2 Console, click **Launch instances**:
   * **Name:** `Linka-Web-Host`
   * **AMI:** Amazon Linux 2023 (or Ubuntu 24.04 LTS)
   * **Instance type:** `t3.micro` (Free tier)
   * **Key pair:** Select or create an SSH key pair
2. **Network settings / Security Group:**
   * Allow **SSH (Port 22)** from `My IP`
   * Allow **Custom TCP (Port 3000)** from `0.0.0.0/0` (Anywhere)
3. **Advanced details:**
   * Under **IAM instance profile**, select **`LinkaAppRole`**
   *(IMPORTANT: Do not tag this host instance with `Project=Batch-104`, so it never stops itself!)*
4. Click **Launch instance**.
5. *(Recommended)* Under **Network & Security** ➔ **Elastic IPs**, allocate an Elastic IP and associate it with `Linka-Web-Host` so the IP remains static.

---

## Step 4: Deploy and Start Linka on the Server

1. SSH into your newly created `Linka-Web-Host`:
   ```bash
   ssh -i your-key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>
   ```

2. Install Node.js (v20+) and Git:
   ```bash
   sudo dnf install -y git nodejs
   # Or verify node version:
   node -v
   ```

3. Clone the Linka repository:
   ```bash
   git clone https://github.com/HackmidwestLMTV/Linka.git
   cd Linka
   npm install
   ```

4. Configure the environment to **live** mode:
   ```bash
   echo "LINKA_MODE=live" > .env
   echo "AWS_REGION=us-east-1" >> .env
   ```
   *(Notice: No access keys needed! The AWS SDK automatically picks up `LinkaAppRole` from EC2 instance metadata).*

5. Start Linka with PM2 (production process manager):
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name linka
   pm2 save
   pm2 startup
   ```

---

## Step 5: Test & Pitch Live!

1. Open your browser:
   * **Main Dashboard:** `http://<YOUR-EC2-PUBLIC-IP>:3000`
   * **Mobile Disruption Simulator:** `http://<YOUR-EC2-PUBLIC-IP>:3000/trigger.html`
2. Open `/trigger.html` on your smartphone (cellular or any Wi-Fi).
3. Tap **Trigger Tariff Hold**.
4. On the main dashboard, advance to **Step 4** and click **Execute Protection Now**.
5. Check your AWS EC2 Console:
   * The instances tagged `Project=Batch-104` will immediately transition to **`stopping` / `stopped`**!
6. Click **Reset Demo Presentation**:
   * Linka sends `StartInstancesCommand` back to AWS to start the instances back up for your next pitch rehearsal!
