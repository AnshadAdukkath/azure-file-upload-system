const express = require("express");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Azure connection string (from App Service environment variable)
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

// ✅ MUST match Azure container name exactly
const containerName = "uploads";

// Create Blob client
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

app.use(express.static("public"));

// -------------------- UPLOAD ROUTE --------------------
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        // ❌ If file not received
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const blobName = Date.now() + "-" + req.file.originalname;

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // ✅ Upload file correctly
        await blockBlobClient.uploadData(req.file.buffer);

        const fileUrl = blockBlobClient.url;

        console.log("Uploaded:", fileUrl);

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <link rel="stylesheet" href="style.css">
                <style>
                    .success-card { animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                    @keyframes bounceIn {
                        0% { opacity: 0; transform: scale(0.3); }
                        50% { opacity: 1; transform: scale(1.05); }
                        70% { transform: scale(0.9); }
                        100% { transform: scale(1); }
                    }
                    .file-link {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 1rem;
                        border-radius: 12px;
                        word-break: break-all;
                        display: block;
                        margin: 2rem 0;
                        color: #60a5fa;
                        text-decoration: none;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    }
                </style>
            </head>
            <body>
                <div class="blob blob-1"></div>
                <main class="main-container">
                    <div class="card success-card">
                        <div class="upload-icon">✅</div>
                        <h1>Upload Successful!</h1>
                        <p class="subtitle">Your file is now live on the cloud.</p>
                        <a href="${fileUrl}" class="file-link" target="_blank">${fileUrl}</a>
                        <button onclick="window.location.href='/'" class="btn-upload">Upload Another</button>
                    </div>
                </main>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Upload Error:", error.message);
        res.status(500).send("❌ Upload failed: " + error.message);
    }
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});