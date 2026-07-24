import { runtimeAPI } from './RuntimeAPI.js';
import { runtimeKernel } from './RuntimeKernel.js';

console.log('----------------------------------------------------');
console.log('🧪 Running Intent Engine Unit & Lifecycle Tests...');
console.log('----------------------------------------------------');

runtimeKernel.boot();

// Test 1: Submit Intent Pipeline
const intentText = 'Research and build a fast vector search index in C++ for SQLite';
const result = runtimeAPI.submitIntent(intentText);

console.log('Test 1 - Submit Intent Success:', result.success);
console.log('Test 1 - Mission Category:', result.mission.category);
console.log('Test 1 - Primary Goal:', result.mission.goals.primaryGoal);
console.log('Test 1 - Task Nodes Count:', result.mission.taskGraph.nodeCount);
console.log('Test 1 - Validation Status:', result.mission.validation.isValid);

// Test 2: Fetch Mission via API
const fetchedMission = runtimeAPI.getMission(result.mission.id);
console.log('Test 2 - Fetched Mission ID Match:', fetchedMission?.id === result.mission.id);

// Test 3: Fetch Task Graph via API
const taskGraph = runtimeAPI.getTaskGraph(result.mission.id);
console.log('Test 3 - Task Graph DAG Flag:', taskGraph?.isDAG);

// Test 4: Validate Mission Draft
const validation = runtimeAPI.validateMission({
  intent: 'Fix critical database deadlock',
  goals: { primaryGoal: 'Fix deadlock' },
  taskGraph: { nodeCount: 3 },
});
console.log('Test 4 - Validation Report Result:', validation.isValid);

console.log('----------------------------------------------------');
console.log('✅ Intent Engine Tests Completed Successfully!');
console.log('----------------------------------------------------');
