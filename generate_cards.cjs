const fs = require('fs');

async function generate() {
  const res = await fetch('https://raw.githubusercontent.com/dariusk/corpora/master/data/divination/tarot_interpretations.json');
  const data = await res.json();
  const rawCards = data.tarot_interpretations;

  const cards = [];

  for (const c of rawCards) {
    const isMajor = c.suit === 'major';
    
    // Process suit
    let suit = null;
    if (!isMajor) {
      suit = c.suit === "coins" ? "pentacles" : c.suit; // e.g. "swords"
    }

    // Process rank and number
    let rank = null;
    let number = null;
    let arcana = isMajor ? 'major' : 'minor';

    // The corpus has "rank" as an integer or string
    // e.g., 0, 1, 2... or "page", "knight", "queen", "king"
    if (isMajor) {
      number = parseInt(c.rank);
    } else {
      if (typeof c.rank === 'string') {
        rank = c.rank; // "page", "knight", "queen", "king"
        if (rank === 'page') number = 11;
        if (rank === 'knight') number = 12;
        if (rank === 'queen') number = 13;
        if (rank === 'king') number = 14;
      } else {
        number = parseInt(c.rank);
        if (number === 1) {
          rank = 'ace';
        } else {
          rank = number.toString();
        }
      }
    }

    // ID generation
    let id = '';
    if (isMajor) {
      id = `major-${number}`;
    } else {
      id = `${suit}-${number}`;
    }

    // Meaning
    const uprightMeaning = c.meanings.light.join('. ') + '.';
    const reversedMeaning = c.meanings.shadow.join('. ') + '.';

    // Images mapping
    const getImageUrl = (id) => {
      const map = {
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

    cards.push({
      id,
      name: c.name,
      arcana,
      suit,
      rank,
      number,
      uprightMeaning,
      reversedMeaning,
      imageUrl: getImageUrl(id),
      imageAltText: c.name
    });
  }

  // Generate TypeScript code
  const tsCode = `import { TarotCard } from '../types/tarot';

export const TAROT_DECK: TarotCard[] = ${JSON.stringify(cards, null, 2)};
`;

  fs.writeFileSync('src/data/cards.ts', tsCode);
  console.log('src/data/cards.ts generated.');
}

generate().catch(console.error);
