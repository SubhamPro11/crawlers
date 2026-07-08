import Link from "next/link";
import { CATEGORIES } from "@/data/mockDb";

export default function Footer() {
  // Take a subset of categories for quick links
  const quickCategories = CATEGORIES.slice(0, 5);

  return (
    <footer className="border-t border-[#1E293B] bg-[#090D14] py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#10B981] to-[#06B6D4] text-white font-bold text-sm">
                ⚡
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Crawlers
              </span>
            </Link>
            <p className="text-sm max-w-xs leading-6 text-slate-400">
              Discover the right AI bots and tools categorized purely by the job you need to get done. Link-out directly to official platforms.
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {quickCategories.map((cat) => (
                <li key={cat.id}>
                  <Link 
                    href={`/category/${cat.slug}`} 
                    className="hover:text-[#10B981] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/" className="text-[#10B981] hover:underline font-medium">
                  View All &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Compliance</h3>
            <p className="text-xs leading-5 text-slate-500">
              Our indexing engine complies with standard robots.txt specifications. Descriptions are parsed, paraphrased, and rewritten. External links belong to their respective trademarks and owners.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>&copy; {new Date().getFullYear()} Crawlers Directory. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/submit" className="hover:text-white transition-colors">
              Submit a Bot
            </Link>
            <span>&middot;</span>
            <span className="text-slate-600">Link-out Only Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
