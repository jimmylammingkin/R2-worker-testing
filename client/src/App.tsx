import { useState } from 'react';
// 【修正處】將類型匯入獨立出來，並使用 'import type'
import type { ChangeEvent, FormEvent } from 'react';
import './App.css';

function App() {
	// 記得將此處換成您自己的 Worker URL
	const WORKER_URL = 'https://r2-worker.wat2002221.workers.dev';

	const [file, setFile] = useState<File | null>(null);
	const [downloadKey, setDownloadKey] = useState<string>('');
	const [status, setStatus] = useState<string>('');

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	const handleUpload = async (e: FormEvent) => {
		e.preventDefault();
		if (!file) {
			setStatus('Please select a file first.');
			return;
		}

		setStatus('1. Requesting upload URL...');
		try {
			// 1. 從 Worker 請求一個預簽章 URL
			const response = await fetch(
				`${WORKER_URL}/upload?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Failed to get pre-signed URL. Server responded with: ${errorText}`);
			}

			const { url } = await response.json();
			setStatus('2. Uploading file to R2...');

			// 2. 使用預簽章 URL 直接將檔案上傳到 R2
			const uploadResponse = await fetch(url, {
				method: 'PUT',
				body: file,
				headers: {
					'Content-Type': file.type,
				},
			});

			if (!uploadResponse.ok) {
				throw new Error(`Upload failed with status: ${uploadResponse.statusText}`);
			}

			setStatus(`✅ Upload successful! File available at key: ${file.name}`);
			// 清空檔案輸入欄位需要操作 DOM 或重設 form
			const form = e.target as HTMLFormElement;
			form.reset();
			setFile(null);
		} catch (error) {
			console.error(error);
			setStatus(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
		}
	};

	const handleDownload = async (e: FormEvent) => {
		e.preventDefault();
		if (!downloadKey) {
			setStatus('Please enter a file key to download.');
			return;
		}

		setStatus('1. Requesting download URL...');
		try {
			// 1. 從 Worker 請求一個預簽章 URL
			const response = await fetch(`${WORKER_URL}/download?filename=${encodeURIComponent(downloadKey)}`);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Failed to get pre-signed URL. Server responded with: ${errorText}`);
			}

			const { url } = await response.json();
			setStatus('2. Redirecting to download...');

			// 2. 將使用者重導向到預簽章 URL 以觸發下載
			window.location.href = url;
		} catch (error) {
			console.error(error);
			setStatus(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
		}
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>Cloudflare R2 File Tester</h1>

				<div className="card">
					<h2>Upload to R2</h2>
					<form onSubmit={handleUpload}>
						<input type="file" onChange={handleFileChange} required />
						<button type="submit" disabled={!file}>
							Upload File
						</button>
					</form>
				</div>

				<div className="card">
					<h2>Download from R2</h2>
					<form onSubmit={handleDownload}>
						<input
							type="text"
							placeholder="Enter file key (e.g., my-image.png)"
							value={downloadKey}
							onChange={(e) => setDownloadKey(e.target.value)}
							required
						/>
						<button type="submit" disabled={!downloadKey}>
							Download File
						</button>
					</form>
				</div>

				{status && <p className="status">Status: {status}</p>}
			</header>
		</div>
	);
}

export default App;
