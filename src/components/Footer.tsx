import Link from "next/link";
import { CATEGORIES } from "@/data/mockDb";

export default function Footer() {
  const quickCategories = CATEGORIES.slice(0, 5);

  return (
    <footer className="border-t border-[#212623] bg-[#0A0C0B] py-12 text-[#8A8F87]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-tight text-white mb-4">
              <span className="text-[#8FBF3F]">&gt;</span>
              <span>crawlers //</span>
            </Link>
            <p className="text-xs leading-5 max-w-xs text-[#8A8F87] font-sans">
              Discover AI bots and command utilities organized strictly by the job to be done. We index, verify, and link directly to external creators.
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-white mb-4">Index Sections</h3>
            <ul className="space-y-2 text-xs font-mono">
              {quickCategories.map((cat) => (
                <li key={cat.id}>
                  <Link 
                    href={`/category/${cat.slug}`} 
                    className="hover:text-[#8FBF3F] transition-colors"
                  >
                    /{cat.slug}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/" className="text-[#8FBF3F] hover:underline font-sans font-bold text-xs">
                  All Categories &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-white mb-4">Compliance</h3>
            <p className="text-[10px] leading-relaxed text-[#8A8F87]/80 font-sans">
              We built Crawlers to catalog AI tools by use case. Our crawler searches Product Hunt and GitHub feeds, checks robots.txt to respect site policies, and paraphrases marketing copy in our own words to avoid copyright issues. We don&apos;t embed or iframe external tools — we link you straight to the source.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-[#212623]/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-sans">
          <p>&copy; {new Date().getFullYear()} crawlers_index. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0 font-sans font-semibold">
            <Link href="/submit" className="hover:text-[#8FBF3F] transition-colors">
              Submit Entry
            </Link>
            <span className="text-slate-800">|</span>
            <Link href="/api" className="hover:text-[#8FBF3F] transition-colors">
              API
            </Link>
            <span className="text-slate-800">|</span>
            <span className="text-[#8A8F87]/60 font-normal">Link-out Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
