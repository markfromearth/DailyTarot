import { TarotCard, Orientation } from '../types/tarot';

export interface CardKeywordSet {
  upright: string[];
  reversed: string[];
}

export const CARD_KEYWORDS: Record<string, CardKeywordSet> = {
  // Major Arcana (0 - 21)
  'major-0': {
    upright: ['New beginnings', 'Innocence', 'Leap of faith', 'Spontaneity', 'Curiosity'],
    reversed: ['Holding back', 'Indecision', 'Recklessness', 'Bad choices', 'Risk-taking'],
  },
  'major-1': {
    upright: ['Manifestation', 'Resourcefulness', 'Willpower', 'Divine action', 'Mastery'],
    reversed: ['Manipulation', 'Wasted talent', 'Illusion', 'Deception', 'Shortcuts'],
  },
  'major-2': {
    upright: ['Intuition', 'Sacred knowledge', 'Divine feminine', 'Inner voice', 'Stillness'],
    reversed: ['Secrets kept', 'Repressed feelings', 'Superficiality', 'Disconnection', 'Mistrust'],
  },
  'major-3': {
    upright: ['Abundance', 'Fertility', 'Nurturing', 'Sensuality', 'Creative flow'],
    reversed: ['Creative block', 'Overdependence', 'Smothering', 'Neglect', 'Depletion'],
  },
  'major-4': {
    upright: ['Authority', 'Structure', 'Protection', 'Firm leadership', 'Discipline'],
    reversed: ['Tyranny', 'Rigidity', 'Domination', 'Control issues', 'Inflexibility'],
  },
  'major-5': {
    upright: ['Spiritual wisdom', 'Tradition', 'Higher learning', 'Moral guidance', 'Belonging'],
    reversed: ['Dogma', 'Blind obedience', 'Conformity', 'Rebellion', 'Unorthodox path'],
  },
  'major-6': {
    upright: ['Deep alignment', 'Soul union', 'Duality in harmony', 'Shared values', 'Key choices'],
    reversed: ['Disharmony', 'Broken trust', 'Inner conflict', 'Misalignment', 'One-sidedness'],
  },
  'major-7': {
    upright: ['Triumph', 'Laser focus', 'Determination', 'Overcoming hurdles', 'Momentum'],
    reversed: ['Lack of control', 'Aggression', 'Aimlessness', 'Obstacles', 'Burnout'],
  },
  'major-8': {
    upright: ['Compassion', 'Courage', 'Patience', 'Quiet power', 'Mastering the beast'],
    reversed: ['Self-doubt', 'Raw impulse', 'Insecurity', 'Weakness', 'Volatile temper'],
  },
  'major-9': {
    upright: ['Soul searching', 'Inner lantern', 'Solitude', 'Wisdom', 'Quiet reflection'],
    reversed: ['Isolation', 'Loneliness', 'Reclusiveness', 'Lost path', 'Refusing counsel'],
  },
  'major-10': {
    upright: ['Good fortune', 'Cycles of life', 'Destiny', 'Favorable shifts', 'Karmic turn'],
    reversed: ['Bad luck', 'Resistance to change', 'Setbacks', 'Breaking cycles', 'Turbulence'],
  },
  'major-11': {
    upright: ['Justice', 'Truth', 'Karmic balance', 'Fair verdict', 'Clarity'],
    reversed: ['Dishonesty', 'Bias', 'Unfairness', 'Avoided accountability', 'Harsh blame'],
  },
  'major-12': {
    upright: ['Surrender', 'New perspective', 'Letting go', 'Sacrifice', 'Pause'],
    reversed: ['Martyrdom', 'Stalling', 'Stubborn resistance', 'Futile struggle', 'Indecision'],
  },
  'major-13': {
    upright: ['Transformation', 'Rebirth', 'Ending an era', 'Deep transition', 'Clearing the old'],
    reversed: ['Fear of change', 'Clinging to past', 'Stagnation', 'Decay', 'Inability to grieve'],
  },
  'major-14': {
    upright: ['Balance', 'Moderation', 'Patience', 'Alchemy', 'Inner peace'],
    reversed: ['Imbalance', 'Excess', 'Impatience', 'Discord', 'Competing extremes'],
  },
  'major-15': {
    upright: ['Shadow self', 'Material bonds', 'Illusion', 'Temptation', 'Attachment'],
    reversed: ['Breaking chains', 'Reclaiming power', 'Freedom', 'Facing demons', 'Awakening'],
  },
  'major-16': {
    upright: ['Sudden awakening', 'Shattered illusions', 'Breakthrough', 'Catalyst', 'Revelation'],
    reversed: ['Avoiding disaster', 'Delayed collapse', 'Fear of suffering', 'Internal crisis', 'Rebuilding'],
  },
  'major-17': {
    upright: ['Hope', 'Faith', 'Divine guidance', 'Inspiration', 'Renewal'],
    reversed: ['Despair', 'Lack of faith', 'Disappointment', 'Pessimism', 'Dimmed light'],
  },
  'major-18': {
    upright: ['Subconscious', 'Dreams', 'Illusion', 'Intuition', 'Hidden truths'],
    reversed: ['Confusion lifted', 'Fear dispelled', 'Clarity emerging', 'Exposing deceit', 'Paranoia'],
  },
  'major-19': {
    upright: ['Joy', 'Success', 'Vitality', 'Celebration', 'Clarity'],
    reversed: ['Temporary gloom', 'Over-optimism', 'Delayed warmth', 'Ego clash', 'Fatigue'],
  },
  'major-20': {
    upright: ['Awakening', 'Reckoning', 'Higher calling', 'Absolution', 'Transformation'],
    reversed: ['Self-doubt', 'Harsh self-judgment', 'Refusing the call', 'Guilt', 'Regret'],
  },
  'major-21': {
    upright: ['Completion', 'Wholeness', 'Triumph', 'Cosmic harmony', 'Fulfillment'],
    reversed: ['Unfinished business', 'Seeking closure', 'Delays', 'Lack of completion', 'Stagnant finale'],
  },

  // Suit of Wands
  'wands-1': {
    upright: ['Creative spark', 'New passion', 'Inspiration', 'Vitality', 'Bold action'],
    reversed: ['Delays', 'Lack of spark', 'Hesitation', 'Missed opportunity', 'Creative block'],
  },
  'wands-2': {
    upright: ['Future planning', 'Progress', 'Decisions', 'Discovery', 'Expanding horizon'],
    reversed: ['Fear of unknown', 'Poor planning', 'Playing safe', 'Hesitation', 'Overanalysis'],
  },
  'wands-3': {
    upright: ['Expansion', 'Foresight', 'Overseas ventures', 'Momentum', 'Enterprise'],
    reversed: ['Obstacles', 'Delays', 'Frustration', 'Canceled plans', 'Narrow outlook'],
  },
  'wands-4': {
    upright: ['Celebration', 'Harmony', 'Homecoming', 'Milestone', 'Joyful community'],
    reversed: ['Home tension', 'Cancelled gathering', 'Transient joy', 'Lack of support', 'Insecurity'],
  },
  'wands-5': {
    upright: ['Rivalry', 'Healthy debate', 'Spirited conflict', 'Competition', 'Adrenaline'],
    reversed: ['Destructive fighting', 'Avoiding tension', 'Compromise reached', 'Petty bickering', 'Chaos'],
  },
  'wands-6': {
    upright: ['Victory', 'Public recognition', 'Progress', 'Self-confidence', 'Acclaim'],
    reversed: ['Ego inflation', 'Fallen hero', 'Lack of recognition', 'Private doubt', 'Disgrace'],
  },
  'wands-7': {
    upright: ['Defending ground', 'Perseverance', 'Courage', 'Holding high ground', 'Conviction'],
    reversed: ['Giving up', 'Overwhelmed', 'Compromised stance', 'Defensiveness', 'Exhaustion'],
  },
  'wands-8': {
    upright: ['Swift motion', 'Speed', 'Fast developments', 'Clear signal', 'Travel'],
    reversed: ['Delays', 'Miscommunication', 'Frantic rush', 'Impatience', 'Stalled journey'],
  },
  'wands-9': {
    upright: ['Resilience', 'Courage', 'Final stand', 'Grit', 'Guarded boundary'],
    reversed: ['Paranoia', 'Weariness', 'Stubborn refusal', 'Defensive walls', 'Near surrender'],
  },
  'wands-10': {
    upright: ['Heavy burden', 'Responsibility', 'Overextension', 'Finishing line', 'Duty'],
    reversed: ['Burnout', 'Dropping the load', 'Delegation', 'Crushing pressure', 'Unnecessary weight'],
  },
  'wands-11': {
    upright: ['Enthusiasm', 'Exploration', 'Creative spark', 'Free spirit', 'Discovery'],
    reversed: ['Impatience', 'Procrastination', 'Unreliable', 'Boredom', 'Superficial energy'],
  },
  'wands-12': {
    upright: ['Energy', 'Passion', 'Adventurous', 'Direct action', 'Impulsive courage'],
    reversed: ['Recklessness', 'Volatile anger', 'Hasty blunders', 'Short temper', 'Arrogance'],
  },
  'wands-13': {
    upright: ['Vibrant confidence', 'Warmth', 'Independence', 'Determination', 'Magnetic grace'],
    reversed: ['Demanding', 'Jealousy', 'Insecurity', 'Burnout', 'Spiteful outbursts'],
  },
  'wands-14': {
    upright: ['Natural leader', 'Visionary', 'Dynamic strength', 'Honor', 'Inspirational'],
    reversed: ['Avoiding responsibility', 'Wasted creativity', 'Dictatorial', 'Arrogant boasting', 'Impatience'],
  },

  // Suit of Cups
  'cups-1': {
    upright: ['Love outpouring', 'New feelings', 'Emotional blessing', 'Compassion', 'Spiritual awakening'],
    reversed: ['Blocked emotion', 'Emptiness', 'Unrequited love', 'Emotional burnout', 'Self-neglect'],
  },
  'cups-2': {
    upright: ['Mutual attraction', 'Soul bond', 'Partnership', 'Equality', 'Harmonious union'],
    reversed: ['Breakdown', 'Distrust', 'Imbalance', 'Codependency', 'Mismatched priorities'],
  },
  'cups-3': {
    upright: ['Celebration', 'Friendship', 'Sisterhood', 'Community', 'Creative collaboration'],
    reversed: ['Gossip', 'Exclusion', 'Overindulgence', 'Third party tension', 'Isolation'],
  },
  'cups-4': {
    upright: ['Meditation', 'Apathy', 'Contemplation', 'Disconnection', 'Overlooked gift'],
    reversed: ['Sudden clarity', 'Seizing opportunities', 'Breaking apathy', 'Renewed curiosity', 'Motivation'],
  },
  'cups-5': {
    upright: ['Grief', 'Regret', 'Spilled emotion', 'Loss', 'Mourning the past'],
    reversed: ['Acceptance', 'Healing', 'Moving forward', 'Finding comfort', 'Reclaiming joy'],
  },
  'cups-6': {
    upright: ['Nostalgia', 'Innocence', 'Reunion', 'Sweet memories', 'Childhood joy'],
    reversed: ['Stuck in the past', 'Outgrown ties', 'Unrealistic longing', 'Moving on', 'Naivety'],
  },
  'cups-7': {
    upright: ['Illusion', 'Many choices', 'Wishful thinking', 'Fantasy', 'Daydreaming'],
    reversed: ['Clarity', 'Decisiveness', 'Dispel illusion', 'Grounded goals', 'Sobriety'],
  },
  'cups-8': {
    upright: ['Walking away', 'Deeper quest', 'Abandoning the shallow', 'Spiritual journey', 'Letting go'],
    reversed: ['Fear of leaving', 'Lingering too long', 'Aimless drift', 'Unfinished journey', 'Hopeless longing'],
  },
  'cups-9': {
    upright: ['Contentment', 'Wish fulfilled', 'Gratitude', 'Satisfaction', 'Pleasure'],
    reversed: ['Smugness', 'Overindulgence', 'Superficial happiness', 'Inner emptiness', 'Greed'],
  },
  'cups-10': {
    upright: ['Divine peace', 'Family bliss', 'Emotional wholeness', 'Serenity', 'Lasting happiness'],
    reversed: ['Domestic strife', 'Shattered peace', 'Broken bonds', 'Misaligned values', 'Disillusionment'],
  },
  'cups-11': {
    upright: ['Creative messenger', 'Intuitive whisper', 'Sweet curiosity', 'Sensitivity', 'Artistic dream'],
    reversed: ['Emotional immaturity', 'Moody insecurity', 'Creative block', 'Escapism', 'Tantrums'],
  },
  'cups-12': {
    upright: ['Romantic idealism', 'Following heart', 'Poetic grace', 'Charm', 'Intuitive quest'],
    reversed: ['Fanaticism', 'Misguided intuition', 'Uncontrolled emotions', 'Jealousy', 'Moody escapism'],
  },
  'cups-13': {
    upright: ['Empathetic warmth', 'Emotional healer', 'Compassion', 'Calm harbor', 'Devoted heart'],
    reversed: ['Codependency', 'Smothering', 'Emotional manipulation', 'Martyr complex', 'Exhausted empathy'],
  },
  'cups-14': {
    upright: ['Emotional mastery', 'Wisdom', 'Compassionate leader', 'Serene balance', 'Diplomacy'],
    reversed: ['Emotional volatility', 'Cold manipulation', 'Suppressed trauma', 'Mood swings', 'Numbness'],
  },

  // Suit of Swords
  'swords-1': {
    upright: ['Mental clarity', 'Breakthrough truth', 'Sharp intellect', 'Justice', 'New vision'],
    reversed: ['Confusion', 'Hostility', 'Misinformation', 'Clouded vision', 'Brutal cruelty'],
  },
  'swords-2': {
    upright: ['Stalemate', 'Blind decision', 'Weighing truths', 'Guarded peace', 'Truce'],
    reversed: ['Indecision', 'Lies revealed', 'Information overload', 'Forced resolution', 'Cold shoulder'],
  },
  'swords-3': {
    upright: ['Heartbreak', 'Painful truth', 'Grief', 'Rejection', 'Healing storm'],
    reversed: ['Recovering from sorrow', 'Forgiveness', 'Releasing pain', 'Lingering resentment', 'Optimism'],
  },
  'swords-4': {
    upright: ['Rest', 'Sanctuary', 'Meditation', 'Recovery', 'Still contemplation'],
    reversed: ['Exhaustion', 'Burnout', 'Forced isolation', 'Restless insomnia', 'Slow awakening'],
  },
  'swords-5': {
    upright: ['Hollow victory', 'Conflict', 'Defeat', 'Self-interest', 'Pyrrhic win'],
    reversed: ['Reconciliation', 'Ending disputes', 'Swallowing pride', 'Past grudges', 'Healing dialogue'],
  },
  'swords-6': {
    upright: ['Transition', 'Calmer waters', 'Leaving distress', 'Quiet passage', 'Recovery journey'],
    reversed: ['Trapped baggage', 'Stalled departure', 'Emotional turbulence', 'Unresolved pain', 'Rough crossing'],
  },
  'swords-7': {
    upright: ['Strategy', 'Stealth', 'Resourceful cunning', 'Sneak move', 'Self-reliance'],
    reversed: ['Confession', 'Caught red-handed', 'Imposter syndrome', 'Overlooked flaw', 'Regret'],
  },
  'swords-8': {
    upright: ['Self-imposed trap', 'Limiting beliefs', 'Blind helplessness', 'Anxiety', 'Victimhood'],
    reversed: ['Freedom', 'Open eyes', 'Breaking limits', 'Empowerment', 'Escaping cage'],
  },
  'swords-9': {
    upright: ['Nightmares', 'Severe anxiety', 'Guilt', 'Insomnia', 'Mental anguish'],
    reversed: ['Hope returning', 'Facing fears', 'Overcoming trauma', 'Reaching out', 'Mental recovery'],
  },
  'swords-10': {
    upright: ['Rock bottom', 'Definitive ending', 'Painful collapse', 'Betrayal', 'Dawn after dark'],
    reversed: ['Recovery', 'Surviving worst', 'Rebirth from ashes', 'Lingering pain', 'New beginning'],
  },
  'swords-11': {
    upright: ['Curious intellect', 'Truth seeker', 'Sharp observation', 'Agile mind', 'New ideas'],
    reversed: ['Deception', 'Spiteful gossip', 'Paranoia', 'All talk no action', 'Cynicism'],
  },
  'swords-12': {
    upright: ['Direct action', 'Fierce intellect', 'Ambitious drive', 'No nonsense', 'Fearless charge'],
    reversed: ['Impulsive fury', 'Tactless cruelty', 'Reckless rush', 'Burnout', 'Destructive logic'],
  },
  'swords-13': {
    upright: ['Unbiased clarity', 'Sharp wit', 'Perceptive insight', 'Independent truth', 'Boundaries'],
    reversed: ['Cold bitterness', 'Cruel judgment', 'Spite', 'Cynical isolation', 'Hypercritical'],
  },
  'swords-14': {
    upright: ['Mental authority', 'Truth & law', 'Strategic mastery', 'Discipline', 'Wise counsel'],
    reversed: ['Cruel tyranny', 'Manipulative dogma', 'Abuse of power', 'Rigid ruthlessness', 'Dogmatism'],
  },

  // Suit of Pentacles
  'pentacles-1': {
    upright: ['New prosperity', 'Tangible gift', 'Financial seed', 'Abundance', 'Solid footing'],
    reversed: ['Missed investment', 'Financial greed', 'Poor planning', 'Instability', 'Wasted resource'],
  },
  'pentacles-2': {
    upright: ['Weighing options', 'Comparing values', 'Juggling resources', 'Adaptability', 'Financial balance'],
    reversed: ['Financial overwhelm', 'Careless budgeting', 'Indecision', 'Dropping the ball', 'Compulsive spending'],
  },
  'pentacles-3': {
    upright: ['Master craft', 'Teamwork', 'Collaboration', 'Quality build', 'Shared acclaim'],
    reversed: ['Poor workmanship', 'Lack of teamwork', 'Ego clashes', 'Apathy', 'Misaligned plans'],
  },
  'pentacles-4': {
    upright: ['Conserving wealth', 'Security', 'Frugality', 'Guarded boundaries', 'Stability'],
    reversed: ['Greed', 'Hoarding', 'Fear of poverty', 'Possessiveness', 'Financial insecurity'],
  },
  'pentacles-5': {
    upright: ['Hard times', 'Isolation in snow', 'Financial worry', 'Seeking shelter', 'Spiritual test'],
    reversed: ['Recovery', 'Help arriving', 'End of hardship', 'Forgiveness', 'Finding warmth'],
  },
  'pentacles-6': {
    upright: ['Generosity', 'Charity', 'Balanced sharing', 'Fair support', 'Gratitude'],
    reversed: ['Strings attached', 'Debt', 'Inequality', 'One-sided charity', 'Financial abuse'],
  },
  'pentacles-7': {
    upright: ['Patience', 'Long-term reward', 'Assessing growth', 'Fruitful labor', 'Perseverance'],
    reversed: ['Impatience', 'Poor return on effort', 'Wasted work', 'Frustration', 'Giving up too soon'],
  },
  'pentacles-8': {
    upright: ['Apprenticeship', 'Repetition & mastery', 'Diligent craft', 'Focus', 'Dedication'],
    reversed: ['Perfectionism', 'Careless work', 'Boredom', 'Lack of ambition', 'Drudgery'],
  },
  'pentacles-9': {
    upright: ['Self-sufficiency', 'Refinement', 'Abundant luxury', 'Solitary reward', 'Peaceful garden'],
    reversed: ['Overindulgence', 'Superficial pride', 'Financial setback', 'Loneliness', 'Living beyond means'],
  },
  'pentacles-10': {
    upright: ['Legacy', 'Generational wealth', 'Family foundation', 'Security', 'Lasting success'],
    reversed: ['Family dispute', 'Financial catastrophe', 'Broken inheritance', 'Loss of home', 'Rigid tradition'],
  },
  'pentacles-11': {
    upright: ['Practical ambition', 'Student of life', 'Solid opportunity', 'Eager learning', 'Grounding'],
    reversed: ['Lack of focus', 'Missed chance', 'Lazy habits', 'Short-sightedness', 'Foolish spending'],
  },
  'pentacles-12': {
    upright: ['Steadfast duty', 'Routine', 'Unshakable loyalty', 'Hard work', 'Patience'],
    reversed: ['Stubborn grind', 'Boredom', 'Obsessive rigidity', 'Laziness', 'Stagnation'],
  },
  'pentacles-13': {
    upright: ['Nurturing abundance', 'Practical warmth', 'Generous hearth', 'Down to earth', 'Security'],
    reversed: ['Financial anxiety', 'Work-life imbalance', 'Smothering', 'Neglected health', 'Materialism'],
  },
  'pentacles-14': {
    upright: ['Financial abundance', 'Business acumen', 'Provider', 'Empire builder', 'Reliability'],
    reversed: ['Greed', 'Stubborn control', 'Corrupt ambition', 'Financial ruin', 'Materialistic arrogance'],
  },
};

/**
 * Returns a list of concise keywords/phrases (3-5 items) for any given card and orientation.
 */
export function getCardKeywords(card: TarotCard, orientation: Orientation = 'upright'): string[] {
  const set = CARD_KEYWORDS[card.id];
  if (set) {
    return orientation === 'reversed' ? set.reversed : set.upright;
  }
  // Smart fallback from raw meaning sentences if not in explicit dictionary
  const raw = orientation === 'reversed' ? card.reversedMeaning : card.uprightMeaning;
  return raw
    .split(/\.\s+/)
    .map(s => s.replace(/\.$/, '').trim())
    .filter(Boolean)
    .slice(0, 4);
}

/**
 * Returns formatted semicolon-delimited keywords string for a card.
 * e.g. "Holding back; Indecision; Recklessness; Bad choices; Risk-taking"
 */
export function formatCardKeywords(card: TarotCard, orientation: Orientation = 'upright'): string {
  return getCardKeywords(card, orientation).join('; ');
}
