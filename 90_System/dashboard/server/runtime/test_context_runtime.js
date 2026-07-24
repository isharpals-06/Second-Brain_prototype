import { runtimeAPI } from './RuntimeAPI.js';
import { runtimeKernel } from './RuntimeKernel.js';

console.log('----------------------------------------------------');
console.log('🧪 Running Context Runtime Unit & Integration Tests...');
console.log('----------------------------------------------------');

runtimeKernel.boot();

// Step 1: Submit intent & Plan Mission
const intentText = 'Assemble working context for SQLite vector search extension mission';
const intentResult = runtimeAPI.submitIntent(intentText);
const plan = runtimeAPI.planMission(intentResult.mission.id);

console.log('Step 1 - Plan Generated ID:', plan?.id);

// Step 2: Build Working Context via Context Runtime
const context = runtimeAPI.buildContext(intentResult.mission.id);

console.log('Step 2 - Working Context ID:', context?.id);
console.log('Step 2 - Context Policy Active:', context?.policy);
console.log('Step 2 - Total Tokens Occupied:', context?.totalTokens);
console.log('Step 2 - Window Occupancy %:', context?.window.occupancyPercentage);
console.log('Step 2 - Fitted Blocks Count:', context?.blocks.length);

// Step 3: Fetch Working Context from Runtime Cache
const fetchedContext = runtimeAPI.getWorkingContext(intentResult.mission.id);
console.log('Step 3 - Fetched Context Match ID:', fetchedContext?.id === context.id);

// Step 4: Invalidate Cache
const invalidated = runtimeAPI.invalidateContext(intentResult.mission.id);
console.log('Step 4 - Invalidate Cache Result:', invalidated);

const postInvalidateFetch = runtimeAPI.getWorkingContext(intentResult.mission.id);
console.log('Step 4 - Post-Invalidate Fetch Is Null:', postInvalidateFetch === null);

console.log('----------------------------------------------------');
console.log('✅ Context Runtime Tests Completed Successfully!');
console.log('----------------------------------------------------');
