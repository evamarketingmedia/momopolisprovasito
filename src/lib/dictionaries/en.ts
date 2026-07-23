import type it from "./it";

const dict: typeof it = {
  meta: {
    siteName: "Momopolis",
    tagline: "Family Bar & Park",
    titleSuffix: "Momopolis · Family Bar & Park",
  },
  nav: {
    home: "Home",
    about: "About us",
    bar: "The Bar",
    park: "The Park",
    gallery: "Gallery",
    events: "Birthdays & Events",
    packages: "Promotions",
    contact: "Contact",
  },
  cta: {
    bookNow: "Book your party",
    callUs: "Call us",
    whatsapp: "Message us on WhatsApp",
    discover: "Discover more",
    viewPackages: "View party packages",
    getDirections: "Get directions",
    seePhotos: "See photos",
  },
  home: {
    heroBadge: "📍 Just steps from FoxTown Mendrisio",
    heroKicker: "Indoor playground · Bar · Parties",
    heroTitle: "Giggles, slides and jumps: fun knows no limits",
    heroSubtitle:
      "Momopolis is the indoor playground for families in Mendrisio, just steps from FoxTown: kids laughing, sliding and jumping across slides, ball pits and play areas for every age, while parents relax at our bar.",
    heroCta1: "Book a party",
    heroCta2: "Discover the park",
    introTitle: "A whole world of play, just for them",
    introText:
      "Open all week and air-conditioned in every season, we offer a safe and vividly colourful space where children aged 0 to 12 run, jump and laugh freely, while our bar serves coffee, aperitifs and snacks for the grown-ups.",
    highlightsTitle: "Why choose Momopolis",
    highlights: [
      {
        title: "Play areas for every age",
        text: "Separate zones for infants, toddlers and older kids: tailor-made fun, always safe.",
      },
      {
        title: "Momopolis Bar",
        text: "Coffee, aperitifs and snacks: a relaxing corner for parents overlooking the playground.",
      },
      {
        title: "Custom-made parties",
        text: "We organise the perfect birthday party with entertainment, cake and a room all to yourselves.",
      },
      {
        title: "Safe and clean environment",
        text: "Padded floors, certified materials and constant sanitising of every structure.",
      },
    ],
    zonesTitle: "The playground",
    zonesText:
      "Giant slides to giggle down, ball pits to dive into, climbing towers, a dress-up corner and a soft area for the little ones: every corner of Momopolis is built to make kids jump, run and smile.",
    partyTeaserTitle: "Plan the party of your dreams",
    partyTeaserText:
      "From birthday parties to corporate events with kids' entertainment: pick the formula that suits you best and we'll take care of everything else.",
    hoursTitle: "Opening hours",
    mapTitle: "Where we are",
    galleryTeaserTitle: "A taste of Momopolis",
  },
  about: {
    title: "About us",
    kicker: "Our story",
    intro:
      "Momopolis was born from the desire to create, in Mendrisio, just steps from FoxTown, a place where families can spend quality time together: a safe, vividly colourful playground for children and a welcoming bar for the grown-ups.",
    storyTitle: "Our story",
    storyText:
      "It all started with the wish to offer local families an alternative to the usual afternoons at home: an indoor space, open all year round, where play takes centre stage no matter the weather. Thanks to its handy spot near FoxTown, today Momopolis is a go-to venue for birthdays, class parties and special events, full of giggles, slides and jumps.",
    missionTitle: "Our mission",
    missionText:
      "We believe play is essential to children's growth. Our goal is to offer a safe, stimulating space, carefully curated down to the smallest detail, where every family feels at home.",
    valuesTitle: "Our values",
    values: [
      {
        title: "Safety first",
        text: "Certified structures, daily checks and staff always present in the play area.",
      },
      {
        title: "A welcome for the whole family",
        text: "An environment designed for children as much as for parents and grandparents.",
      },
      {
        title: "Quality and attention to detail",
        text: "From the cleanliness of our spaces to the quality of the food served at the bar, we leave nothing to chance.",
      },
      {
        title: "Fun, made to measure",
        text: "Every party and event is organised around the wishes of the family who requests it.",
      },
    ],
    teamTitle: "The Momopolis team",
    teamText:
      "Our staff is trained to welcome, entertain and look after the little ones throughout their stay, so parents can truly relax.",
  },
  bar: {
    title: "The Bar",
    kicker: "A break for everyone",
    intro: "Our bar is designed for everyone, from children taking a play break to adults who want to relax.",
    body: "Children can enjoy snacks and treats during their play break. Parents and accompanying adults can use our café, lunch and aperitif service, or challenge each other at our indoor sports games such as Air Hockey and table football.",
    accessibleTitle: "Open to everyone",
    accessibleText: "Not only for families: everyone is welcome to enjoy a relaxing moment at Momòpolis Bar.",
    menuTitle: "The menu",
    menuText: "Our drinks, coffee, snacks, lunch and aperitif menu is available directly at the bar.",
  },
  park: {
    title: "The Park",
    kicker: "Play, movement and imagination",
    intro: "A spacious indoor play area with attractions for different ages. Little ones explore soft, protected spaces designed for ages 0–3, while older children enjoy routes, games and activities that encourage movement and socialising. A reading corner is available for quieter moments.",
    gamesTitle: "The games",
    games: [
      { title: "Momòpolis play structure", text: "A city of routes, tunnels, obstacles, slides and a ball pit for maximum fun." },
      { title: "Climbing wall", text: "A vertical climbing wall designed to develop agility." },
      { title: "Salta Salta", text: "A double trampoline station where children can release all their energy." },
      { title: "Donuts Slide", text: "A play structure with a slide and inflatable ring for fun descents." },
      { title: "Construction area", text: "Giant building blocks that encourage creativity." },
      { title: "Reading area", text: "Sofas and a library of stories and fairy tales to share with parents." },
      { title: "Ages 0–3", text: "A completely safe area with soft play, a ball pit, bouncers and a small inflatable castle." },
      { title: "Multigaming", text: "Coin-operated video game stations for friendly challenges and games of chance." },
    ],
  },
  gallery: {
    title: "Gallery",
    kicker: "A taste of Momopolis",
    intro:
      "Explore the Momopolis spaces through pictures: the playground, the parties we've organised and our special events.",
    categories: {
      all: "All",
      playground: "Playground",
      parties: "Parties",
      events: "Special events",
    },
    emptyState: "No images in this category yet.",
  },
  events: {
    title: "Birthdays & Events",
    kicker: "What we organise",
    intro:
      "At Momopolis every occasion becomes special: birthdays, class parties, corporate events and themed evenings for the whole family.",
    items: [
      {
        title: "Birthday parties",
        text: "Our most loved formula: a private room, entertainment and lots of fun for the birthday child and their friends.",
      },
      {
        title: "Class and end-of-year school parties",
        text: "Organise a day of free play with your school in a safe, supervised environment.",
      },
      {
        title: "Corporate events and team building",
        text: "Spaces for the little ones during parents' events, or family-friendly days for employees.",
      },
      {
        title: "Themed evenings and events",
        text: "Special dates throughout the year: carnival, Halloween, Christmas parties and much more.",
      },
    ],
    ctaTitle: "Got something to celebrate?",
    ctaText: "Get in touch and let's build the perfect event for your family or your company together.",
  },
  packages: {
    title: "Promotions",
    kicker: "Price list and formulas",
    intro:
      "Choose the formula that best fits your party: every package includes exclusive or shared access to the playground and support from our staff.",
    priceFrom: "from",
    perChild: "/ child",
    mostPopular: "Most popular",
    includesTitle: "What's included",
    list: [
      {
        name: "Basic Package",
        price: "CHF 22.–",
        description: "Perfect for simple, informal parties, with full access to the playground.",
        popular: false,
        features: [
          "3 hours of playground access",
          "Reserved table in the party area",
          "Customisable digital invitations",
          "Support from the Momopolis staff",
        ],
      },
      {
        name: "Momopolis Package",
        price: "CHF 32.–",
        description: "The formula families choose most: a complete party with dedicated entertainment.",
        popular: true,
        features: [
          "3 hours of playground access",
          "Reserved, decorated party room",
          "Dedicated entertainer for 1 hour",
          "Drinks and snacks menu for children",
          "Birthday cake included",
        ],
      },
      {
        name: "Deluxe Package",
        price: "CHF 42.–",
        description: "The full experience for an unforgettable, worry-free party.",
        popular: false,
        features: [
          "4 hours of exclusive playground access",
          "Reserved, themed party room",
          "Entertainment and face painting for the whole duration",
          "Full menu: drinks, snacks and cake",
          "Themed photo set included",
        ],
      },
    ],
    addOnsTitle: "Available extras",
    addOns: [
      "Face painting",
      "Decorative balloons",
      "Event photographer",
      "Aperitif buffet for adults",
    ],
    note: "Indicative prices based on a minimum of 10 attending children. Request a custom quote through the contact form.",
    ctaTitle: "Ready to book your party?",
    ctaText: "Fill in the booking form with your preferred date: we'll check availability right away.",
  },
  contact: {
    title: "Contact",
    kicker: "Book or ask a question",
    intro:
      "Write to us to organise your party, book a visit, or simply learn more about Momopolis. We'll get back to you as soon as possible.",
    infoTitle: "Our information",
    addressTitle: "Address",
    hoursTitle: "Opening hours",
    phoneTitle: "Phone",
    emailTitle: "Email",
    mapTitle: "How to reach us",
    formTitle: "Request a booking",
    formIntro:
      "Tell us the date, the type of party and the number of guests: we'll check availability on the calendar right away.",
    calendarTitle: "Real-time availability",
    calendarLegendAvailable: "Available date",
    calendarLegendBooked: "Fully booked",
    calendarLegendSelected: "Selected date",
    calendarLoading: "Loading calendar...",
    calendarError: "Couldn't load the calendar. Please try again later.",
    calendarNoDates: "No dates are available right now. Please contact us directly.",
    form: {
      name: "Full name",
      email: "Email",
      phone: "Phone",
      date: "Preferred date",
      datePlaceholder: "Select a date from the calendar",
      timeSlot: "Time slot",
      selectSlotPlaceholder: "Choose a time slot",
      statusAvailable: "Available",
      statusLow: "Few seats left",
      statusFull: "Full",
      seatsRemainingHint: "Seats left in this slot: {n}",
      partyType: "Type of party",
      partyTypeOptions: [
        { value: "compleanno", label: "Birthday party" },
        { value: "classe", label: "Class party" },
        { value: "aziendale", label: "Corporate event" },
        { value: "altro", label: "Other" },
      ],
      participants: "Number of participants",
      tooManyParticipants: "The number of participants exceeds the seats left for this date.",
      message: "Message (optional)",
      messagePlaceholder: "Tell us a bit more about your request...",
      submit: "Send booking request",
      submitting: "Sending...",
      required: "Required field",
      invalidEmail: "Please enter a valid email address",
      availabilityChangedText:
        "Availability changed while you were filling in the form: this date or time slot is no longer selectable. Please choose another one from the updated calendar below.",
      successTitle: "Request sent!",
      successText:
        "Thank you! We've received your booking request and will get back to you by email as soon as possible.",
      errorTitle: "Oops, something went wrong",
      errorText: "We couldn't send your request. Please try again or contact us by phone.",
      sendAnother: "Send another request",
      confirmationSubject: "Momopolis booking confirmation",
      confirmationIntro: "Thanks for your request! Here's a summary:",
      confirmationClosing:
        "We'll get back to you as soon as possible to confirm the details. See you soon at Momopolis!",
      bookingIdLabel: "Booking reference",
    },
  },
  footer: {
    tagline: "The indoor playground where the whole family has fun.",
    quickLinks: "Quick links",
    contactTitle: "Contact",
    followUs: "Follow us",
    rights: "All rights reserved.",
  },
  whatsapp: {
    defaultMessage: "Hi Momopolis! I'd like some information about...",
    tooltip: "Message us on WhatsApp",
  },
};

export default dict;
