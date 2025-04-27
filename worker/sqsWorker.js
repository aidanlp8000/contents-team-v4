// worker/sqsWorker.js
require('dotenv').config();
const AWS = require('aws-sdk');
const { Configuration, OpenAIApi } = require('openai');
const mysql = require('mysql2/promise');

// AWS SQS client
const sqs = new AWS.SQS({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// OpenAI client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Process messages from SQS
async function processMessages() {
  const params = {
    QueueUrl: process.env.AWS_SQS_QUEUE_URL,
    MaxNumberOfMessages: 5,
    WaitTimeSeconds: 10,
  };

  try {
    const data = await sqs.receiveMessage(params).promise();
    if (!data.Messages || data.Messages.length === 0) {
      return;
    }

    for (const message of data.Messages) {
      const { itemId, photoUrl } = JSON.parse(message.Body);
      try {
        // Send photo URL to GPT-4o for identification
        const response = await openai.createChatCompletion({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a contents inventory assistant. Identify the item in the photo and provide a product name and model if available.',
            },
            {
              role: 'user',
              content: `Identify this item from the photo: ${photoUrl}`,
            },
          ],
        });

        const content = response.data.choices[0].message.content;
        let [namePart, modelPart] = content.split('Model:');
        const name = namePart.trim();
        const model = modelPart ? modelPart.trim() : 'N/A';

        // Update the item in the database
        await db.query(
          'UPDATE items SET name = ?, model = ? WHERE id = ?',
          [name, model, itemId]
        );

        // Delete message on success
        await sqs
          .deleteMessage({
            QueueUrl: process.env.AWS_SQS_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          })
          .promise();
      } catch (err) {
        console.error('Error processing item', itemId, err);
        // Do not delete message, let it retry
      }
    }
  } catch (err) {
    console.error('Error receiving messages', err);
  }
}

// Poll SQS every 5 seconds
setInterval(processMessages, 5000);
