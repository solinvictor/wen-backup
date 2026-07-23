import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="bg-grain pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <p className="font-data text-[12px] text-pepper uppercase tracking-[0.2em] mb-5">About WEN</p>
            <h1 className="font-display text-soil tracking-tight mb-6" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
              Who we are
            </h1>
            <p className="text-stone text-[16px] leading-relaxed mb-4">
              WEN is a farm-to-market distribution network that connects local farmers directly with buyers.
            </p>
            <p className="text-soil text-[17px] leading-relaxed font-body italic">
              We are not just a marketplace — we are a bridge between production and consumption.
            </p>
          </div>
        </section>

        <section className="bg-grain-dim py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div>
              <h2 className="font-display text-soil text-2xl mb-3">Our Mission</h2>
              <p className="text-stone text-[15px] leading-relaxed">
                To make food supply more efficient by empowering farmers and giving consumers direct access to fresh, affordable produce.
              </p>
            </div>
            <div>
              <h2 className="font-display text-soil text-2xl mb-3">Our Vision</h2>
              <p className="text-stone text-[15px] leading-relaxed">
                A future where farmers earn fairly, buyers get better value, and food distribution becomes transparent and efficient across Nigeria.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
