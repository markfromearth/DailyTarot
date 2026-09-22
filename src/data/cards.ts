import { Suit, TarotCard } from '../types/tarot';

const MAJOR_ARCANA_NAMES = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

const getImageUrl = (id: string): string | undefined => {
  const map: Record<string, string> = {
    'major-0': '/cards/card_the_fool.jpg',
    'major-1': '/cards/card_the_magician.jpg',
    'major-2': '/cards/card_the_high_priestess.jpg',
    'major-3': '/cards/card_the_empress.jpg',
    'major-4': '/cards/card_the_emperor.jpg',
    'major-16': '/cards/card_the_tower.jpg',
    'major-17': '/cards/card_the_star.jpg',
    'major-18': '/cards/card_the_moon.jpg',
    'major-19': '/cards/card_the_sun.jpg',
    'major-21': '/cards/card_the_world.jpg',
    'wands-1': '/cards/card_ace_of_wands.jpg',
  };
  return map[id];
};

const generateMajorArcana = (): TarotCard[] => {
  return MAJOR_ARCANA_NAMES.map((name, index) => ({
    id: `major-${index}`,
    name,
    arcana: 'major',
    suit: null,
    number: index,
    uprightMeaning: `${name} (Upright)`,
    reversedMeaning: `${name} (Reversed)`,
    imageUrl: getImageUrl(`major-${index}`)
  }));
};

const generateMinorArcana = (suit: Exclude<Suit, null>): TarotCard[] => {
  const cards: TarotCard[] = [];
  const ranks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
  
  ranks.forEach((rankName, index) => {
    const number = index + 1;
    const id = `${suit}-${number}`;
    cards.push({
      id,
      name: `${rankName} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
      arcana: 'minor',
      suit,
      number,
      uprightMeaning: `${rankName} of ${suit} (Upright)`,
      reversedMeaning: `${rankName} of ${suit} (Reversed)`,
      imageUrl: getImageUrl(id)
    });
  });
  return cards;
};

export const TAROT_DECK: TarotCard[] = [
  ...generateMajorArcana(),
  ...generateMinorArcana('wands'),
  ...generateMinorArcana('cups'),
  ...generateMinorArcana('swords'),
  ...generateMinorArcana('pentacles')
];
