const fs = require('fs');

async function generate() {
  const res = await fetch(
    'https://raw.githubusercontent.com/dariusk/corpora/master/data/divination/tarot_interpretations.json'
  );
  const data = await res.json();
  const rawCards = data.tarot_interpretations;

  const cards = [];

  for (const c of rawCards) {
    const isMajor = c.suit === 'major';

    // Process suit
    let suit = null;
    if (!isMajor) {
      suit = c.suit === 'coins' ? 'pentacles' : c.suit; // e.g. "swords"
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

    // Format card name (Title Case + replace "coins" with "Pentacles")
    const formatCardName = (rawName) => {
      return rawName
        .replace(/\bcoins\b/gi, 'Pentacles')
        .split(' ')
        .map((word) => {
          const lower = word.toLowerCase();
          if (lower === 'of' || lower === 'the') {
            return lower;
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ')
        .replace(/^the\b/i, 'The');
    };

    const formattedName = formatCardName(c.name);
    const imageSlug = formattedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const imageUrl = `/cards/card_${imageSlug}.jpg`;

    cards.push({
      id,
      name: formattedName,
      arcana,
      suit,
      rank,
      number,
      uprightMeaning,
      reversedMeaning,
      imageUrl,
      imageAltText: formattedName,
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
