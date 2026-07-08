"use client";

import { useState } from "react";
import Link from "next/link";
import { mockDb, CATEGORIES } from "@/data/mockDb";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(CATEGORIES[0]?.id || "");
  const [pricingModel, setPricingModel] = useState<'free' | 'freemium' | 'paid' | 'unknown'>("unknown");
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple validations
    if (!name.trim()) return setError("Name is required");
    if (!url.trim()) return setError("URL is required");
    try {
      new URL(url); // Validates URL format
    } catch {
      return setError("Please enter a valid URL (including https://)");
    }
    if (!description.trim()) return setError("Description is required");
    if (description.length > 140) return setError("Description must be 140 characters or less");

    // Parse tags
    const tags = tagsInput
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    // Submit to mock database
    mockDb.submitTool({
      name: name.trim(),
      url: url.trim(),
      short_description: description.trim(),
      category_id: categoryId,
      pricing_model: pricingModel,
      tags
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 mx-auto max-w-xl w-full px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 mb-6">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-4">Submission Received!</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Thank you for submitting <strong className="text-white">{name}</strong>. Our moderators will verify the link and compliance criteria before approving.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setName("");
              setUrl("");
              setDescription("");
              setTagsInput("");
              setPricingModel("unknown");
            }}
            className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            Submit Another Bot
          </button>
          <Link
            href="/"
            className="rounded-lg bg-[#10B981] hover:bg-[#059669] px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors"
          >
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 mx-auto max-w-2xl w-full px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-300">Submit a Tool</span>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Submit an AI Platform
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Suggest a bot or utility for indexing. All submittals undergo a manual compliance review.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-800 bg-[#131B2E] p-6 sm:p-8 shadow-xl shadow-black/20">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Tool/Bot Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="e.g. Midjourney"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#10B981] transition-all"
            required
          />
        </div>

        {/* URL */}
        <div>
          <label htmlFor="url" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Website URL (Canonical Link)
          </label>
          <input
            type="url"
            id="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#10B981] transition-all"
            required
          />
          <p className="text-[10px] text-slate-500 mt-1.5">
            Link-out only. We do not iframe or embed tools.
          </p>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Primary Use Case Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-2.5 text-sm text-white outline-none focus:border-[#10B981] transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-[#0B0F17] text-white">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Short Description (Own words, no marketing copy)
            </label>
            <span className={`text-[10px] font-semibold ${description.length > 140 ? 'text-red-400' : 'text-slate-500'}`}>
              {description.length}/140 chars
            </span>
          </div>
          <textarea
            id="description"
            rows={3}
            placeholder="Write a brief, 1-sentence summary of what this tool does. Do not copy paste description text verbatim."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#10B981] transition-all resize-none"
            maxLength={180} // Give a bit of margin but validate strictly on 140
            required
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Paraphrase features clearly. Max 140 characters.
          </p>
        </div>

        {/* Grid for Pricing & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing Model */}
          <div>
            <label htmlFor="pricing" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pricing Model
            </label>
            <select
              id="pricing"
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value as any)}
              className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-2.5 text-sm text-white outline-none focus:border-[#10B981] transition-all"
            >
              <option value="unknown" className="bg-[#0B0F17]">Unknown</option>
              <option value="free" className="bg-[#0B0F17]">Free</option>
              <option value="freemium" className="bg-[#0B0F17]">Freemium (Free tier + paid upgrades)</option>
              <option value="paid" className="bg-[#0B0F17]">Paid</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              id="tags"
              placeholder="e.g. art, vectors, mockup"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-[#0B0F17] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#10B981] transition-all"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-800/60">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-800 bg-[#0b0f17] px-6 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#10B981] px-6 text-sm font-bold text-slate-950 hover:bg-[#059669] transition-colors shadow-md shadow-[#10B981]/15"
          >
            Submit Platform
          </button>
        </div>
      </form>
    </div>
  );
}
