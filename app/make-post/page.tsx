"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Post = {
	id: string;
	title: string;
	body: string;
	img?: string | null; // data URL
	code?: string | null;
	createdAt: number;
};

export default function MakePostPage() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [imgPreview, setImgPreview] = useState<string | null>(null);
	const [codeSnippet, setCodeSnippet] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState("");
	const fileRef = useRef<HTMLInputElement | null>(null);

	const handleFile = (file?: File) => {
		if (!file) return setImgPreview(null);
		const reader = new FileReader();
		reader.onload = () => {
			setImgPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const onSelectFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		const f = e.target.files?.[0];
		if (f) handleFile(f);
		else setImgPreview(null);
	};

	const savePostToLocal = (post: Post) => {
		try {
			const raw = localStorage.getItem("feed_posts");
			const arr: Post[] = raw ? JSON.parse(raw) : [];
			// prepend so newest shows first
			arr.unshift(post);
			localStorage.setItem("feed_posts", JSON.stringify(arr));
			// notify other parts of the app
			window.dispatchEvent(new CustomEvent("feed_updated", { detail: post }));
		} catch (e) {
			console.error("Failed to save post", e);
		}
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!title.trim() && !body.trim()) {
			window.alert("Please enter a title or body for your post.");
			return;
		}

		setSubmitting(true);
		const post: Post = {
			id: String(Date.now()),
			title: title.trim(),
			body: body.trim(),
			img: imgPreview,
			code: codeSnippet || null,
			createdAt: Date.now(),
		};

		savePostToLocal(post);
		setSuccess("Post published!");
		setTitle("");
		setBody("");
		setImgPreview(null);
		setCodeSnippet("");
		if (fileRef.current) fileRef.current.value = "";

		// small delay so user sees success then redirect to /feed
		setTimeout(() => {
			setSuccess("");
			router.push("/feed");
		}, 800);

		setSubmitting(false);
	};

	const handleCancel = () => {
		router.back();
	};

	return (
		<main className="container mx-auto px-4 py-6">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl font-semibold mb-4">Create Post</h1>

				<form onSubmit={handleSubmit} className="card bg-base-100 shadow p-4 space-y-4">
					<div>
						<label className="label">
							<span className="label-text">Title</span>
						</label>
						<input
							className="input input-bordered w-full"
							placeholder="Short, catchy title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={120}
						/>
					</div>

					<div>
						<label className="label">
							<span className="label-text">Body</span>
						</label>
						<textarea
							className="textarea textarea-bordered w-full h-36"
							placeholder="Share something with everyone..."
							value={body}
							onChange={(e) => setBody(e.target.value)}
						/>
					</div>

					<div>
						<label className="label">
							<span className="label-text">Image (optional)</span>
						</label>
						<input ref={fileRef} type="file" accept="image/*" className="file-input file-input-bordered w-full" onChange={onSelectFile} />
						{imgPreview && (
							<div className="mt-3">
								<div className="text-sm text-gray-500 mb-2">Preview</div>
								<div className="overflow-hidden rounded-md border">
									<img src={imgPreview} alt="preview" className="w-full object-cover max-h-72" />
								</div>
							</div>
						)}
					</div>

								{/* Code snippet section (optional) */}
								<div>
									<label className="label">
										<span className="label-text">Code Snippet (optional)</span>
									</label>
									<textarea
										className="textarea textarea-bordered w-full h-28"
										placeholder="Paste a command or small code snippet (e.g. npm i daisyui)"
										value={codeSnippet}
										onChange={(e) => setCodeSnippet(e.target.value)}
									/>
									{codeSnippet && (
										<div className="mt-3 mockup-code w-full">
											{codeSnippet.split("\n").map((line, i) => (
												<pre key={i} {...(i === 0 ? { 'data-prefix': '$' } : {'data-prefix': '$'})}>
													<code>{line || '\u00A0'}</code>
												</pre>
											))}
										</div>
									)}
								</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<button type="submit" className={`btn btn-primary ${submitting ? 'loading' : ''}`} disabled={submitting}>
								Post
							</button>
							<button type="button" className="btn btn-ghost" onClick={handleCancel}>
								Cancel
							</button>
						</div>

						<div className="text-sm opacity-80">
							<span>{title.length}/120</span>
						</div>
					</div>

					{success && <div className="alert alert-success mt-2">{success}</div>}
				</form>
			</div>
		</main>
	);
}

