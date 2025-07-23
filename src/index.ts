import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Hono } from 'hono';
import { cors } from 'hono/cors'; // <--- 確保有這一行

// This defines the expected environment variables
// MY_BUCKET is the R2 binding
// R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY are automatically available
// to the worker when the R2 binding is configured.
export interface Env {
	MY_BUCKET: R2Bucket;
	R2_ACCOUNT_ID: string;
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors()); // <--- 確保有這一行

// Helper function to initialize the S3 client
const createS3Client = (env: Env) => {
	return new S3Client({
		region: 'auto',
		endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: env.R2_ACCESS_KEY_ID,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY,
		},
	});
};

// Route to get a pre-signed URL for uploading a file
app.get('/upload', async (c) => {
	const s3 = createS3Client(c.env);
	const { filename, contentType } = c.req.query();

	if (!filename || !contentType) {
		return c.json({ error: 'Filename and contentType are required' }, 400);
	}

	const bucketName = 'testing';

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: filename,
		ContentType: contentType,
	});

	const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour

	return c.json({ url });
});

// Route to get a pre-signed URL for downloading a file
app.get('/download', async (c) => {
	const s3 = createS3Client(c.env);
	const { filename } = c.req.query();

	if (!filename) {
		return c.json({ error: 'Filename is required' }, 400);
	}

	const bucketName = 'testing';

	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: filename,
	});

	const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour

	return c.json({ url });
});

export default app;
