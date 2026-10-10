import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { EC2Client, StopInstancesCommand } from "@aws-sdk/client-ec2";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "MOCK_KEY",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "MOCK_SECRET"
  }
});

let mockResources = [
  { id: "i-0a123bc45", name: "Freight-Sync-Worker", type: "t3.large", dailyCost: 45, status: "RUNNING", tag: "Batch-104" },
  { id: "i-0b678de90", name: "Staging-DB-Cluster", type: "r5.large", dailyCost: 135, status: "RUNNING", tag: "Batch-104" }
];

app.use(express.static('public'));
app.use(express.json());

io.on('connection', (socket) => {
  socket.emit('INIT_STATE', { resources: mockResources });

  // Handle simulated disruption from mobile device
  socket.on('TRIGGER_DISRUPTION', (payload) => {
    const delayDays = payload.delayDays || 14;
    const dailyCost = mockResources.reduce((acc, item) => acc + item.dailyCost, 0);
    const projectedSavings = dailyCost * delayDays;

    io.emit('LOGISTICS_DISRUPTION_ALERT', {
      batchId: payload.batchId,
      reason: payload.reason,
      delayDays,
      dailyCost,
      projectedSavings,
      affectedResources: mockResources
    });
  });

  // Handle single-click execution
  socket.on('EXECUTE_PROTECTION', async (data) => {
    try {
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== "MOCK_KEY") {
        const instanceIds = mockResources.map(r => r.id);
        await ec2Client.send(new StopInstancesCommand({ InstanceIds: instanceIds }));
      } else {
        console.log("Mock AWS execution. Skipping actual EC2 stop command.");
      }

      mockResources.forEach(r => r.status = "HIBERNATED");

      io.emit('PROTECTION_CONFIRMED', {
        status: "SUCCESS",
        savedAmount: data.projectedSavings,
        resources: mockResources,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("AWS Execution error:", error);
      socket.emit('EXECUTION_ERROR', { message: error.message });
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Linka Engine listening on http://localhost:${PORT}`);
});
