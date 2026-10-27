/**
 * Nookdry storefront — the one file for brand, product copy, and placeholder
 * commercial terms.
 *
 * Replace every value marked PLACEHOLDER before launch. Sample quotes are not
 * customer reviews; delete `sampleQuotes` (and the quotes section hides itself
 * when the array is empty) before you present them as social proof.
 *
 * Prices here are what the page shows, what JSON-LD publishes, and what Stripe
 * Checkout charges when the matching `STRIPE_PRICE_NOOKDRY_*` price id is
 * blank (inline `price_data`, fine for test mode). Once you create Prices in
 * the Stripe Dashboard, set those env vars so live charges use the dashboard
 * prices — then make the amounts below match them.
 *
 * Shipped copy is English. To add Simplified Chinese later, add a `zh` block
 * beside `copy` and teach the storefront to read it; `en` and `zh` UI chrome
 * already live in the i18n dictionaries.
 *
 * `public/manifest.json` `name` / `theme_color` are static and should be
 * updated when the brand name or accent color changes.
 */

export const productConfig = {
  brand: {
    /** PLACEHOLDER — parent brand name is undecided. */
    name: 'Northline',
    /** PLACEHOLDER — one or two characters shown in the logo mark. */
    mark: 'N',
    /** PLACEHOLDER */
    tagline: 'Quiet care for small spaces.',
  },

  /** PLACEHOLDER brand colors. */
  colors: {
    ink: '#1c1915',
    paper: '#f4efe7',
    paperDeep: '#e9e1d4',
    card: '#fffdf8',
    accent: '#1f6a52',
    accentHover: '#185743',
    accentInk: '#f4fbf7',
    accentSoft: '#e5f2ec',
    clay: '#c4653a',
    muted: '#5e574e',
    mutedSoft: '#8a8176',
    line: '#e3d9cb',
    lineStrong: '#cfc3b2',
  },

  product: {
    name: 'Nookdry',
    /** PLACEHOLDER — shown in the preview banner until you clear it. */
    previewBanner:
      'Preview store — prices, specs, photos, shipping, and sample quotes are placeholders.',
  },

  /**
   * PLACEHOLDER prices in US cents. The bundle (device + refill subscription)
   * is the primary offer. Pod packs are one-time and secondary.
   */
  offers: {
    currency: 'usd' as const,
    device: {
      cents: 7900,
      name: 'Nookdry device',
    },
    /** Per delivery, not per month. Every 2 months is the recommended cadence. */
    subscription: {
      name: 'Nookdry refill subscription',
      recommended: 2 as const,
      months: {
        1: { cents: 1400 },
        2: { cents: 2600 },
        3: { cents: 3600 },
      },
    },
    pods: {
      1: { cents: 1600, pods: 1, name: 'Nookdry refill pod' },
      3: { cents: 4200, pods: 3, name: 'Nookdry refill pods (3)' },
      6: { cents: 7800, pods: 6, name: 'Nookdry refill pods (6)' },
    },
  },

  /**
   * PLACEHOLDER specifications. Do not publish these as measured facts.
   * The specs section labels the whole grid as placeholder figures.
   */
  specs: [
    { id: 'coverage', label: 'Coverage', value: 'Up to 25 sq ft', detail: 'A closet, a cabinet run, or a car cabin — not a whole room.' },
    { id: 'pod', label: 'Pod capacity', value: '350 ml', detail: 'One refill pod. The window turns amber when it is time to swap.' },
    { id: 'battery', label: 'Battery', value: 'About 30 days', detail: 'Cordless. USB-C recharge in about 3 hours.' },
    { id: 'noise', label: 'Sound', value: 'Under 28 dB', detail: 'Quieter than a whisper, so a bedroom closet is fair game.' },
    { id: 'size', label: 'Size', value: '7.1 × 4.3 × 4.3 in', detail: 'Sits on a shelf. No hose and no tank to empty.' },
    { id: 'weight', label: 'Weight', value: '2.4 lb', detail: 'Move it from the closet to the car in one hand.' },
  ],

  /** PLACEHOLDER shipping, returns, and guarantee. */
  shipping: {
    window: '3–5 business days in the US',
    priceLabel: 'Free shipping',
    returnsDays: 30,
    guaranteeDays: 30,
    guarantee:
      'If the space does not feel drier within 30 days, send Nookdry back for a refund of the device.',
  },

  seo: {
    title: 'Nookdry — cordless dehumidifier for closets, cars, and small spaces',
    description:
      'Nookdry is a cordless, rechargeable dehumidifier for closets, cabinets, drawers, entryways, cars, and RVs. Buy the device once and subscribe to refill pods.',
    /** PLACEHOLDER social image — flat color block until product photography exists. */
    ogImage: '/og-nookdry.png',
  },

  copy: {
    heroKicker: 'Cordless · rechargeable · small spaces',
    heroTitle: 'The damp spot you stopped opening.',
    heroLede:
      'Nookdry is a small dehumidifier for the places a room unit cannot reach — closets, cabinets, drawers, entryways, cars, and RVs. Buy the device once. A refill pod on a schedule keeps the nook dry.',
    primaryCta: 'Get the device + refills',
    secondaryCta: 'How it works',
    problemKicker: 'The problem',
    problemTitle: 'Closed spaces do not dry themselves.',
    problemLede:
      'A whole-room dehumidifier is the wrong tool for a closet. Disposable tubs go stale, spill, and still leave the corner musty.',
    problems: [
      { id: 'closet', title: 'Musty closets', body: 'Clothes hold yesterday’s humidity. The door stays shut, so the smell has nowhere to go.' },
      { id: 'cabinet', title: 'Cabinets and drawers', body: 'Under-sink wood, linen drawers, and entry shoe cabinets grow a film you only notice when you reach in.' },
      { id: 'car', title: 'Cars and RVs', body: 'A parked cabin sweats overnight. Seats, headliners, and RV cupboards take on that damp, closed-up smell.' },
    ],
    howKicker: 'How it works',
    howTitle: 'Set it down. Swap a pod. That is the whole product.',
    steps: [
      { n: '01', title: 'Place it', body: 'Set Nookdry on a shelf, the floor of a closet, a cabinet, or a car seat. No hose, no outlet required while it runs.' },
      { n: '02', title: 'It collects', body: 'A quiet fan pulls moist air across the refill pod. Moisture stays in the pod instead of dripping into a tank you have to empty.' },
      { n: '03', title: 'Swap the pod', body: 'When the window turns amber, drop in a new pod. A subscription sends the next one before you have to think about it — or buy a pack once.' },
    ],
    scenesKicker: 'Where it sits',
    scenesTitle: 'Built for the nooks, not the living room.',
    /** `id` picks the illustrated vignette. Keep it when you rewrite the sentence. */
    scenes: [
      { id: 'closet', title: 'Closets', body: 'Coats, linens, and the corner behind the suitcase.' },
      { id: 'cabinet', title: 'Cabinets', body: 'Under the sink, the bathroom vanity, the hall cupboard.' },
      { id: 'drawer', title: 'Drawers', body: 'A single drawer of wool, cameras, or papers.' },
      { id: 'entryway', title: 'Entryways', body: 'Wet shoes and the cabinet they live in.' },
      { id: 'car', title: 'Cars', body: 'A cabin that sits closed all week.' },
      { id: 'rv', title: 'RVs', body: 'Cupboards and berths between trips.' },
    ],
    specsKicker: 'Specs',
    specsTitle: 'Small on purpose.',
    specsNote: 'Placeholder figures — replace with measured specs before launch.',
    subKicker: 'Refill subscription',
    subTitle: 'The device is once. The pod is the habit.',
    subLede:
      'Most of the value is a dry pod showing up before the old one is spent. Subscribe with the device, or buy packs when you want them. Skip a delivery or cancel whenever you like — the device is yours either way.',
    subPoints: [
      { title: 'A pod on a cadence', body: 'Choose every 1, 2, or 3 months. Two months is the default because a pod is meant to last about that long in a typical closet — that lifespan is still a placeholder.' },
      { title: 'Skip the next one', body: 'Going away, or the window is still clear? Skip the upcoming refill. Billing pauses for one cycle, then resumes.' },
      { title: 'Change or cancel', body: 'Move between monthly, every two months, and every three months. Cancel and you keep the device; refills stop at the end of the period you already paid.' },
    ],
    compareKicker: 'Compared with tubs',
    compareTitle: 'A tub is a purchase you repeat by accident.',
    compareTubs: 'Disposable desiccant tubs',
    compareNook: 'Nookdry',
    comparison: [
      { label: 'Closed closet or cabinet', tubs: 'Works poorly once the air is still', nook: 'A small fan keeps air moving across the pod' },
      { label: 'Car or RV', tubs: 'Tips, leaks, and smells like the crystals', nook: 'Sits upright and rechargeable, with nothing to spill' },
      { label: 'Refills', tubs: 'Remember to buy another tub', nook: 'A subscription, or a pack when you want one' },
      { label: 'Skip a month', tubs: 'You already own a pile of tubs', nook: 'Skip or cancel the next delivery' },
      { label: 'Power', tubs: 'None, and also no airflow', nook: 'Cordless battery, USB-C recharge' },
    ],
    faqKicker: 'Questions',
    faqTitle: 'Before you buy.',
    guaranteeKicker: 'Shipping and returns',
    guaranteeTitle: 'US shipping. A straight guarantee.',
    finalTitle: 'Put one in the space you keep meaning to air out.',
    finalLede: 'Device once. Refill pods on the cadence you pick. Cancel the pods anytime.',
    quotesKicker: 'Sample quotes',
    quotesTitle: 'What we expect people to notice.',
    quotesDisclaimer:
      'Sample content for layout only — not reviews from customers. Remove this section before launch.',
    buyKicker: 'Choose your plan',
    buyTitle: 'Start with the device and a refill cadence.',
    dueToday: 'Due today',
    thenEvery: 'Then {price} every {count} {unit}',
    includes: 'Includes the device and the first pod, charged today.',
    deviceOnlyNote: 'The device only. Add pods later as a pack or a subscription.',
    podsNote: 'For a Nookdry you already own. One-time, not a subscription.',
  },

  /**
   * SAMPLE CONTENT — not real customers, not real reviews.
   * Empty this array to remove the quotes section from the page.
   */
  sampleQuotes: [
    { quote: 'I put it on the closet floor and stopped dreading the coat I left there.', name: 'Sample · A.M.', context: 'Hall closet' },
    { quote: 'The car stopped smelling shut-in after a week of sitting at the airport.', name: 'Sample · J.P.', context: 'Parked car' },
    { quote: 'Swapping a pod is the whole chore. I do not want another tub under the sink.', name: 'Sample · R.L.', context: 'Under-sink cabinet' },
  ],

  faq: [
    { q: 'What is a refill pod?', a: 'A sealed cartridge the device pulls moisture into. When the indicator window turns amber you drop the pod out and click a new one in. There is no bucket to empty.' },
    { q: 'How does the subscription work?', a: 'You buy the Nookdry device once and choose a pod delivery every 1, 2, or 3 months. The first pod is charged with the device. Later pods bill on that cadence until you skip or cancel.' },
    { q: 'Can I skip or cancel?', a: 'Yes. Skip pauses the next charge for one cycle. Cancel stops future pods at the end of the period you already paid. The device stays yours. You can also switch cadence between 1, 2, and 3 months.' },
    { q: 'Can I just buy the device, or only pods?', a: 'Yes. Device-only checkout skips the subscription. Pod packs (1, 3, or 6) are one-time orders for a device you already have.' },
    { q: 'Where does it actually work?', a: 'Small closed spaces: closets, cabinets, drawers, entryways, cars, and RVs. It is not a whole-room dehumidifier. Coverage, runtime, and pod size on this page are placeholders until measured specs exist.' },
    { q: 'Shipping, guarantee, and returns?', a: 'Placeholder policy: free shipping in the US, delivery in about 3–5 business days, and 30 days to return the device if the space does not feel drier. Subscription renewals after the first charge follow the cadence you picked.' },
  ],
} as const

export type ProductConfig = typeof productConfig
