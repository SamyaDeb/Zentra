import {
  xlmToStroops,
  stroopsToXlm,
  formatXlm,
  getLoanTier,
  ledgersToTime,
  LOAN_TIERS,
} from './stellarConfig';

describe('xlmToStroops / stroopsToXlm', () => {
  it('converts XLM to stroops using the 7-decimal factor', () => {
    expect(xlmToStroops(1)).toBe(BigInt(10_000_000));
    expect(xlmToStroops(0.5)).toBe(BigInt(5_000_000));
  });

  it('rounds fractional stroops rather than truncating', () => {
    // 1.23456785 XLM * 1e7 = 12345678.5 stroops -> rounds to 12345679
    expect(xlmToStroops(1.23456785)).toBe(BigInt(12_345_679));
  });

  it('round-trips through stroopsToXlm', () => {
    expect(stroopsToXlm(xlmToStroops(42))).toBe(42);
  });
});

describe('formatXlm', () => {
  it('formats stroops as a locale XLM string with the given decimals', () => {
    expect(formatXlm(BigInt(10_000_000))).toBe('1.00');
    expect(formatXlm(BigInt(1_234_567_800), 2)).toBe('123.46');
    expect(formatXlm(BigInt(1_000_000_000), 0)).toBe('100');
  });
});

describe('getLoanTier', () => {
  it('returns the lowest tier for scores below 60', () => {
    expect(getLoanTier(0)).toBe(LOAN_TIERS[0]);
    expect(getLoanTier(59)).toBe(LOAN_TIERS[0]);
  });

  it('returns the highest tier for scores of 90 and above', () => {
    expect(getLoanTier(90)).toBe(LOAN_TIERS[4]);
    expect(getLoanTier(100)).toBe(LOAN_TIERS[4]);
  });

  it('picks the correct tier at each boundary', () => {
    expect(getLoanTier(60).maxLoan).toBe(200);
    expect(getLoanTier(69).maxLoan).toBe(200);
    expect(getLoanTier(70).maxLoan).toBe(500);
    expect(getLoanTier(80).maxLoan).toBe(1000);
  });

  it('falls back to the lowest tier for an out-of-range score', () => {
    // Guards against a future off-by-one in LOAN_TIERS leaving a score
    // unmatched — getLoanTier must never return undefined.
    expect(getLoanTier(-1)).toBe(LOAN_TIERS[0]);
    expect(getLoanTier(101)).toBe(LOAN_TIERS[0]);
  });
});

describe('ledgersToTime', () => {
  it('renders sub-minute durations in seconds', () => {
    expect(ledgersToTime(1)).toBe('5 seconds');
  });

  it('renders sub-hour durations in minutes', () => {
    expect(ledgersToTime(120)).toBe('10 minutes'); // demo loan duration
  });

  it('renders sub-day durations in hours', () => {
    expect(ledgersToTime(720)).toBe('1 hours');
  });

  it('renders multi-day durations in days', () => {
    expect(ledgersToTime(17_280)).toBe('1 days'); // 1 day, matches LEDGERS_PER_DAY
    expect(ledgersToTime(120_960)).toBe('7 days'); // legacy 7-day constant
  });
});
