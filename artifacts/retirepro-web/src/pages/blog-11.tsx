import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import { usePageMeta } from "@/hooks/usePageMeta";
import NewsletterWidget from "@/components/newsletter-widget";

const ARTICLE_META = {
  headline: "The Mini-Retirement Test: How a Techie Can Take 3 Years Off to Build a Startup Without Wrecking Retirement",
  description: "Thinking of quitting your tech job to build something? Run the sabbatical as a mini-retirement first. Here's the math on runway, paused SIPs and child goals.",
  datePublished: "2026-08-01",
  dateModified: "2026-08-01",
  slug: "sabbatical-mini-retirement-startup-calculator",
  readTime: "11 min read",
  author: "RetirePro Editorial",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: ARTICLE_META.headline,
  description: ARTICLE_META.description,
  author: { "@type": "Organization", name: "RetirePro Editorial", url: "https://retirepro.in" },
  publisher: {
    "@type": "Organization",
    name: "RetirePro",
    url: "https://retirepro.in",
    logo: { "@type": "ImageObject", url: "https://retirepro.in/og-image.jpg" },
  },
  datePublished: ARTICLE_META.datePublished,
  dateModified: ARTICLE_META.dateModified,
  mainEntityOfPage: { "@type": "WebPage", "@id": `https://retirepro.in/blog/${ARTICLE_META.slug}` },
  image: "https://retirepro.in/og-image.jpg",
};

