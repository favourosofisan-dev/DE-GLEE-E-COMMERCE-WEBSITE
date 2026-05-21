const DEGLEE_PRODUCTS = [
  {
    id: "p-001",
    name: "24H Moisture Body Lotion",
    category: "body-care",
    categoryLabel: "Body care",
    price: 24.0,
    description: "All day hydration with a silky, non greasy finish for soft, touchable skin.",
    image: "images/24H moidture body lotion.jpeg",
    badge: "Bestseller"
  },
  {
    id: "p-002",
    name: "Advanced Korean Body Gel Wash",
    category: "cleansing",
    categoryLabel: "Cleansing",
    price: 18.5,
    description: "A gentle gel cleanser that refreshes without stripping natural moisture.",
    image: "images/advanced korean skin body gel wash.jpeg"
  },
  {
    id: "p-003",
    name: "Advanced Korean Body Oil",
    category: "body oil",
    categoryLabel: "Body oil",
    price: 32.0,
    description: "Lightweight nourishment that leaves skin luminous and deeply conditioned.",
    image: "images/advanced korean skin body oil.jpeg",
    badge: "Glow edit"
  },
  {
    id: "p-004",
    name: "Amlactin for Dry Skin",
    category: "treatment",
    categoryLabel: "Treatment",
    price: 28.0,
    description: "Targeted care for dry, rough skin with a smoother, more even feel.",
    image: "images/amlactin for dry skin.jpeg"
  },
  {
    id: "p-005",
    name: "Blemish Care Toner",
    category: "toner",
    categoryLabel: "Toner",
    price: 22.0,
    description: "Clarifying toner that helps refine pores and balance troubled skin.",
    image: "images/BLEMISH CARE TONER.jpeg"
  },
  {
    id: "p-006",
    name: "Bright + Clear Face Cream",
    category: "skincare",
    categoryLabel: "Skincare",
    price: 26.0,
    description: "Daily brightening cream for a clearer, more even looking complexion.",
    image: "images/bright + clear face cream.jpeg"
  },
  {
    id: "p-007",
    name: "Bright & Balance Anti Aging",
    category: "skincare",
    categoryLabel: "Skincare",
    price: 45.0,
    description: "Firming care that supports elasticity while keeping skin comfortably hydrated.",
    image: "images/BRIGHT AND BAALANCE ANTI AGING.jpeg",
    badge: "Premium"
  },
  {
    id: "p-008",
    name: "Brightening Vitamin C Facial Tonic",
    category: "toner",
    categoryLabel: "Toner",
    price: 24.0,
    description: "Vitamin C tonic that awakens dull skin with a fresh, radiant finish.",
    image: "images/BRIGHTENING VITAMIN C FACIAL TONIC.jpeg"
  },
  {
    id: "p-009",
    name: "Ceramide Barrier Cream",
    category: "treatment",
    categoryLabel: "Treatment",
    price: 34.0,
    description: "Barrier supporting formula that locks in moisture and calms sensitivity.",
    image: "images/CERAMIDE.jpeg"
  },
  {
    id: "p-010",
    name: "Dove Body Love Lotion",
    category: "body care",
    categoryLabel: "Body care",
    price: 16.0,
    description: "Nourishing body lotion with a soft, comforting scent and lasting moisture.",
    image: "images/dove body love.jpeg"
  },
  {
    id: "p-011",
    name: "Dove Cucumber & Green Tea Body Wash",
    category: "cleansing",
    categoryLabel: "Cleansing",
    price: 14.0,
    description: "Refreshing cleanse inspired by cucumber and green tea for everyday ritual.",
    image: "images/dove cucumber and green tea scent body wash.jpeg"
  },
  {
    id: "p-012",
    name: "Dove Exfoliating Body Polish",
    category: "body care",
    categoryLabel: "Body care",
    price: 18.0,
    description: "Gentle polish that smooths and renews for silkier feeling skin.",
    image: "images/DOVE EXFOLISTING BODY POLISH.jpeg"
  },
  {
    id: "p-013",
    name: "Dove Relaxing Ritual Body Wash",
    category: "cleansing",
    categoryLabel: "Cleansing",
    price: 14.5,
    description: "A calming wash designed to turn your shower into a quiet luxury moment.",
    image: "images/dove relaxing ritual body wash.jpeg"
  },
  {
    id: "p-014",
    name: "Dr Teal's Bath & Body Oil",
    category: "body oil",
    categoryLabel: "Body oil",
    price: 22.0,
    description: "Aromatherapy infused oil for bath or body, easing tension while you glow.",
    image: "images/dr teals bath and body oil.jpeg"
  },
  {
    id: "p-015",
    name: "Gluta Hya Serum Burst Lotion",
    category: "serum",
    categoryLabel: "Serum",
    price: 29.0,
    description: "Serum infused lotion that delivers a burst of hydration and visible radiance.",
    image: "images/gluta hya serum burst lotion.jpeg",
    badge: "Glow edit"
  },
  {
    id: "p-016",
    name: "Healthy Glow Lightening Face Cream",
    category: "skincare",
    categoryLabel: "Skincare",
    price: 27.0,
    description: "Even tone face cream that supports a healthy, lit from within glow.",
    image: "images/healthy glow lightening face cream.jpeg"
  },
  {
    id: "p-017",
    name: "Jergens Body Lotion",
    category: "body care",
    categoryLabel: "Body care",
    price: 15.0,
    description: "Classic daily moisture with a familiar, comforting skin softening feel.",
    image: "images/jergens body lotion.jpeg"
  },
  {
    id: "p-018",
    name: "Laveeda Facial Moisturizer",
    category: "moisturizer",
    categoryLabel: "Moisturizer",
    price: 31.0,
    description: "Rich facial moisturizer that leaves skin supple, smooth, and beautifully prepped.",
    image: "images/LAVEEDA FACIAL MOISTURIZER.jpeg"
  },
  {
    id: "p-019",
    name: "Miu Skin Glowing Body Wash",
    category: "cleansing",
    categoryLabel: "Cleansing",
    price: 19.0,
    description: "Glow boosting body wash with a clean lather and a fresh, polished finish.",
    image: "images/miu skin glowing body wash.jpeg"
  },
  {
    id: "p-020",
    name: "Naturium Body Lotion",
    category: "body care",
    categoryLabel: "Body care",
    price: 38.0,
    description: "Science forward body lotion with a luxurious texture and lasting hydration.",
    image: "images/NATURIUM BODY LOTION.jpeg",
    badge: "Premium"
  },
  {
    id: "p-021",
    name: "Nine Less BHA Cleanser",
    category: "cleansing",
    categoryLabel: "Cleansing",
    price: 28.0,
    description: "BHA powered cleanser that gently exfoliates while keeping skin balanced.",
    image: "images/NINE LESS BHA CLEANER.jpeg"
  },
  {
    id: "p-022",
    name: "Olay Body Lotion",
    category: "body care",
    categoryLabel: "Body care",
    price: 22.0,
    description: "Trusted body hydration with a smooth, fast absorbing finish.",
    image: "images/olay body lotion.jpeg"
  },
  {
    id: "p-023",
    name: "Olay Regenerist",
    category: "skincare",
    categoryLabel: "Skincare",
    price: 48.0,
    description: "Iconic regenerating care that supports firmer, younger looking skin over time.",
    image: "images/olay regenerist.jpeg",
    badge: "Bestseller"
  },
  {
    id: "p-024",
    name: "Simple Facial Wash",
    category: "cleansing",
    categoryLabel: "Cleansing",
    price: 12.0,
    description: "Gentle daily cleanser ideal for sensitive skin and uncomplicated routines.",
    image: "images/simple facial wash.jpeg"
  },
  {
    id: "p-025",
    name: "Simple Micellar Gel Wash",
    category: "cleansing",
    categoryLabel: "Cleansing",
    price: 14.0,
    description: "Micellar gel that lifts impurities while respecting your skin barrier.",
    image: "images/simple micellar gel wash.jpeg"
  },
  {
    id: "p-026",
    name: "Simple Replenishing Moisturizer",
    category: "moisturizer",
    categoryLabel: "Moisturizer",
    price: 16.0,
    description: "Lightweight replenishing moisture for calm, comfortable skin all day.",
    image: "images/simple replenishing moisturizer.jpeg"
  },
  {
    id: "p-027",
    name: "Skin by Zaron Vitamin C Body Wash",
    category: "cleansing",
    categoryLabel: "Cleansing",
    price: 21.0,
    description: "Vitamin C body wash that cleanses while supporting a brighter skin tone.",
    image: "images/skin by zaron vitamin c body wash.jpeg"
  },
  {
    id: "p-028",
    name: "Skin Success Tone Correcting Lotion",
    category: "body-care",
    categoryLabel: "Body care",
    price: 25.0,
    description: "Tone-correcting body lotion for a more even, confident-looking glow.",
    image: "images/skin succes tone correcting body lotion.jpeg"
  },
  {
    id: "p-029",
    name: "St. Ives Fresh Skin Scrub",
    category: "body-care",
    categoryLabel: "Body care",
    price: 13.0,
    description: "Invigorating scrub that polishes away dullness for renewed softness.",
    image: "images/st ives.jpeg"
  },
  {
    id: "p-030",
    name: "Tea Tree Foaming Face Wash",
    category: "cleansing",
    categoryLabel: "Cleansing",
    price: 18.0,
    description: "Foaming wash with tea tree to clarify and refresh oily or breakout prone skin.",
    image: "images/TEA TREE FOAMING FACE WASH.jpeg"
  },
  {
    id: "p-031",
    name: "Vaseline Body Lotion",
    category: "body care",
    categoryLabel: "Body care",
    price: 11.0,
    description: "Essential daily moisture that seals in hydration from head to toe.",
    image: "images/vaseline body lotion.jpeg"
  },
  {
    id: "p-032",
    name: "Vaseline Vitamin B3 Body Oil",
    category: "body oil",
    categoryLabel: "Body oil",
    price: 19.0,
    description: "Vitamin B3 body oil for nourished skin with a healthy, satin sheen.",
    image: "images/vaseline vitamin b3 body oil.jpeg"
  }
];

const DEGLEE_CATEGORIES = [
  { id: "all", label: "All products" },
  { id: "skincare", label: "Skincare" },
  { id: "body-care", label: "Body care" },
  { id: "cleansing", label: "Cleansing" },
  { id: "moisturizer", label: "Moisturizer" },
  { id: "toner", label: "Toner" },
  { id: "serum", label: "Serum" },
  { id: "body-oil", label: "Body oil" },
  { id: "treatment", label: "Treatment" }
];
