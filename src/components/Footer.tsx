import Link from "next/link";
import { CATEGORY_GROUPS } from "@/data/mockDb";

export default function Footer() {
  return (
    <footer className="border-t border-[#212623] bg-[#0A0C0B] py-10 sm:py-12 text-[#8A8F87]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-1.5 font-mono text-sm font-bold tracking-tight text-white group">
              <span className="text-[#8FBF3F] group-hover:translate-x-0.5 transition-transform duration-200">&gt;</span>
              <span>crawlers //</span>
            </Link>
            <p className="text-xs leading-relaxed max-w-md text-[#8A8F87] font-sans">
              Discover AI bots and command utilities organized strictly by the job to be done. We index, verify, and link directly to external creators.
            </p>
          </div>

          {/* Quick Categories / Index Sections */}
          <div>
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-white mb-3">Index Sections</h3>
            <ul className="space-y-1.5 text-xs font-mono">
              {CATEGORY_GROUPS.map((group) => (
                <li key={group.id}>
                  <Link 
                    href={`/#group-${group.id}`} 
                    className="hover:text-[#8FBF3F] transition-colors truncate block"
                  >
                    /{group.id}
                  </Link>
                </li>
              ))}
              <li className="pt-2 flex flex-col gap-1.5 font-sans font-bold text-xs border-t border-[#212623]/60 mt-2">
                <Link href="/stacks" className="text-[#8FBF3F] hover:underline font-mono text-xs">
                  /stacks &rarr;
                </Link>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors font-normal">
                  All 150+ Categories &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-white mb-3">Compliance</h3>
            <p className="text-[11px] leading-relaxed text-[#8A8F87]/80 font-sans">
              We built Crawlers to catalog AI tools by use case. Our crawler searches Product Hunt and GitHub feeds, checks robots.txt to respect site policies, and paraphrases marketing copy in our own words to avoid copyright issues. We don&apos;t embed or iframe external tools — we link you straight to the source.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 border-t border-[#212623]/80 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-center sm:text-left">
          <p className="text-[#8A8F87]/70">&copy; {new Date().getFullYear()} crawlers_index. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 font-sans font-semibold">
            <Link href="/collections" className="hover:text-[#8FBF3F] transition-colors">
              Collections
            </Link>
            <span className="text-[#212623]">|</span>
            <Link href="/submit" className="hover:text-[#8FBF3F] transition-colors">
              Submit Entry
            </Link>
            <span className="text-[#212623]">|</span>
            <span className="text-[#8A8F87]/60 font-normal">Link-out Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
