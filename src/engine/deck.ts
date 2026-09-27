import { TAROT_DECK } from '../data/cards';
import { TarotCard, DrawnCard, Orientation } from '../types/tarot';

export class DeckEngine {
  private availableCards: TarotCard[];
  private drawnCards: DrawnCard[];

  constructor() {
    // Deep copy to ensure isolated state
    this.availableCards = [...TAROT_DECK];
    this.drawnCards = [];
  }

  /**
   * Fisher-Yates shuffle algorithm.
   * Genuinely randomizes the available deck.
   */
  public shuffle(): void {
    const deck = [...this.availableCards];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    this.availableCards = deck;
    this.initialShuffledDeck = [...deck];
  }

  /**
   * Randomly assigns an orientation.
   */
  private getRandomOrientation(): Orientation {
    return Math.random() >= 0.5 ? 'upright' : 'reversed';
  }

  /**
   * Draws a specific number of cards from the top of the available deck.
   */
  public draw(count: number): DrawnCard[] {
    if (count > this.availableCards.length) {
      throw new Error("Not enough cards left in the deck.");
    }

    const newlyDrawn: DrawnCard[] = [];
    for (let i = 0; i < count; i++) {
      // Pop removes from the end (top) of the deck
      const card = this.availableCards.pop()!;
      
      const drawnCard: DrawnCard = {
        card,
        orientation: this.getRandomOrientation()
      };
      
      this.drawnCards.push(drawnCard);
      newlyDrawn.push(drawnCard);
    }
    return newlyDrawn;
  }

  /**
   * Selects a specific card by ID from the available deck.
   */
  public selectCardById(id: string): DrawnCard {
    const isAlreadyDrawn = this.drawnCards.some(d => d.card.id === id);
    if (isAlreadyDrawn) {
      throw new Error(`Card ${id} has already been drawn.`);
    }

    const index = this.availableCards.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Card ${id} not found in available deck.`);
    }

    // Remove the card from the available deck
    const [card] = this.availableCards.splice(index, 1);
    
    const drawnCard: DrawnCard = {
      card,
      orientation: this.getRandomOrientation()
    };
    
    this.drawnCards.push(drawnCard);

    return drawnCard;
  }

  public getAvailableCards(): TarotCard[] {
    return [...this.availableCards];
  }

  /**
   * Returns all cards that were originally in the deck after the last shuffle,
   * regardless of whether they have been drawn yet.
   * Useful for mapping stable DOM nodes.
   */
  public getInitialDeckOrder(): TarotCard[] {
    return this.initialShuffledDeck ? [...this.initialShuffledDeck] : [...this.availableCards];
  }
  
  private initialShuffledDeck: TarotCard[] | null = null;

  public getDrawnCards(): DrawnCard[] {
    return [...this.drawnCards];
  }

  /**
   * Restores the engine to a previously saved state.
   */
  public restoreState(
    availableCardIds: string[], 
    drawnCardsData: { id: string; orientation: Orientation }[],
    initialShuffledDeckIds: string[]
  ): void {
    // Re-map IDs to actual cards to ensure data freshness
    this.availableCards = availableCardIds
      .map(id => TAROT_DECK.find(c => c.id === id))
      .filter((c): c is TarotCard => c !== undefined);

    this.drawnCards = drawnCardsData
      .map(data => {
        const card = TAROT_DECK.find(c => c.id === data.id);
        if (!card) return null;
        return { card, orientation: data.orientation };
      })
      .filter((d): d is DrawnCard => d !== null);

    this.initialShuffledDeck = initialShuffledDeckIds
      .map(id => TAROT_DECK.find(c => c.id === id))
      .filter((c): c is TarotCard => c !== undefined);
  }
}
