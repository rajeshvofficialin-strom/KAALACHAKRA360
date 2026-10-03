export type ArtifactStatus =
  | 'archaeologically-attested'
  | 'living-tradition'
  | 'historically-documented'
  | 'interpretive';

export type ModelKey =
  | 'indus-cart'
  | 'channapatna'
  | 'kondapalli'
  | 'lattu'
  | 'rattle'
  | 'thalayati'
  | 'buddhist-figure'
  | 'jataka-elephant'
  | 'bull-cart'
  | 'bommalattam';

export const RECONSTRUCTION_LABEL = 'Digital Reconstruction / Educational Representation';

export interface HistoricalReference {
  title: string;
  note: string;
}

export interface HeritageExhibit {
  id: string;
  slug: string;
  number: number;
  name: string;
  localName?: string;
  region: string;
  coordinates: { lat: number; lng: number };
  period: string;
  timelineYear: number;
  material: string;
  significance: string;
  description: string;
  references: HistoricalReference[];
  artifactStatus: ArtifactStatus;
  statusNote: string;
  modelKey: ModelKey;
  modelUrl?: string;
  accent: string;
}

export const ARTIFACT_STATUS_LABELS: Record<ArtifactStatus, string> = {
  'archaeologically-attested': 'Archaeologically Attested Type',
  'living-tradition': 'Living Craft Tradition',
  'historically-documented': 'Historically Documented',
  interpretive: 'Interpretive / Inspired Representation',
};

