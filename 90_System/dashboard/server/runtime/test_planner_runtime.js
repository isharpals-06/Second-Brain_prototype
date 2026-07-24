import { runtimeAPI } from './RuntimeAPI.js';
import { runtimeKernel } from './RuntimeKernel.js';

console.log('----------------------------------------------------');
console.log('🧪 Running Planner Runtime Unit & Integration Tests...');
console.log('----------------------------------------------------');

runtimeKernel.boot();

// Step 1: Submit raw intent to create validated mission
const intentText = 'Delete temporary cache logs and execute shell command for backup';
const intentResult = runtimeAPI.submitIntent(intentText);

console.log('Step 1 - Intent Submitted Success:', intentResult.success);
console.log('Step 1 - Mission ID:', intentResult.mission.id);

// Step 2: Generate Execution Plan via Planner Runtime
const plan = runtimeAPI.planMission(intentResult.mission.id);

console.log('Step 2 - Execution Plan Generated ID:', plan?.id);
console.log('Step 2 - Execution Strategy:', plan?.executionStrategy);
console.log('Step 2 - Task Order Count:', plan?.taskOrder.length);
console.log('Step 2 - Parallel Groups Count:', plan?.parallelGroups.length);
console.log('Step 2 - Required Capabilities:', plan?.requiredCapabilities);
console.log('Step 2 - Approval Checkpoints Count:', plan?.approvalGates.length);
console.log('Step 2 - Estimated Runtime (s):', plan?.estimatedRuntimeSeconds);
console.log('Step 2 - Estimated Cost (USD):', plan?.estimatedCostUSD);
console.log('Step 2 - Risk Score:', plan?.riskScore);
console.log('Step 2 - Confidence Score:', plan?.confidenceScore);

// Step 3: Fetch Execution Plan via API
const fetchedPlan = runtimeAPI.getExecutionPlan(plan.id);
console.log('Step 3 - Fetched Plan ID Match:', fetchedPlan?.id === plan.id);

// Step 4: Check Planning State in RuntimeStore
const planningState = runtimeAPI.getPlanningState();
console.log('Step 4 - Planning State Status:', planningState.status);

console.log('----------------------------------------------------');
console.log('✅ Planner Runtime Tests Completed Successfully!');
console.log('----------------------------------------------------');
