'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react'
import { getMarketDayInfo, type MarketDayInfo } from '@/lib/market-day'

export function MarketDayBanner({ compact = false }: { compact?: boolean }) {
  const [marketDay, setMarketDay] = useState<MarketDayInfo | null>(null)

  useEffect(() => {
    setMarketDay(getMarketDayInfo())
  }, [])

  if (!marketDay?.isMarketDay || !marketDay.deliveryWeekday) return null

  return (
    <section
      aria-label="Market Day offer"
      className={`bg-soil text-white ${compact ? 'mx-auto max-w-5xl px-3 pt-4 sm:px-6' : ''}`}
    >
      <div className={`${compact ? 'rounded-2xl' : ''} overflow-hidden bg-soil`}>
        <div className={`relative ${compact ? 'px-4 py-4 sm:px-6 sm:py-5' : 'px-5 py-6 sm:px-8 sm:py-8'}`}>
          <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full bg-pepper/25 blur-2xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf text-soil">
                <CalendarDays size={19} strokeWidth={2.2} />
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-data text-[10px] font-bold uppercase tracking-[0.18em] text-leaf">
                    Market Day
                  </p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                    {marketDay.marketDay}
                  </span>
                </div>
                <h2 className={`font-body font-bold leading-tight ${compact ? 'text-[18px]' : 'text-[21px] sm:text-[24px]'}`}>
                  Order today. Receive it tomorrow.
                </h2>
                <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-white/70 sm:text-[13.5px]">
                  Fresh produce delivered on {marketDay.deliveryWeekday}, with {marketDay.discountPercent}% off your basket.
                </p>
              </div>
            </div>

            <Link
              href="/store"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-leaf px-4 py-2.5 text-[13px] font-bold text-soil transition-colors hover:bg-leaf-deep sm:self-center"
            >
              Shop Market Day
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="relative mt-4 flex items-center gap-1.5 text-[11px] font-medium text-white/55">
            <Sparkles size={13} className="text-leaf" />
            The saving is applied automatically at checkout.
          </div>
        </div>
      </div>
    </section>
  )
}