// Imports via the "@/" alias deliberately, to exercise the moduleNameMapper
// fix in jest.config.js — this file lives at src/lib/horizon.ts, and "@/lib/*"
// specifically hits the "(hooks|lib)" bucket of that mapping.
import { isAuthorizedAdminSigner, fetchAdminAccountInfo } from '@/lib/horizon';
import { CONTRACT_CONFIG } from '@/config/stellarConfig';

describe('isAuthorizedAdminSigner', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function mockHorizonResponse(body: unknown, ok = true) {
    global.fetch = jest.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(body),
    }) as unknown as typeof fetch;
  }

  it('is true for the sole admin key before any multisig cutover', async () => {
    mockHorizonResponse({
      signers: [{ key: CONTRACT_CONFIG.adminAddress, weight: 1, type: 'ed25519_public_key' }],
      thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
    });

    await expect(isAuthorizedAdminSigner(CONTRACT_CONFIG.adminAddress)).resolves.toBe(true);
  });

  it('is true for a co-signer once the account is a multisig', async () => {
    const coSigner = 'GBRHOO3W5MUE2S5XBRMQV5DL3Y3F5KU2XSBVMUKVXPJ2EGJFKCFVVPPM';
    mockHorizonResponse({
      signers: [
        { key: CONTRACT_CONFIG.adminAddress, weight: 1, type: 'ed25519_public_key' },
        { key: coSigner, weight: 1, type: 'ed25519_public_key' },
      ],
      thresholds: { low_threshold: 2, med_threshold: 2, high_threshold: 2 },
    });

    await expect(isAuthorizedAdminSigner(coSigner)).resolves.toBe(true);
  });

  it('is false for a wallet that is not a registered signer', async () => {
    mockHorizonResponse({
      signers: [{ key: CONTRACT_CONFIG.adminAddress, weight: 1, type: 'ed25519_public_key' }],
      thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
    });

    await expect(
      isAuthorizedAdminSigner('GATTACKERXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
    ).resolves.toBe(false);
  });

  it('is false for a signer whose weight has been zeroed out (removed)', async () => {
    const removedSigner = 'GBRHOO3W5MUE2S5XBRMQV5DL3Y3F5KU2XSBVMUKVXPJ2EGJFKCFVVPPM';
    mockHorizonResponse({
      signers: [
        { key: CONTRACT_CONFIG.adminAddress, weight: 1, type: 'ed25519_public_key' },
        { key: removedSigner, weight: 0, type: 'ed25519_public_key' },
      ],
      thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
    });

    await expect(isAuthorizedAdminSigner(removedSigner)).resolves.toBe(false);
  });

  it('falls back to sole-admin-address equality if Horizon is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    await expect(isAuthorizedAdminSigner(CONTRACT_CONFIG.adminAddress)).resolves.toBe(true);
    await expect(isAuthorizedAdminSigner('GSOMEOTHERADDRESS')).resolves.toBe(false);
  });

  it('falls back to sole-admin-address equality on a non-OK Horizon response', async () => {
    mockHorizonResponse({}, false);

    await expect(isAuthorizedAdminSigner(CONTRACT_CONFIG.adminAddress)).resolves.toBe(true);
  });
});

describe('fetchAdminAccountInfo', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('queries the admin address at the configured Horizon URL', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          signers: [],
          thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
        }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetchAdminAccountInfo();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/accounts/${CONTRACT_CONFIG.adminAddress}`)
    );
  });

  it('returns null when the response is missing signers/thresholds', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }) as unknown as typeof fetch;

    await expect(fetchAdminAccountInfo()).resolves.toBeNull();
  });
});
