import { ANCIENT_TOYS, type AncientToy } from '@/data/toyData';
import type { HeritageToyKind } from './HeritageToyScene';

export interface HeritageToyExhibit {
  toy: AncientToy;
  title: string;
  region: string;
  period: string;
  material: string;
  kind: HeritageToyKind;
  description: string;
  context: string;
  reconstructionNote?: string;
}

const sourceToys = new Map(ANCIENT_TOYS.map((toy) => [toy.id, toy]));

function exhibit(
  sourceId: string,
  details: Omit<HeritageToyExhibit, 'toy'>,
): HeritageToyExhibit {
  const toy = sourceToys.get(sourceId);
  if (!toy) throw new Error(`Missing existing toy record: ${sourceId}`);
  return { toy, ...details };
}

export const HERITAGE_TOY_EXHIBITS: HeritageToyExhibit[] = [
  exhibit('toy-cart', {
    title: 'Indus Valley Terracotta Cart & Animal',
    region: 'Indus Valley / Harappan',
    period: 'c. 2500–1700 BCE',
    material: 'Hand-formed terracotta',
    kind: 'cart',
    description: 'A miniature cart and draft animal, shaped in clay with a solid bed, axle, spoked wheels, and modeled animal details.',
    context: 'Terracotta wheeled toys are known from Indus settlements. Their exact construction and play use varied, so this display presents a plausible form rather than a single definitive object.',
    reconstructionNote: 'Digital reconstruction based on archaeological evidence and known artifact forms.',
  }),
  exhibit('movable-head-bull', {
    title: 'Channapatna Wooden Toy',
    region: 'Karnataka, India',
    period: 'Traditional craft; living heritage',
    material: 'Turned wood with lacquer-style finish',
    kind: 'channapatna',
    description: 'A turned wooden figure with smooth, rounded contours, layered lacquer colors, and fine painted bands inspired by Channapatna craft.',
    context: 'Channapatna in Karnataka is known for lathe-turned wooden toys and lacquer work. This digital display evokes the craft tradition and is not a catalogued historical artifact.',
  }),
  exhibit('wheeled-animal', {
    title: 'Kondapalli Bommalu',
    region: 'Andhra Pradesh, India',
    period: 'Traditional craft; living heritage',
    material: 'Lightweight wood with hand-painted details',
    kind: 'kondapalli',
    description: 'A compact folk figure with a hand-shaped silhouette, painted garments, and regional decorative accents inspired by Kondapalli toy-making.',
    context: 'Kondapalli artisans make lightweight wooden figures from locally sourced softwood and paint them in expressive colors. This is a digital interpretation of the living craft.',
  }),
  exhibit('spinning-top', {
    title: 'Lattu / Traditional Spinning Top',
    region: 'Indian Subcontinent',
    period: 'Traditional toy; living heritage',
    material: 'Turned and painted wood',
    kind: 'top',
    description: 'A balanced wooden top with carved rings, a rounded crown, colored bands, and a tapered spinning point.',
    context: 'Lattu tops have many regional forms and remain a familiar traditional toy. The displayed proportions are representative, not a claim about one ancient specimen.',
  }),
  exhibit('bird-whistle', {
    title: 'Chankana / Ghuggu',
    region: 'South Asia',
    period: 'Traditional toy; regional forms vary',
    material: 'Terracotta',
    kind: 'rattle',
    description: 'A modeled terracotta sound toy with a hollow, rounded body, small surface motifs, and a handle-like stem.',
    context: 'Chankana and ghuggu refer to traditional sound-making forms in different regional contexts. Names, construction, and whether an object is a rattle or whistle can vary.',
  }),
  exhibit('ancient-rattle', {
    title: 'Thanjavur Thalayati Bommai',
    region: 'Tamil Nadu, India',
    period: 'Traditional craft; living heritage',
    material: 'Hand-painted composition and wood',
    kind: 'bobble',
    description: 'A traditional nodding doll with a weighted rounded base, stacked body, expressive face, and painted ornamental bands.',
    context: 'Thanjavur bobble-head dolls are designed to sway when gently nudged. This model interprets the familiar form as a crafted museum display.',
  }),
  exhibit('ancient-marbles', {
    title: 'Buddhist Heritage Figure',
    region: 'South Asian Buddhist heritage',
    period: 'Digital reconstruction',
    material: 'Modeled clay with restrained gilded details',
    kind: 'buddha',
    description: 'A seated heritage figure shown with a calm pose, layered robe, and simple lotus-inspired base.',
    context: 'The exhibit is a contemporary digital interpretation of broad Buddhist visual motifs, not a reconstruction of a specific excavated toy or sculpture.',
    reconstructionNote: 'DIGITAL RECONSTRUCTION. No documented artifact model is represented here.',
  }),
  exhibit('wheeled-bird', {
    title: 'Buddhist Jataka Story Animal Figure',
    region: 'South Asian Buddhist heritage',
    period: 'Digital reconstruction',
    material: 'Modeled terracotta with painted accents',
    kind: 'jataka',
    description: 'A small animal figure imagined as a storytelling object, with modeled limbs, expressive features, and subtle decorative markings.',
    context: 'Jataka narratives include animal characters, but no specific historical toy is claimed by this design. The scene is an educational digital interpretation.',
    reconstructionNote: 'DIGITAL RECONSTRUCTION. No documented artifact model is represented here.',
  }),
  exhibit('rope-monkey', {
    title: 'Traditional Wooden Bull & Cart',
    region: 'India',
    period: 'Traditional toy; regional forms vary',
    material: 'Carved wood with painted details',
    kind: 'bullCart',
    description: 'A wooden bull and small cart assembled as a handcrafted play object, with turned wheels, a shaped yoke, and painted accents.',
    context: 'Bullock carts are familiar across Indian agricultural histories and folk traditions. This toy form is a general interpretation, not tied to a specific archaeological find.',
  }),
  exhibit('toy-boat', {
    title: 'Bommalattam',
    region: 'Tamil Nadu, India',
    period: 'Traditional performance craft; living heritage',
    material: 'Carved wood, paint, and cotton strings',
    kind: 'puppet',
    description: 'A Tamil string puppet with a carved head, painted costume, articulated-looking limbs, and suspension strings.',
    context: 'Bommalattam is a Tamil puppet theatre tradition that combines string and rod manipulation. The exhibit represents a puppet form, not a specific historic performer or artifact.',
  }),
];
