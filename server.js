import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { 
  EC2Client, 
  DescribeInstancesCommand, 
  StopInstancesCommand, 
  StartInstancesCommand 
} from "@aws-sdk/client-ec2";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Determine mode: 'live' or 'demo'
// In live mode, we talk to real AWS EC2. In demo mode, we simulate instance states safely.
const isLiveMode = process.env.LINKA_MODE === 'live' || 
  (Boolean(process.env.AWS_ACCESS_KEY_ID) && process.env.AWS_ACCESS_KEY_ID !== 'MOCK_KEY');

// Initialize AWS EC2 Client
// If credentials are in .env, use them. Otherwise, let AWS SDK automatically discover credentials
// via IAM Role (on EC2 instance metadata) or ~/.aws/credentials (local AWS CLI profile).
const ec2Config = {
  region: process.env.AWS_REGION || "us-east-1"
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_ACCESS_KEY_ID !== "MOCK_KEY") {
  ec2Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
}

const ec2Client = new EC2Client(ec2Config);

console.log(`[Linka Engine] Running in ${isLiveMode ? 'LIVE AWS' : 'DEMO'} mode (Region: ${ec2Config.region})`);

// Fallback mock resources
let currentResources = [
  { id: "i-0a123bc45", name: "Freight-Sync-Worker", type: "t3.large", dailyCost: 45, status: "RUNNING", tag: "Batch-104" },
  { id: "i-0b678de90", name: "Staging-DB-Cluster", type: "r5.large", dailyCost: 135, status: "RUNNING", tag: "Batch-104" }
];

/**
 * Discovers instances tagged with Project=<batchId> from AWS EC2 in live mode,
 * or returns demo resources.
 */
async function getResourcesForBatch(batchId = "Batch-104") {
  if (!isLiveMode) {
    return currentResources;
  }

  try {
    const command = new DescribeInstancesCommand({
      Filters: [
        { Name: "tag:Project", Values: [batchId] },
        { Name: "instance-state-name", Values: ["running", "stopped", "stopping", "pending"] }
      ]
    });

    const response = await ec2Client.send(command);
    const discovered = [];

    for (const reservation of response.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        const nameTag = instance.Tags?.find(t => t.Key === "Name")?.Value || instance.InstanceId;
        
        // Approximate daily cost mapping
        const costMap = {
          "t3.nano": 1.25,
          "t3.micro": 2.50,
          "t3.small": 5.00,
          "t3.medium": 10.00,
          "t3.large": 45.00,
          "r5.large": 135.00
        };
        const dailyCost = costMap[instance.InstanceType] || 45.00;

        discovered.push({
          id: instance.InstanceId,
          name: nameTag,
          type: instance.InstanceType,
          dailyCost: dailyCost,
          status: instance.State?.Name === "running" ? "RUNNING" : "HIBERNATED",
          tag: batchId
        });
      }
    }

    if (discovered.length > 0) {
      currentResources = discovered;
      return discovered;
    }

    console.log(`[Linka Engine] No EC2 instances found matching tag Project=${batchId}. Falling back to demo list.`);
    return currentResources;
  } catch (err) {
    console.warn(`[Linka Engine] AWS EC2 DescribeInstances notice: ${err.message}. Using demo resources.`);
    return currentResources;
  }
}

app.use(express.static('public'));
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: "healthy", mode: isLiveMode ? "live" : "demo", region: ec2Config.region });
});

io.on('connection', async (socket) => {
  const initial = await getResourcesForBatch("Batch-104");
  socket.emit('INIT_STATE', { resources: initial, mode: isLiveMode ? "live" : "demo" });

  // Handle simulated disruption trigger
  socket.on('TRIGGER_DISRUPTION', async (payload) => {
    const delayDays = payload.delayDays || 14;
    const resources = await getResourcesForBatch(payload.batchId || "Batch-104");
    const dailyCost = resources.reduce((acc, item) => acc + item.dailyCost, 0);
    const projectedSavings = dailyCost * delayDays;

    io.emit('LOGISTICS_DISRUPTION_ALERT', {
      batchId: payload.batchId || "Batch-104",
      reason: payload.reason || "Section 301 Tariff Compliance Review",
      delayDays,
      dailyCost,
      projectedSavings,
      affectedResources: resources
    });
  });

  // Handle one-click protection execution
  socket.on('EXECUTE_PROTECTION', async (data) => {
    try {
      const resources = await getResourcesForBatch(data.batchId || "Batch-104");
      const runningIds = resources.filter(r => r.status === "RUNNING").map(r => r.id);

      if (isLiveMode && runningIds.length > 0) {
        console.log(`[Linka Engine] Sending StopInstancesCommand to AWS EC2 for instances:`, runningIds);
        await ec2Client.send(new StopInstancesCommand({ InstanceIds: runningIds }));
        console.log(`[Linka Engine] StopInstancesCommand successfully acknowledged by AWS.`);
      } else {
        console.log(`[Linka Engine] Simulated stop executed for instances:`, runningIds.length ? runningIds : resources.map(r => r.id));
      }

      currentResources.forEach(r => r.status = "HIBERNATED");

      io.emit('PROTECTION_CONFIRMED', {
        status: "SUCCESS",
        savedAmount: data.projectedSavings || 2520,
        resources: currentResources,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("[Linka Engine] AWS Execution error:", error);
      socket.emit('EXECUTION_ERROR', { message: error.message });
    }
  });

  // Handle demo reset (optionally start instances back up if live)
  socket.on('RESET_DEMO', async () => {
    try {
      if (isLiveMode) {
        const resources = await getResourcesForBatch("Batch-104");
        const stoppedIds = resources.filter(r => r.status === "HIBERNATED").map(r => r.id);
        if (stoppedIds.length > 0) {
          console.log(`[Linka Engine] Restarting instances for next demo dry-run:`, stoppedIds);
          await ec2Client.send(new StartInstancesCommand({ InstanceIds: stoppedIds }));
        }
      }
      currentResources.forEach(r => r.status = "RUNNING");
      io.emit('INIT_STATE', { resources: currentResources, mode: isLiveMode ? "live" : "demo" });
    } catch (err) {
      console.warn("[Linka Engine] Demo reset warning:", err.message);
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Linka Engine listening on http://localhost:${PORT}`);
});
