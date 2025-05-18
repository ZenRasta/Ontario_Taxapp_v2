import { useState } from 'react';
import SimulatorSection from './SimulatorSection';
import {
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';
import './index.css';

function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-white shadow fixed top-0 w-full z-10">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4" aria-label="Main">
        <a href="#hero" className="text-2xl font-bold text-blue-700">RetireSmart</a>
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#strategies" className="text-gray-700 hover:text-blue-600">Strategies</a>
          <a href="#process" className="text-gray-700 hover:text-blue-600">How It Works</a>
          <a href="#why-us" className="text-gray-700 hover:text-blue-600">Why Choose Us</a>
          <a href="#testimonials" className="text-gray-700 hover:text-blue-600">Testimonials</a>
          <a href="#faq" className="text-gray-700 hover:text-blue-600">FAQ</a>
          <a href="#simulator" className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Try It Now</a>
        </div>
        <button className="md:hidden p-2 text-gray-700" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <XMarkIcon className="h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-white shadow">
          <div className="px-6 pb-4 flex flex-col space-y-2">
            <a href="#strategies" className="text-gray-700 hover:text-blue-600">Strategies</a>
            <a href="#process" className="text-gray-700 hover:text-blue-600">How It Works</a>
            <a href="#why-us" className="text-gray-700 hover:text-blue-600">Why Choose Us</a>
            <a href="#testimonials" className="text-gray-700 hover:text-blue-600">Testimonials</a>
            <a href="#faq" className="text-gray-700 hover:text-blue-600">FAQ</a>
            <a href="#simulator" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">Try It Now</a>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section id="hero" className="pt-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800">Plan Your Retirement Withdrawals with Confidence</h1>
          <p className="mt-4 text-xl text-gray-700">Designed for Ontarians 55+, our free simulator uses official CRA rules to help you maximize your retirement income and minimize taxes on your RRSP/RRIF withdrawals.</p>
          <div className="mt-8 flex space-x-4">
            <a href="#simulator" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded">Run a Free Simulation</a>
            <a href="#process" className="border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 py-3 px-6 rounded">Learn How It Works</a>
          </div>
        </div>
        <div className="flex justify-center">
          <img src="/images/retirement_preview.jpg" alt="Couple planning retirement finances" className="w-full max-w-md rounded-md" />
        </div>
      </div>
    </section>
  );
}

function SocialProofBar() {
  return (
    <section aria-label="Social proof" className="bg-gray-50 py-4">
      <p className="text-center text-gray-700 font-medium">Trusted by 200+ retirees across Ontario</p>
      <div className="mt-2 flex justify-center flex-wrap gap-6">
        <img src="/logos/osa.png" alt="Ontario Seniors Association" className="h-8" />
        <img src="/logos/finance_daily.png" alt="Finance Daily" className="h-8" />
        <img src="/logos/planner_pros.png" alt="Planner Pros" className="h-8" />
        <img src="/logos/retire_ready.png" alt="Retire Ready" className="h-8" />
      </div>
    </section>
  );
}

