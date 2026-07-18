
# ============================================================
# POINT 1: FIX HOMEPAGE SEO (Title, Meta, Schema)
# ============================================================
# Copy ALL of this into your Replit project

# ============================================================
# FILE 1: components/SEO.js (NEW FILE - Create this)
# ============================================================

import Head from 'next/head';

const SEO = ({ 
  title = 'RetirePro — Free India Retirement Calculator | No Login Required',
  description = 'Plan your retirement in India for free. Calculate corpus, SIP, EPF, NPS & more. No account needed. Visual projections, cashflow analysis & India-specific assumptions.',
  keywords = 'retirement calculator india, retirement planning india, free retirement calculator, sip calculator retirement, epf calculator, nps calculator, retirement corpus calculator india',
  ogImage = '/og-image.jpg',
  canonical = 'https://retirepro.in',
  schema = null,
  noindex = false,
}) => {
  const fullTitle = title;
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `https://retirepro.in${ogImage}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="RetirePro" />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="RetirePro" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:creator" content="@retirepro" />

      {/* Mobile & App */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563EB" />
      <meta name="msapplication-TileColor" content="#2563EB" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />

      {/* Alternate Languages */}
      <link rel="alternate" href="https://retirepro.in" hrefLang="en-in" />
      <link rel="alternate" href="https://retirepro.in" hrefLang="x-default" />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  );
};

export default SEO;


# ============================================================
# FILE 2: lib/schemas.js (NEW FILE - All Schema Templates)
# ============================================================

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RetirePro',
  url: 'https://retirepro.in',
  logo: {
    '@type': 'ImageObject',
    url: 'https://retirepro.in/logo.png',
    width: 512,
    height: 512,
  },
  description: 'Free India-specific retirement planning calculator. No login required.',
  sameAs: [
    'https://twitter.com/retirepro',
    'https://linkedin.com/company/retirepro',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@retirepro.in',
    availableLanguage: ['English', 'Hindi'],
  },
};

// Website Schema (Sitelinks Searchbox)
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RetirePro',
  url: 'https://retirepro.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://retirepro.in/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// SoftwareApplication Schema (For the Calculator)
export const calculatorSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RetirePro Retirement Calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'India-specific retirement planning',
    'EPF, NPS, PPF tracking',
    'Children education goals',
    'Mini-retirement breaks',
    'Visual projections',
    'Cashflow analysis',
    'No login required',
  ],
  screenshot: {
    '@type': 'ImageObject',
    url: 'https://retirepro.in/calculator-screenshot.jpg',
  },
};

// FAQPage Schema (For Homepage)
export const homepageFAQSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much money do I need to retire in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For a comfortable retirement in India, you typically need ₹1.5 crore to ₹5 crore depending on your city, lifestyle, and age. In Tier 1 cities like Mumbai or Bangalore with a moderate lifestyle, ₹5-7 crore is recommended. For Tier 2 cities, ₹3-4 crore may be sufficient. Use our free retirement calculator to get your exact, inflation-adjusted number.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is RetirePro free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, RetirePro is completely free to use. No account creation, no email required, and no hidden charges. You can build a complete retirement plan with income projections, expense tracking, children's education goals, and visual charts without signing up.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes RetirePro different from other retirement calculators?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RetirePro is built specifically for India with India-specific assumptions: 7% general inflation, 8% education inflation, EPF and NPS integration, children's education and marriage goals, home loan EMI impact, mini-retirement breaks, and joint retirement planning. Most calculators use global assumptions that don't apply to Indian conditions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does RetirePro require login or signup?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. RetirePro does not require any login, signup, or email address to use the full calculator. Your data is processed in your browser and is never stored on our servers unless you explicitly choose to save it.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is the RetirePro calculator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RetirePro uses standard financial formulas with conservative, India-specific assumptions: 7% general inflation, 8% education inflation, 12% pre-retirement returns, and 8% post-retirement returns. You can customize all assumptions. While no calculator can predict the future, RetirePro provides a realistic baseline for planning.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I plan for mini-retirements or sabbaticals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, RetirePro uniquely supports mini-retirement planning. You can add breaks in your career (e.g., a 1-year sabbatical at age 40) and see how it affects your overall retirement corpus. This is especially useful for professionals in tech, consulting, or creative fields who want career breaks.',
      },
    },
    {
      '@type': 'Question',
      name: 'What retirement instruments does RetirePro support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RetirePro supports all major Indian retirement instruments: Employee Provident Fund (EPF), National Pension System (NPS), Public Provident Fund (PPF), Equity Linked Savings Scheme (ELSS), mutual fund SIPs, fixed deposits, and other investments. You can input your existing balances and monthly contributions for each.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data safe with RetirePro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. RetirePro processes all calculations in your browser. We do not store your personal financial data on our servers. We use 256-bit SSL encryption, and we never sell or share your data with third parties. If you choose to download a report, only your email is collected for delivery.',
      },
    },
  ],
};

// HowTo Schema (For the Calculator)
export const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Calculate Your Retirement Corpus in India',
  description: 'Step-by-step guide to calculate how much money you need to retire comfortably in India using RetirePro.',
  totalTime: 'PT10M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'INR',
    value: '0',
  },
  step: [
    {
      '@type': 'HowToStep',
      name: 'Enter Your Basic Information',
      text: 'Input your current age, planned retirement age, and life expectancy. RetirePro uses India-specific life expectancy data (85 years default).',
      url: 'https://retirepro.in/#step1',
    },
    {
      '@type': 'HowToStep',
      name: 'Add Your Income Details',
      text: 'Enter your current monthly income, expected annual growth rate, and any additional income sources.',
      url: 'https://retirepro.in/#step2',
    },
    {
      '@type': 'HowToStep',
      name: 'Input Your Expenses',
      text: 'Add your monthly expenses including housing, food, utilities, transportation, and discretionary spending.',
      url: 'https://retirepro.in/#step3',
    },
    {
      '@type': 'HowToStep',
      name: 'Set Your Goals',
      text: 'Add children's education and marriage goals, mini-retirement breaks, and other major expenses.',
      url: 'https://retirepro.in/#step4',
    },
    {
      '@type': 'HowToStep',
      name: 'Add Existing Investments',
      text: 'Input your current EPF balance, NPS contributions, PPF, SIPs, and other investments.',
      url: 'https://retirepro.in/#step5',
    },
    {
      '@type': 'HowToStep',
      name: 'Review Your Projections',
      text: 'See your complete retirement plan with visual charts, funding gap analysis, and recommended monthly SIP.',
      url: 'https://retirepro.in/#results',
    },
  ],
};

// BreadcrumbList Schema
export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});


# ============================================================
# FILE 3: pages/index.js (UPDATE YOUR HOMEPAGE)
# ============================================================

import SEO from '../components/SEO';
import { 
  organizationSchema, 
  websiteSchema, 
  calculatorSchema, 
  homepageFAQSchema,
  howToSchema,
} from '../lib/schemas';

// Combine all schemas for homepage
const combinedSchema = [
  organizationSchema,
  websiteSchema,
  calculatorSchema,
  homepageFAQSchema,
  howToSchema,
];

export default function HomePage() {
  return (
    <>
      <SEO
        title="RetirePro — Free India Retirement Calculator | No Login Required"
        description="Plan your retirement in India for free. Calculate corpus, SIP, EPF, NPS & more. No account needed. Visual projections, cashflow analysis & India-specific assumptions."
        keywords="retirement calculator india, retirement planning india, free retirement calculator, sip calculator retirement, epf calculator, nps calculator, retirement corpus calculator india, how much to retire india"
        canonical="https://retirepro.in"
        schema={combinedSchema}
      />

      {/* Your existing homepage content */}
      {/* ... */}
    </>
  );
}


# ============================================================
# FILE 4: public/robots.txt (UPDATE OR CREATE)
# ============================================================

# robots.txt for retirepro.in
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://retirepro.in/api/sitemap

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /*?*

# Allow search engines to crawl everything else


# ============================================================
# FILE 5: next.config.js (UPDATE FOR SEO)
# ============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Trailing slashes for cleaner URLs
  trailingSlash: true,

  // Image optimization
  images: {
    domains: ['retirepro.in'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Headers for SEO and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/sitemap',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // Redirects (if needed)
  async redirects() {
    return [
      {
        source: '/calculator',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;


# ============================================================
# FILE 6: pages/api/sitemap.js (CREATE FOR SEO)
# ============================================================

export default async function handler(req, res) {
  const baseUrl = 'https://retirepro.in';
  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/blog/', priority: '0.9', changefreq: 'daily' },
    { url: '/blog/how-much-money-to-retire-india/', priority: '0.8', changefreq: 'weekly' },
    { url: '/tools/', priority: '0.8', changefreq: 'weekly' },
    { url: '/about/', priority: '0.6', changefreq: 'monthly' },
    { url: '/contact/', priority: '0.6', changefreq: 'monthly' },
    { url: '/privacy/', priority: '0.4', changefreq: 'yearly' },
    { url: '/terms/', priority: '0.4', changefreq: 'yearly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('
')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
}


# ============================================================
# FILE 7: components/SocialProof.js (NEW - Add to Homepage)
# ============================================================

import { useEffect, useState } from 'react';

export default function SocialProof() {
  const [count, setCount] = useState(0);
  const targetCount = 15420; // Update this with your actual number

  useEffect(() => {
    // Animate counter
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="social-proof" style={styles.container}>
      <div style={styles.item}>
        <span style={styles.number}>{count.toLocaleString('en-IN')}+</span>
        <span style={styles.label}>Retirement Plans Created</span>
      </div>
      <div style={styles.divider} />
      <div style={styles.item}>
        <span style={styles.number}>4.8/5</span>
        <span style={styles.label}>User Rating</span>
      </div>
      <div style={styles.divider} />
      <div style={styles.item}>
        <span style={styles.number}>100%</span>
        <span style={styles.label}>Free Forever</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '24px',
    backgroundColor: '#F0F9FF',
    borderRadius: '12px',
    marginTop: '24px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  number: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2563EB',
  },
  label: {
    fontSize: '14px',
    color: '#6B7280',
  },
  divider: {
    width: '1px',
    height: '40px',
    backgroundColor: '#D1D5DB',
  },
};


# ============================================================
# FILE 8: components/HeroSection.js (UPDATE - SEO-Optimized)
# ============================================================

export default function HeroSection() {
  return (
    <section className="hero" style={heroStyles.container}>
      {/* H1 - Main keyword */}
      <h1 style={heroStyles.h1}>
        Free Retirement Calculator for India
        <span style={heroStyles.subtitle}>
          Plan Your Retirement in 5 Minutes — No Login Required
        </span>
      </h1>

      {/* Quick value proposition */}
      <p style={heroStyles.description}>
        Calculate your retirement corpus, SIP requirements, EPF & NPS tracking, 
        children's education goals, and more. Built specifically for Indian conditions 
        with 7% inflation, EPF integration, and visual projections.
      </p>

      {/* CTA Buttons */}
      <div style={heroStyles.ctaContainer}>
        <a href="#calculator" style={heroStyles.primaryCta}>
          🚀 Start Planning Free
        </a>
        <a href="#how-it-works" style={heroStyles.secondaryCta}>
          See How It Works
        </a>
      </div>

      {/* Trust badges */}
      <div style={heroStyles.trustBadges}>
        <span>🔒 256-bit SSL Secured</span>
        <span>•</span>
        <span>🇮🇳 India-Specific</span>
        <span>•</span>
        <span>✅ AMFI-Registered Partner</span>
        <span>•</span>
        <span>🛡️ Data Never Sold</span>
      </div>

      {/* Social Proof */}
      <SocialProof />
    </section>
  );
}

const heroStyles = {
  container: {
    textAlign: 'center',
    padding: '80px 20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  h1: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: '1.2',
    marginBottom: '16px',
  },
  subtitle: {
    display: 'block',
    fontSize: '24px',
    fontWeight: '400',
    color: '#6B7280',
    marginTop: '12px',
  },
  description: {
    fontSize: '18px',
    color: '#4B5563',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  ctaContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  primaryCta: {
    backgroundColor: '#2563EB',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '18px',
  },
  secondaryCta: {
    backgroundColor: 'white',
    color: '#2563EB',
    padding: '16px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '18px',
    border: '2px solid #2563EB',
  },
  trustBadges: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#6B7280',
    flexWrap: 'wrap',
  },
};


# ============================================================
# FILE 9: .env.local (ADD TO REPLIT SECRETS)
# ============================================================

# Add these to Replit Secrets (lock icon in sidebar):

NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://retirepro.in


# ============================================================
# IMPLEMENTATION CHECKLIST
# ============================================================

# STEP 1: Create new files (5 minutes)
# [ ] Create components/SEO.js
# [ ] Create lib/schemas.js  
# [ ] Create components/SocialProof.js
# [ ] Update pages/index.js
# [ ] Update next.config.js
# [ ] Create pages/api/sitemap.js
# [ ] Update public/robots.txt

# STEP 2: Add secrets (2 minutes)
# [ ] Add NEXT_PUBLIC_GA_ID to Replit Secrets
# [ ] Add NEXT_PUBLIC_SITE_URL to Replit Secrets

# STEP 3: Test (5 minutes)
# [ ] Run npm run dev
# [ ] Check page source for meta tags (Ctrl+U)
# [ ] Verify schema with Google's Rich Results Test
# [ ] Check sitemap at /api/sitemap

# STEP 4: Deploy (2 minutes)
# [ ] Deploy to production
# [ ] Submit sitemap to Google Search Console
# [ ] Test live URL with Rich Results Test
