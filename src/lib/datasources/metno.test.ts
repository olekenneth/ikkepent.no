import { describe, it, expect } from 'vitest';
import { cleanTitle } from './metno';

describe('cleanTitle', () => {
  it('strips ISO 8601 timestamps from title', () => {
    expect(cleanTitle('Kuling, gult nivå, Lindesnes - Åna-Sira, 2026-04-03T14:00:00+00:00, 2026-04-04T09:00:00+00:00')).toBe('Kuling, gult nivå, Lindesnes - Åna-Sira');
  });

  it('strips UTC date-range suffix from title', () => {
    expect(cleanTitle('Kuling, Fisker, 04 april 22:00 UTC til 04 april 22:00 UTC.')).toBe('Kuling, Fisker');
  });

  it('strips ISO 8601 timestamps (Svinøy - Frøya)', () => {
    expect(cleanTitle('Kuling, gult nivå, Svinøy - Frøya, 2026-04-04T06:00:00+00:00, 2026-04-04T20:00:00+00:00')).toBe('Kuling, gult nivå, Svinøy - Frøya');
  });

  it('strips ISO 8601 timestamps (Østlandet)', () => {
    expect(cleanTitle('Kraftige vindkast, gult nivå, Deler av Østlandet, 2026-04-05T06:00:00+00:00, 2026-04-05T21:00:00+00:00')).toBe('Kraftige vindkast, gult nivå, Deler av Østlandet');
  });

  it('strips UTC date-range suffix with different times', () => {
    expect(cleanTitle('Kuling, C4, 03 april 23:00 UTC til 04 april 19:00 UTC.')).toBe('Kuling, C4');
  });

  it('leaves titles without timestamps unchanged', () => {
    expect(cleanTitle('Kuling, gult nivå, Lindesnes - Åna-Sira')).toBe('Kuling, gult nivå, Lindesnes - Åna-Sira');
  });

  it('strips ISO 8601 timestamps (Rogaland og Agder)', () => {
    expect(cleanTitle('Ekstremt kraftige vindkast, rødt nivå, Deler av Rogaland og Agder, 2026-04-05T11:00:00+00:00, 2026-04-05T15:00:00+00:00')).toBe('Ekstremt kraftige vindkast, rødt nivå, Deler av Rogaland og Agder');
  });
});
