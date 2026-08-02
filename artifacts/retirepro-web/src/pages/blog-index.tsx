import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChartLine, ArrowRight, Clock, Tag } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import { BLOG_POSTS as POSTS } from "@/data/blog-posts";

export default function BlogIndex() {
  usePageMeta({
    title: "Retirement Planning Blog — India | RetirePro",
    description: "Expert articles on retirement planning in India — corpus targets, NPS vs PPF vs SIP, FIRE, HNI strategies, and more. No login required.",
    canonical: "https://retirepro.in/blog",
    ogUrl: "https://retirepro.in/blog",
    ogType: "website",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BrandLogo href={null} textClassName="text-slate-800" />
          </Link>
          <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">← Back to Calculator</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              Retirement Planning Guides
            </span>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Learn Before You Plan</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              India-specific retirement planning guides written for working professionals who want clarity, not jargon.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-end p-6`}>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm`}>
                        {post.tag}
                      </span>
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                        {post.title}
                      </h2>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.readTime}</span>
                          <span>·</span>
                          <time dateTime={post.dateTime} className="text-orange-500 font-medium">{post.date}</time>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                          Read article <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Ready to Calculate Your Retirement Number?</h2>
            <p className="text-blue-100 mb-6">Free. No login required. Takes 60 seconds.</p>
            <Link href="/" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors">
              Try the Free Calculator →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