function StrategiesSection() {
  const cards = [
    {
      icon: <ClockIcon className="h-10 w-10 mx-auto text-blue-600" aria-hidden="true" />,
      title: 'Delay CPP/OAS',
      desc: 'Model the impact of deferring your Canada Pension Plan and Old Age Security to age 70 for larger payouts. This strategy can increase your guaranteed income later in retirement.',
    },
    {
      icon: <DocumentTextIcon className="h-10 w-10 mx-auto text-blue-600" aria-hidden="true" />,
      title: 'Bracket Filling',
      desc: 'See how withdrawing just enough from your RRSP/RRIF each year to fill up lower tax brackets can minimize lifetime taxes.',
    },
    {
      icon: <UserGroupIcon className="h-10 w-10 mx-auto text-blue-600" aria-hidden="true" />,
      title: 'Spousal Equalization',
      desc: 'Plan withdrawals between spouses strategically. Balance incomes with your spouse to reduce the overall tax bill and keep both of you in lower tax brackets.',
    },
    {
      icon: <BanknotesIcon className="h-10 w-10 mx-auto text-blue-600" aria-hidden="true" />,
      title: 'Empty RRIF by 85',
      desc: 'Simulate withdrawing a bit more earlier so your RRIF is fully used by age 85. This can prevent large forced withdrawals and reduce taxes on your estate.',
    },
  ];

  return (
    <section id="strategies" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Retirement Withdrawal Strategies You Can Explore</h2>
        <p className="mt-4 text-center text-gray-700">Explore different strategies to minimize taxes and maximize income.</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card) => (
            <div key={card.title} className="bg-white shadow-md rounded p-6 text-center flex flex-col">
              {card.icon}
              <h3 className="mt-4 text-xl font-semibold text-gray-800">{card.title}</h3>
              <p className="mt-2 text-gray-700 flex-grow">{card.desc}</p>
              <a href="#cta" className="mt-4 inline-block text-blue-600 hover:underline">Simulate Now</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    { title: 'Enter Your Info', desc: 'Input a few details about yourself: age, retirement accounts, income needs.' },
    { title: 'Simulate Strategies', desc: 'Run the simulator to see different withdrawal strategies in action.' },
    { title: 'Review Results', desc: 'See your projected outcomes: taxes paid, balances over time, and explanations for each strategy.' },
  ];
  return (
    <section id="process" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">How It Works</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex flex-col items-center">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-lg font-semibold">{idx + 1}</div>
              <h3 className="mt-4 text-xl font-semibold text-gray-800">{step.title}</h3>
              <p className="mt-2 text-gray-700">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:flex md:items-center md:gap-12">
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold text-gray-800">Our Mission</h2>
          <p className="mt-4 text-lg text-gray-700">We help Canadians retire smarter by modeling tax-aware income strategies using real CRA formulas. Our mission is to empower Ontario seniors with accurate retirement planning tools so you can retire with confidence.</p>
          <p className="mt-4 text-lg text-gray-700">500+ simulations run and $1.2M+ in assets optimized to date.</p>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <img src="/images/team.jpg" alt="Our team at RetireSmart" className="w-full max-w-md rounded-md" />
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { quote: 'I was worried about outliving my savings. This simulator showed me exactly how much to withdraw each year – now I feel peace of mind about my retirement plan.', name: 'John M. – Age 62, Toronto', img: '/images/testimonial1.jpg' },
    { quote: 'Thanks to this tool, I discovered a tax trick that will save me thousands. It\u2019s simple but so powerful – I wish I had found it sooner!', name: 'Linda & Mark S. – Retired in Ottawa', img: '/images/testimonial2.jpg' },
    { quote: 'The simulations helped my wife and me coordinate our withdrawals. We\u2019re saving on taxes and understand our finances better. Highly recommend it to any retiree in Ontario.', name: 'Carol B. – 58, Windsor', img: '/images/testimonial3.jpg' },
  ];
  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">What Our Users Are Saying</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white shadow rounded p-6 text-center flex flex-col">
              <div className="relative">
                <img src={t.img} alt={t.name} className="mx-auto rounded" />
                <PlayCircleIcon className="h-12 w-12 text-blue-600 absolute inset-0 m-auto" aria-hidden="true" />
              </div>
              <p className="mt-4 italic text-gray-700">“{t.quote}”</p>
              <p className="mt-2 font-semibold text-gray-800">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUsSection() {
  const negatives = [
    'Uses generic rules of thumb.',
    'May overlook tax-saving opportunities or require manual calculations.',
    'Often requires scheduling meetings or relying on expensive advisors.',
  ];
  const positives = [
    'Personalized, data-driven strategies tailored to your situation.',
    'Optimized for tax efficiency using up-to-date CRA rules in calculations.',
    'Instant results and interactive \u2013 explore scenarios anytime for free.',
  ];
  return (
    <section id="why-us" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Why Choose Us</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-red-50 p-6 rounded">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Traditional Planning</h3>
            <ul className="space-y-2">
              {negatives.map((item) => (
                <li key={item} className="flex items-start">
                  <XCircleIcon className="h-6 w-6 text-red-600 mr-2" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">AI-Assisted Simulation</h3>
            <ul className="space-y-2">
              {positives.map((item) => (
                <li key={item} className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: 'Is my data stored or shared?', a: 'No. We value your privacy. The information you input is not permanently stored, and we never ask for sensitive details like your SIN. Everything stays on your device.' },
    { q: 'Do I need to sign up or pay to use this?', a: 'No sign-up is required, and it\u2019s completely free. You can run unlimited scenarios at no cost.' },
    { q: 'How accurate are the simulations?', a: 'The simulator uses official Canada Revenue Agency formulas and the latest tax rates. For complex situations, consult a professional.' },
    { q: 'What accounts and incomes does this cover?', a: 'The tool models RRSPs, RRIFs, TFSAs, non-registered accounts, and government pensions like CPP and OAS for a comprehensive view.' },
  ];
  return (
    <section id="faq" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">FAQ</h2>
        <div className="mt-8 max-w-3xl mx-auto">
          {faqs.map((f) => (
            <details key={f.q} className="py-4 border-b border-gray-200">
              <summary className="font-semibold text-lg text-gray-800 cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-gray-700">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section id="cta" className="py-16 bg-blue-600 text-white text-center">
      <h2 className="text-3xl font-bold">Ready to secure your retirement?</h2>
      <p className="mt-4 text-lg">Get personalized retirement withdrawal strategies in seconds. It\u2019s free and no signup is needed.</p>
      <a href="#simulator" className="mt-6 inline-block bg-white text-blue-600 font-semibold py-3 px-6 rounded hover:bg-blue-50">Run Your Free Simulation</a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 bg-gray-800 text-gray-300 text-sm">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <p className="mb-4 md:mb-0">© 2025 RetireSmart. All rights reserved.</p>
        <div className="space-x-4">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="font-sans text-gray-900">
      <NavBar />
      <main className="pt-20">
        <HeroSection />
        <SimulatorSection />
        <SocialProofBar />
        <StrategiesSection />
        <ProcessSection />
        <AboutSection />
        <TestimonialsSection />
        <WhyUsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