export const HERITAGE_EXHIBITS: HeritageExhibit[] = [
  {
    id: 'indus-terracotta-cart',
    slug: 'indus-valley-terracotta-cart',
    number: 1,
    name: 'Indus Valley Terracotta Cart & Animal',
    region: 'Harappa, Mohenjo-daro & Lothal (Indus–Sarasvati region)',
    coordinates: { lat: 22.52, lng: 72.25 },
    period: 'Mature Harappan phase, c. 2600–1900 BCE',
    timelineYear: -2600,
    material: 'Fired terracotta (clay)',
    significance:
      'Miniature carts with solid wheels and draught-animal figurines are among the earliest known toys of South Asia, showing wheeled transport in daily Harappan life.',
    description:
      'Excavated toy carts typically had a flat body, holes for axles and removable solid wheels, often paired with bull or animal figurines. This model is a simplified reconstruction of that general type.',
    references: [
      { title: 'J. M. Kenoyer, Ancient Cities of the Indus Valley Civilization (1998)', note: 'Discusses terracotta toy carts and figurines.' },
      { title: 'National Museum, New Delhi — Harappan Gallery', note: 'Displays terracotta carts and animal figurines.' },
    ],
    artifactStatus: 'archaeologically-attested',
    statusNote: 'The toy type is archaeologically attested. This 3D model is not a scan of any specific excavated object.',
    modelKey: 'indus-cart',
    accent: '#C2683E',
  },
  {
    id: 'channapatna',
    slug: 'channapatna-wooden-toy',
    number: 2,
    name: 'Channapatna Wooden Toy',
    localName: 'Channapatna Gombegalu',
    region: 'Channapatna, Karnataka',
    coordinates: { lat: 12.65, lng: 77.21 },
    period: 'Craft popularly traced to the 18th century; continues today',
    timelineYear: 1780,
    material: 'Ivory wood (aale mara), lac and natural dyes',
    significance:
      'Known as the "toy town" of Karnataka, Channapatna produces smooth, lacquer-turned toys. The craft holds a Geographical Indication (GI) tag.',
    description:
      'Toys are turned on a lathe and coloured with lac sticks while spinning, producing glossy, child-safe finishes. The model shows a classic roly-poly style turned doll.',
    references: [
      { title: 'Geographical Indications Registry, Government of India', note: 'Channapatna Toys & Dolls registered as a GI.' },
      { title: 'Development Commissioner (Handicrafts), Ministry of Textiles', note: 'Craft documentation for Karnataka lacquerware.' },
    ],
    artifactStatus: 'living-tradition',
    statusNote: 'Living craft. The 3D model is a generic educational representation, not a specific artisan piece.',
    modelKey: 'channapatna',
    accent: '#C8372D',
  },
  {
    id: 'kondapalli',
    slug: 'kondapalli-bommalu',
    number: 3,
    name: 'Kondapalli Bommalu',
    localName: 'Kondapalli Bommalu',
    region: 'Kondapalli, Andhra Pradesh',
    coordinates: { lat: 16.62, lng: 80.54 },
    period: 'Tradition of roughly four centuries; continues today',
    timelineYear: 1600,
    material: 'Tella poniki softwood, tamarind-seed paste, natural colours',
    significance:
      'Kondapalli toys depict village life, deities and animals in bright colours, and are a central part of the Sankranti and Dasara bommala koluvu displays. GI-tagged craft.',
    description:
      'Artisans carve each part separately from light softwood, join them with tamarind paste, and paint in vivid enamel or vegetable colours. The model shows a village woman figure.',
    references: [
      { title: 'Geographical Indications Registry, Government of India', note: 'Kondapalli Bommallu registered as a GI.' },
      { title: 'Lepakshi Handicrafts (APHDC) craft notes', note: 'State documentation of the Kondapalli craft cluster.' },
    ],
    artifactStatus: 'living-tradition',
    statusNote: 'Living craft. The 3D model is an educational representation of the style.',
    modelKey: 'kondapalli',
    accent: '#2E8B57',
  },
  {
    id: 'lattu',
    slug: 'lattu-spinning-top',
    number: 4,
    name: 'Lattu – Traditional Spinning Top',
    localName: 'Lattu / Bambaram / Buguri',
    region: 'Across the Indian subcontinent',
    coordinates: { lat: 23.25, lng: 77.41 },
    period: 'Long-standing folk tradition; exact origin undocumented',
    timelineYear: 1200,
    material: 'Turned wood, iron nail tip, cotton cord',
    significance:
      'Played in streets and courtyards across India under many regional names, the spinning top develops hand–eye coordination and is often played in competitive rounds.',
    description:
      'A cord is wound around the grooved body and the top is thrown so that it spins on its metal tip. The model is a stylised turned-wood lattu.',
    references: [
      { title: 'Ethnographic literature on Indian folk games', note: 'Widely documented; no single primary source.' },
    ],
    artifactStatus: 'living-tradition',
    statusNote: 'Living folk toy. The 3D model is a generic educational representation.',
    modelKey: 'lattu',
    accent: '#D4A017',
  },
  {
    id: 'terracotta-rattle',
    slug: 'chankana-ghuggu-terracotta-rattle',
    number: 5,
    name: 'Chankana / Ghuggu – Traditional Terracotta Rattle',
    region: 'Indus sites and folk pottery traditions across India',
    coordinates: { lat: 30.63, lng: 72.86 },
    period: 'Clay rattles known from Harappan contexts; folk forms continue',
    timelineYear: -2500,
    material: 'Fired terracotta with clay pellets inside',
    significance:
      'Hollow clay rattles containing pellets are among the oldest sound toys known from South Asia, used to soothe and entertain infants.',
    description:
      'A hollow fired-clay body encloses loose clay balls that rattle when shaken. Regional names vary; the names used here are folk terms and may differ by region.',
    references: [
      { title: 'Harappa.com — Indus toys and rattles', note: 'Illustrates terracotta rattles from Harappa.' },
      { title: 'J. M. Kenoyer, Ancient Cities of the Indus Valley Civilization (1998)', note: 'General discussion of clay toys.' },
    ],
    artifactStatus: 'archaeologically-attested',
    statusNote: 'The rattle type is attested; regional names vary. The 3D model is an educational reconstruction.',
    modelKey: 'rattle',
    accent: '#B5562F',
  },
  {
    id: 'thalayati-bommai',
    slug: 'thanjavur-thalayati-bommai',
    number: 6,
    name: 'Thanjavur Thalayati Bommai',
    localName: 'Thalaiyatti Bommai',
    region: 'Thanjavur, Tamil Nadu',
    coordinates: { lat: 10.79, lng: 79.14 },
    period: 'Associated with the 19th-century Thanjavur Maratha period (popular attribution)',
    timelineYear: 1800,
    material: 'Terracotta / papier-mâché, plaster, weighted rounded base',
    significance:
      'The bobble-head "dancing doll" rocks and nods without falling over because of its weighted, rounded base. Thanjavur dolls hold a GI tag.',
    description:
      'The centre of gravity sits low in a rounded base, so the doll always returns upright. The model reproduces this tilting motion in 3D.',
    references: [
      { title: 'Geographical Indications Registry, Government of India', note: 'Thanjavur Dolls registered as a GI.' },
    ],
    artifactStatus: 'living-tradition',
    statusNote: 'Living craft. The 3D model is an educational representation.',
    modelKey: 'thalayati',
    accent: '#B8862F',
  },
  {
    id: 'buddhist-figure',
    slug: 'buddhist-heritage-figure',
    number: 7,
    name: 'Buddhist Heritage Figure',
    region: 'Sarnath, Mathura & Gandhara schools',
    coordinates: { lat: 25.38, lng: 83.02 },
    period: 'c. 1st–5th century CE (Kushana to Gupta periods)',
    timelineYear: 100,
    material: 'Sandstone, schist and bronze (in originals)',
    significance:
      'Seated Buddha images from Sarnath, Mathura and Gandhara shaped Buddhist art across Asia. These are devotional sculptures, not toys, and are included for cultural context.',
    description:
      'A seated figure in meditation on a lotus base with a halo. This is a simplified, respectful educational form inspired by these sculptural styles.',
    references: [
      { title: 'Sarnath Museum, Archaeological Survey of India', note: 'Gupta-period seated Buddha sculptures.' },
      { title: 'Government Museum, Mathura', note: 'Kushana-period Buddhist sculpture collection.' },
    ],
    artifactStatus: 'interpretive',
    statusNote: 'Inspired by sculptural styles. Not a replica of any specific sacred object.',
    modelKey: 'buddhist-figure',
    accent: '#C9A86A',
  },
  {
    id: 'jataka-animal',
    slug: 'buddhist-jataka-animal-figure',
    number: 8,
    name: 'Buddhist Jataka Story Figure / Animal Toy',
    region: 'Bharhut & Sanchi, Madhya Pradesh',
    coordinates: { lat: 23.48, lng: 77.74 },
    period: 'Jataka reliefs c. 2nd–1st century BCE',
    timelineYear: -150,
    material: 'Terracotta representation (reliefs originally in sandstone)',
    significance:
      'Jataka tales of the Buddha\u2019s previous lives, such as the Chaddanta (six-tusked elephant) Jataka, are carved on the railings and gateways of Bharhut and Sanchi.',
    description:
      'This elephant figure interprets Jataka animal imagery as a toy-like form for learning. It is not an excavated toy.',
    references: [
      { title: 'Bharhut stupa railings — Indian Museum, Kolkata', note: 'Labelled Jataka reliefs.' },
      { title: 'Sanchi stupa gateways — Archaeological Survey of India', note: 'Chaddanta Jataka panels.' },
    ],
    artifactStatus: 'interpretive',
    statusNote: 'Interpretive form inspired by relief imagery. The toy form is an educational creation.',
    modelKey: 'jataka-elephant',
    accent: '#A0522D',
  },
  {
    id: 'wooden-bull-cart',
    slug: 'traditional-wooden-bull-cart',
    number: 9,
    name: 'Traditional Wooden Bull & Cart',
    localName: 'Bandi / Mattu Vandi',
    region: 'Rural South and Central India',
    coordinates: { lat: 15.32, lng: 75.71 },
    period: 'Folk tradition continuing the ancient cart motif',
    timelineYear: 1700,
    material: 'Carved wood, lacquer and natural paints',
    significance:
      'Painted wooden bullock-cart toys mirror the agrarian life of rural India and connect directly to the cart toys of the Indus Valley thousands of years earlier.',
    description:
      'A pair of bulls draws a covered cart with spoked wheels, carved and painted by village toy-makers. The model is a stylised representation.',
    references: [
      { title: 'Development Commissioner (Handicrafts), Ministry of Textiles', note: 'Wooden toy craft clusters of India.' },
    ],
    artifactStatus: 'living-tradition',
    statusNote: 'Living folk craft. The 3D model is an educational representation.',
    modelKey: 'bull-cart',
    accent: '#8A5A2B',
  },
  {
    id: 'bommalattam',
    slug: 'bommalattam-string-puppet',
    number: 10,
    name: 'Bommalattam – Traditional Tamil String Puppet',
    localName: 'Bommalattam',
    region: 'Kumbakonam & Thanjavur region, Tamil Nadu',
    coordinates: { lat: 10.96, lng: 79.38 },
    period: 'Centuries-old performing tradition; continues today',
    timelineYear: 1650,
    material: 'Carved wood, cloth costumes, strings and rods',
    significance:
      'Bommalattam combines string and rod techniques; puppets can be large and heavy, controlled from an iron ring worn on the puppeteer\u2019s head. It is an endangered performing art.',
    description:
      'Performances retell episodes from the Ramayana, Mahabharata and Puranas with music and narration. The model shows a costumed puppet hanging from its control bar.',
    references: [
      { title: 'Sangeet Natak Akademi — Puppetry traditions of India', note: 'Documentation of Bommalattam.' },
    ],
    artifactStatus: 'living-tradition',
    statusNote: 'Living performing tradition. The 3D model is an educational representation.',
    modelKey: 'bommalattam',
    accent: '#B22222',
  },
];

