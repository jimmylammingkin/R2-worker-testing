Cloudflare R2 File Upload/Download Tester
This project demonstrates how to securely upload and download files to a Cloudflare R2 bucket from a React frontend.

It uses a secure architecture where the frontend never handles secret keys. Instead, a backend Cloudflare Worker generates temporary, secure pre-signed URLs for the client to interact directly with the R2 bucket.

Project Structure
r2-worker/: The backend Cloudflare Worker that handles API requests.

client/: The frontend React + TypeScript application.

1. Prerequisites
Before you begin, ensure you have the following installed:

Node.js and npm (Node v18 or later recommended)

A Cloudflare account

You will also need to install the Cloudflare Wrangler CLI. Open your terminal and run:

npm install -g wrangler

2. Cloudflare Setup
You need to configure three things in your Cloudflare dashboard: an R2 bucket, an R2 API Token, and the bucket's CORS policy.

A. Create an R2 Bucket
Navigate to your Cloudflare Dashboard -> R2.

Click Create bucket, give it a name (e.g., testing), and click Create bucket.

Note your R2 Account ID, which is displayed on the right side of the R2 homepage. You will need this later.

B. Create an R2 API Token
The worker needs API credentials to generate pre-signed URLs.

From the R2 homepage, click Manage R2 API Tokens on the right.

Click Create API Token.

Give the token a description (e.g., worker-token).

For Permissions, select Admin Read & Write.

Click Create API Token.

Important: Immediately copy the Access Key ID and the Secret Access Key. You will not be able to see the secret key again.

C. Configure Bucket CORS Policy
To allow your browser to upload files directly to the bucket, you must set a CORS policy.

Go back to your R2 bucket's main page and click on the Settings tab.

Scroll down to CORS Policy and click Add CORS policy.

Delete the default content and paste the following JSON. For development, AllowedOrigins: ["*"] is easiest.

[
  {
    "AllowedOrigins": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]

Click Save.

3. Backend Setup (Cloudflare Worker)
Navigate to the Worker Directory:
Open your terminal and cd into the r2-worker folder.

Install Dependencies:

npm install

Configure wrangler.jsonc:
Open the wrangler.jsonc file.

Find the "vars" section.

Replace YOUR_R2_ACCOUNT_ID_HERE with your actual R2 Account ID from step 2A.

Ensure R2_BUCKET_NAME matches the name of the bucket you created.

Set Worker Secrets:
Run the following commands in your terminal. Wrangler will prompt you to paste the API token values you saved in step 2B.

# Set the Access Key ID
npx wrangler secret put R2_ACCESS_KEY_ID

# Set the Secret Access Key
npx wrangler secret put R2_SECRET_ACCESS_KEY

Deploy the Worker:

npx wrangler deploy

After deployment, wrangler will output a URL for your worker (e.g., https://r2-worker.your-name.workers.dev). Copy this URL.

4. Frontend Setup (React Client)
Navigate to the Client Directory:
In a new terminal window, cd into the client folder.

Install Dependencies:

npm install

Configure Worker URL:

Open the client/src/App.tsx file.

Find the WORKER_URL constant at the top of the file.

Replace the placeholder URL with the actual URL of your deployed worker that you copied in the previous step.

Run the Development Server:

npm run dev

Your browser should open to http://localhost:5173 (or a similar address).

5. Usage
You should now see the web interface:

Upload: Click "Choose File", select a file from your computer, and click "Upload File".

Download: After a successful upload, the file's name (its "key") will be displayed. Enter this key into the download input field and click "Download File".
