// backend/controllers/uploadController.js
const AWS = require('aws-sdk');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const sqs = require('../config/sqs');

// AWS S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.uploadPhotos = async (req, res) => {
  const projectId = req.params.projectId;
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const uploadPromises = req.files.map(async (file) => {
      // Compress image
      const compressedBuffer = await sharp(file.buffer)
        .resize({ width: 800 })
        .jpeg({ quality: 70 })
        .toBuffer();

      const key = `${uuidv4()}-${file.originalname}`;
      await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: compressedBuffer,
        ContentType: file.mimetype,
      }).promise();

      const photoUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      // Insert placeholder item
      const [result] = await db.query(
        `INSERT INTO items 
           (project_id, name, model, quantity, price, total_price, source, photo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [projectId, 'Pending Identification', 'N/A', 1, 0.00, 0.00, 'N/A', photoUrl]
      );

      const itemId = result.insertId;

      // Send to SQS
      await sqs.sendMessage({
        QueueUrl: process.env.AWS_SQS_QUEUE_URL,
        MessageBody: JSON.stringify({ itemId, photoUrl }),
      }).promise();
    });

    await Promise.all(uploadPromises);
    res.json({ message: `${req.files.length} files uploaded and queued for processing.` });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};
