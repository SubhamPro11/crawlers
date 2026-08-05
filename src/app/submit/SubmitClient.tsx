"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { mockDb, Category } from "@/data/mockDb";

interface SubmitClientProps {
  initialCategories?: Category[];
}

export default function SubmitClient({ initialCategories = [] }: SubmitClientProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id || "");
  const [pricingModel, setPricingModel] = useState<'free' | 'freemium' | 'paid' | 'unknown'>("unknown");
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialCategories.length) {
      mockDb.getCategories().then(cats => {
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      });
    }
  }, [initialCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required");
    if (!url.trim()) return setError("URL is required");
    try {
      new URL(url);
    } catch {
      return setError("Please enter a valid URL (including https://)");
    }
    if (!description.trim()) return setError("Description is required");
    if (description.length > 140) return setError("Description must be 140 characters or less");

    const tags = tagsInput
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const performSubmit = async () => {
      const isDuplicate = await mockDb.checkDuplicate(name.trim(), url.trim());
      if (isDuplicate) {
        setError("This AI bot or website URL is already registered in our directory.");
        return;
      }

      const result = await mockDb.submitTool({
        name: name.trim(),
        url: url.trim(),
        short_description: description.trim(),
        category_id: categoryId,
        pricing_model: pricingModel,
        tags
      });
      if (result) {
        setIsSubmitted(true);
      } else {
        setError("Error submitting tool to database. Try again.");
      }
    };
    performSubmit();
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 mx-auto max-w-xl w-full px-4 py-20 text-center font-sans">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#8FBF3F]/10 text-[#8FBF3F] border border-[#8FBF3F]/20 mb-6">
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
            className="flex h-11 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 px-6 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            Submit Another Bot
          </button>
          <Link
            href="/"
            className="flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] hover:bg-[#7ba235] px-6 text-xs font-semibold text-slate-950 transition-colors"
          >
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 mx-auto max-w-2xl w-full px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 font-sans">
        <Link href="/" className="hover:text-white transition-colors font-sans">Home</Link>
        <span>/</span>
        <span className="text-slate-300 font-sans">Submit a Tool</span>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 mb-8 font-sans">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white">
          Submit an AI Platform
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-sans">
          Suggest a bot or utility for indexing. All submittals undergo a manual compliance review.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-800 bg-[#131B2E] p-6 sm:p-8 shadow-xl shadow-black/20 font-sans">
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
            name="name"
            placeholder="e.g. Midjourney"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[#212623] bg-[#0D0F0E] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#8FBF3F] transition-all"
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
            name="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-[#212623] bg-[#0D0F0E] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#8FBF3F] transition-all"
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
            name="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-[#212623] bg-[#0D0F0E] px-4 py-2.5 text-sm text-white outline-none focus:border-[#8FBF3F] transition-all"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-[#0D0F0E] text-white">
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
            name="description"
            rows={3}
            placeholder="Write a brief, 1-sentence summary of what this tool does. Do not copy paste description text verbatim."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-[#212623] bg-[#0D0F0E] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#8FBF3F] transition-all resize-none"
            maxLength={180}
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
              name="pricing"
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value as 'free' | 'freemium' | 'paid' | 'unknown')}
              className="w-full rounded-lg border border-[#212623] bg-[#0D0F0E] px-4 py-2.5 text-sm text-white outline-none focus:border-[#8FBF3F] transition-all"
            >
              <option value="unknown" className="bg-[#0D0F0E]">Unknown</option>
              <option value="free" className="bg-[#0D0F0E]">Free</option>
              <option value="freemium" className="bg-[#0D0F0E]">Freemium (Free tier + paid upgrades)</option>
              <option value="paid" className="bg-[#0D0F0E]">Paid</option>
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
              name="tags"
              placeholder="e.g. art, vectors, mockup"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-lg border border-[#212623] bg-[#0D0F0E] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#8FBF3F] transition-all"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-800/60 font-sans">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#212623] bg-[#0D0F0E] px-6 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#8FBF3F] px-6 text-sm font-bold text-slate-950 hover:bg-[#7ba235] transition-colors shadow-md shadow-[#8FBF3F]/15 cursor-pointer"
          >
            Submit Platform
          </button>
        </div>
      </form>
    </div>
  );
}
