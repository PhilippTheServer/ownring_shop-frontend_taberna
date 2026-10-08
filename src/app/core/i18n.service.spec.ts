import { DE, EN } from './i18n.service';

/** A key missing in one language shows up as the raw key on the page. */
describe('I18n tables', () => {
  it('have the same keys in German and English', () => {
    expect(Object.keys(EN).sort()).toEqual(Object.keys(DE).sort());
  });

  it('have no empty texts', () => {
    expect([...Object.entries(DE), ...Object.entries(EN)].filter(([, text]) => !text.trim())).toEqual([]);
  });
});
