require('dotenv').config();
const db = require('../config/db');
const s3 = require('../config/s3');
const sqs = require('../config/sqs');
const OpenAI = require('openai');

async function testDB() {
  console.log('Testing database connection...');
  try {
    const [rows] = await db.query('SELECT 1 AS result');
    console.log('DB connected:', rows[0].result);
  } catch (err) {
    console.error('DB connection error:', err);
    throw err;
  }
}

async function testS3() {
  console.log('Testing S3 connection...');
  try {
    const buckets = await s3.listBuckets().promise();
    console.log('S3 buckets:', buckets.Buckets.map(b => b.Name));
  } catch (err) {
    console.error('S3 connection error:', err);
    throw err;
  }
}

async function testSQS() {
  console.log('Testing SQS connection...');
  try {
    const queues = await sqs.listQueues().promise();
    console.log('SQS queues:', queues.QueueUrls);
  } catch (err) {
    console.error('SQS connection error:', err);
    throw err;
  }
}

async function testOpenAI() {
  console.log('Testing OpenAI connection...');
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const models = await openai.models.list();
    console.log('OpenAI models count:', models.data.length);
  } catch (err) {
    console.error('OpenAI connection error:', err);
    throw err;
  }
}

(async () => {
  try {
    await testDB();
    await testS3();
    await testSQS();
    await testOpenAI();
    console.log('All tests passed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('One or more tests failed.');
    process.exit(1);
  }
})(); 