export const TOTAL_EXHIBITS = HERITAGE_EXHIBITS.length;

export function getExhibitById(id: string) {
  return HERITAGE_EXHIBITS.find((exhibit) => exhibit.id === id);
}

export function getExhibitBySlug(slug: string) {
  return HERITAGE_EXHIBITS.find((exhibit) => exhibit.slug === slug);
}

export function getExhibitsChronologically() {
  return [...HERITAGE_EXHIBITS].sort((a, b) => a.timelineYear - b.timelineYear);
}

export function getExhibitMapPoints() {
  return HERITAGE_EXHIBITS.map(({ id, name, coordinates, region }) => ({ id, name, region, ...coordinates }));
}

export function formatTimelineYear(year: number) {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

export interface GalleryModule {
  id: 'gallery' | 'compare' | 'map' | 'detail-pages' | 'timeline';
  title: string;
  description: string;
  status: 'live' | 'preview' | 'planned';
}

export const GALLERY_MODULES: GalleryModule[] = [
  { id: 'gallery', title: '3D Exhibition Hall', description: 'Explore all 10 exhibits in an interactive museum hall.', status: 'live' },
  { id: 'compare', title: 'Compare Exhibits', description: 'Side-by-side comparison of two toys.', status: 'preview' },
  { id: 'map', title: 'India Heritage Map', description: 'Locate each tradition on an interactive map of India.', status: 'planned' },
  { id: 'detail-pages', title: 'Exhibit Detail Pages', description: 'Dedicated pages with deep history, sources and media.', status: 'planned' },
  { id: 'timeline', title: 'Educational Timeline', description: 'Trace Indian toys from 2600 BCE to today.', status: 'planned' },
];