export default function Blog11() {
  usePageMeta({
    title: "Mini Retirement Before a Startup: The 3-Year Sabbatical Math | RetirePro",
    description: ARTICLE_META.description,
    canonical: `https://retirepro.in/blog/${ARTICLE_META.slug}`,
    ogUrl: `https://retirepro.in/blog/${ARTICLE_META.slug}`,
    ogType: "article",
  });

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <BrandLogo textClassName="text-slate-800" />
          <Link href="/free-plan" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
            Free Calculator <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero — editorial style, no gradient overkill */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-5 block">
              Mini Retirement · Career Breaks · India
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-6">
              The Mini-Retirement Test: How a Techie Can Take 3 Years Off to Build a Startup Without Wrecking Retirement
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="font-medium text-slate-600">RetirePro Editorial</span>
              <span>·</span>
              <time dateTime={ARTICLE_META.datePublished}>1 Aug 2026</time>
              <span>·</span>
              <span>{ARTICLE_META.readTime}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Article body */}
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="prose prose-slate prose-lg max-w-none"
          style={{ lineHeight: "1.8" }}
        >

          <p className="text-xl text-slate-600 leading-relaxed mb-8 font-normal not-prose">
            Every few months, a version of this conversation happens in a Bengaluru cafe or a Pune WFH Slack huddle.
          </p>

          {/* Pull quote */}
          <blockquote className="not-prose border-l-4 border-amber-400 pl-6 my-8">
            <p className="text-lg italic text-slate-700 leading-relaxed">
              "I've got the idea. I've got a co-founder. I've got maybe 30 lakh saved. I just don't know if I can afford three years without a salary."
            </p>
          </blockquote>

          <p className="text-slate-700 leading-relaxed mb-6">
            And then nothing happens. Not because the idea was bad. Because the question stayed vague. "Can I afford it?" is not a question a spreadsheet can answer — it's a feeling, and feelings at 2 AM always vote no.
          </p>

          <p className="text-slate-700 leading-relaxed mb-6">
            Here's the reframe that turns it into an answerable question.
          </p>

          {/* Standalone callout — editorial style */}
          <div className="not-prose bg-amber-50 border border-amber-200 rounded-xl px-6 py-5 my-8">
            <p className="text-amber-900 font-semibold text-lg leading-snug">A sabbatical is a mini-retirement.</p>
            <p className="text-amber-800 text-sm mt-2 leading-relaxed">
              Financially, it's identical. Income stops. Expenses continue. You either live off a corpus or you don't.
              The only difference is that a mini-retirement is temporary and you're doing it at 34 instead of 60.
            </p>
          </div>

          <p className="text-slate-700 leading-relaxed mb-6">
            Which means the tool that answers "can I retire?" is the exact same tool that answers "can I take three years to build this?"
          </p>

          {/* --- */}
          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Why "how much runway do I need" is the wrong first question</h2>

          <p className="text-slate-700 leading-relaxed mb-5">
            Most people planning a startup break calculate one number: monthly expenses × months of runway.
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            Say your household burn is ₹1.1 lakh a month. Three years is ₹39.6 lakh. Add a buffer, call it ₹45 lakh. You have ₹30 lakh. Conclusion: not yet, save more.
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            That calculation isn't wrong. It's just answering the smallest question in the room.
          </p>

          <p className="text-slate-700 leading-relaxed">
            The bigger question is what those three years cost your 60-year-old self. Because runway money is money you <em>spend</em> — you feel it, you can count it, you can top it up later. The retirement damage is money you <em>never invested</em>, and that number is much larger and completely invisible.
          </p>

          {/* --- */}
          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">The hidden cost: three years of paused SIPs</h2>

          <p className="text-slate-700 leading-relaxed mb-5">
            Let's put numbers on it.
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            Take a 34-year-old engineer investing ₹60,000 a month across equity mutual funds, planning to retire at 60. She pauses everything for three years to build her startup.
          </p>

          {/* Numbers — compact, editorial */}
          <div className="not-prose grid grid-cols-2 gap-4 my-8">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Missed contributions</p>
              <p className="text-3xl font-bold text-slate-800">₹21.6L</p>
              <p className="text-xs text-slate-500 mt-1">Feels manageable — it's 3 years of SIPs</p>
            </div>
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Missing corpus at 60</p>
              <p className="text-3xl font-bold text-amber-700">₹2.8 Cr</p>
              <p className="text-xs text-amber-600 mt-1">What those rupees would have compounded to</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 -mt-4 mb-8 not-prose">
            Illustration assumes 11% annualised return, monthly compounding, contributions resumed unchanged after the break. Actual returns will differ — this is arithmetic, not a forecast.
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            Read those two numbers again. ₹21.6 lakh of missed contributions, ₹2.8 crore of missing corpus. The gap is the compounding those particular rupees would have earned over 26 years — and they were your <em>earliest</em> rupees, the ones with the most time to work.
          </p>

          <p className="text-slate-700 leading-relaxed">
            This is the number nobody calculates before they resign. Not because it's hard, but because nobody thinks to look 26 years out when they're staring at 36 months of runway.
          </p>

          {/* --- */}
          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">The number that actually decides it</h2>

          <p className="text-slate-700 leading-relaxed mb-5">
            Now here's the part that flips the story.
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            If she resumes investing at 37 and increases her SIP by roughly <strong>₹22,500 a month</strong>, she lands back in approximately the same place at 60. (Same 11% assumption, 23 years of contributions from age 37.)
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            That's the real decision. Not "can I afford three years off" — but <strong>after the break, can I sustain a SIP that's about ₹22,500 higher than before?</strong>
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            For a senior engineer returning to a ₹50L+ role, or a founder whose company found some traction, or someone who steps back into consulting at a higher rate — that's a very different conversation from "you'll never retire."
          </p>

          <p className="text-slate-700 leading-relaxed">
            And if the answer is no? Then you now know something concrete. Maybe the break is two years instead of three. Maybe you keep a ₹20,000 SIP running through the break, which changes the catch-up requirement dramatically. Maybe you retire at 62 instead of 60. These are <em>dials</em>, and you can only turn dials you can see.
          </p>

          {/* --- */}
          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Running your own mini-retirement scenario</h2>

          <p className="text-slate-700 leading-relaxed mb-6">
            This is exactly what RetirePro was built to model — a plan, not just a number. Here's the sequence:
          </p>

          <div className="not-prose space-y-4 mb-8">
            {[
              {
                n: "01",
                title: "Build your baseline",
                body: "Age, current corpus, monthly SIP, expected retirement age, current monthly expenses. Save this projection. This is your 'stay employed' scenario — everything gets compared against it.",
              },
              {
                n: "02",
                title: "Model the break",
                body: "Reduce contributions to zero (or to whatever you'll realistically maintain) for the sabbatical years. Then resume at the level you honestly expect post-break — not a fantasy number.",
              },
              {
                n: "03",
                title: "Subtract the runway",
                body: "Your ₹45 lakh of living expenses during the break comes out of investable savings. Many people forget this and double-count the same money as both runway and retirement corpus. Reduce your starting corpus accordingly.",
              },
              {
                n: "04",
                title: "Compare the two saved projections",
                body: "You'll see the corpus gap at 60 and, more usefully, whether your retirement income still covers your retirement expenses. A ₹2.8 crore gap on a ₹12 crore requirement is a serious problem. The same gap when your plan already had comfortable headroom is a rounding error you can close with one good year.",
              },
              {
                n: "05",
                title: "Turn the dials",
                body: "Two years instead of three. A ₹15,000 SIP maintained through the break. Retirement at 62. Watch which lever moves the needle most — the answer is often not the one you expected.",
              },
            ].map(step => (
              <div key={step.n} className="flex gap-5">
                <span className="flex-shrink-0 font-mono text-sm font-bold text-amber-500 w-7 pt-0.5">{step.n}</span>
                <div>
                  <p className="font-semibold text-slate-900 text-sm mb-1">{step.title}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* --- */}
          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">If you're married with kids, the picture changes shape</h2>

          <p className="text-slate-700 leading-relaxed mb-5">
            A single 30-year-old taking a startup break is playing with their own future. A 36-year-old with a four-year-old is playing with someone else's, and that deserves harder math — not vetoes, just harder math.
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            A course costing ₹25 lakh today, needed in 15 years, at 8% education inflation, works out to roughly <strong>₹79 lakh</strong>. That's not a distant abstraction — it's a bill with a due date, and unlike retirement, you cannot postpone it or take a loan against your own future.
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            Model these as separate goals with their own timelines, and the sabbatical question sharpens: does the break push a corpus shortfall into the exact year your child starts college? Because a retirement gap at 60 has 26 years of runway to fix. An education gap in year 15 does not.
          </p>

          <p className="text-slate-700 leading-relaxed mb-4">Two practical points for anyone doing this with a family:</p>

          <div className="not-prose space-y-3 mb-6">
            <div className="bg-slate-50 border-l-4 border-slate-300 pl-4 py-3 rounded-r-lg">
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Health insurance.</strong> The day you resign, your corporate cover ends — and it was probably covering your spouse, children and possibly parents. Buy an independent family floater <em>before</em> you resign, while you're still an employed applicant with clean paperwork. The premium is a permanent new line item in your household budget, so put it in the plan.
              </p>
            </div>
            <div className="bg-slate-50 border-l-4 border-slate-300 pl-4 py-3 rounded-r-lg">
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Runway and emergency fund are not the same money.</strong> Runway funds the startup years. The emergency fund handles the medical event or family crisis that happens <em>during</em> those years. If one pot serves both, one bad month ends the venture. Keep six months of household expenses fenced off and untouchable.
              </p>
            </div>
          </div>

          <p className="text-slate-700 leading-relaxed">
            Also worth doing: a joint conversation, both partners looking at the same projection. Startup breaks strain marriages far more often through unspoken financial anxiety than through actual money problems. A shared, visible number removes the guessing.
          </p>

          {/* --- */}
          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">What "the number isn't shaking" actually looks like</h2>

          <p className="text-slate-700 leading-relaxed mb-5">You'll know your plan survives the break when three things are true:</p>

          <div className="not-prose space-y-3 mb-8">
            {[
              "The retirement projection still meets your target income at your target age — with the break modelled and the runway subtracted.",
              "The catch-up SIP is realistic given the income you can plausibly earn afterward, whether the startup works or not.",
              "Every dated goal in between still gets funded — education, home loan closure, parental support — without borrowing against the retirement corpus.",
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-700 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          <p className="text-slate-700 leading-relaxed mb-5">
            Hit all three and the honest answer is: <em>go build the thing.</em> You've stress-tested the downside and it holds.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Miss one and you haven't been told no. You've been told which variable to change first.
          </p>

          {/* Pull quote — second one */}
          <blockquote className="not-prose border-l-4 border-slate-300 pl-6 my-10">
            <p className="text-lg text-slate-600 italic leading-relaxed">
              "Most people treat the startup dream and the retirement plan as enemies — as if pursuing one means abandoning the other. So they either leap without looking, or they never leap at all and spend the next twenty years wondering."
            </p>
          </blockquote>

          <p className="text-slate-700 leading-relaxed mb-5">
            Both of those come from the same root problem: <strong>not knowing the number.</strong>
          </p>

          <p className="text-slate-700 leading-relaxed mb-5">
            The most expensive assumption in Indian personal finance isn't a bad fund choice or a mistimed market entry. It's assuming you're on track without ever having calculated it. That assumption keeps some people in jobs they've outgrown, and it sends others into ventures they genuinely couldn't afford.
          </p>

          <p className="text-slate-700 leading-relaxed">
            Run the numbers and you get something better than confidence. You get <em>permission</em> — or a specific, fixable reason why not yet.
          </p>

          {/* CTA — inline, not garish */}
          <div className="not-prose my-12 bg-slate-900 rounded-2xl p-8">
            <h3 className="text-white font-bold text-xl mb-2">Model your mini-retirement in a few minutes</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              RetirePro is free to use. Build your baseline plan, save it, then model the sabbatical — paused contributions, reduced corpus, catch-up SIP, child goals and all. See exactly what three years costs, and exactly what it takes to make it back.
            </p>
            <Link
              href="/free-plan"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-full transition-colors text-sm"
            >
              Calculate my retirement number <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <NewsletterWidget source="blog-sabbatical-mini-retirement-startup-calculator" />

          {/* Disclaimer */}
          <p className="text-xs text-slate-400 leading-relaxed mt-8 not-prose border-t border-slate-100 pt-6">
            All figures in this article are illustrative calculations based on stated assumptions about returns and inflation, included to demonstrate how compounding works over long periods. They are not projections, guarantees or predictions of future returns. Mutual fund investments are subject to market risks; read all scheme related documents carefully. This article is for educational purposes and does not constitute investment advice. Please consult a registered financial advisor before making decisions based on your personal circumstances.
          </p>

          {/* Related Articles */}
          <div className="not-prose mt-12 pt-10 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Keep reading</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  slug: "how-much-money-to-retire-in-india",
                  title: "How Much Money Do I Need to Retire in India? The Honest Answer",
                  tag: "Retirement Basics",
                  tagColor: "text-orange-600",
                  gradient: "from-red-900 via-orange-800 to-slate-900",
                },
                {
                  slug: "retirement-corpus-calculator-india-serious-planners",
                  title: "Why Serious Retirement Planners Are Ditching Quick Google Calculators",
                  tag: "Serious Planning",
                  tagColor: "text-amber-700",
                  gradient: "from-slate-900 via-amber-950 to-orange-900",
                },
                {
                  slug: "retirement-planning-self-employed-india",
                  title: "Retirement Planning for Self-Employed Indians: The Complete Guide",
                  tag: "Self-Employed",
                  tagColor: "text-blue-600",
                  gradient: "from-indigo-900 via-blue-900 to-slate-900",
                },
              ].map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`h-20 bg-gradient-to-br ${post.gradient}`} />
                  <div className="p-4">
                    <span className={`text-xs font-semibold ${post.tagColor}`}>{post.tag}</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1 leading-snug group-hover:text-amber-600 transition-colors">
                      {post.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/blog" className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 text-sm">
                ← Back to all articles
              </Link>
            </div>
          </div>

        </motion.div>
      </article>
    </div>
  );
}
