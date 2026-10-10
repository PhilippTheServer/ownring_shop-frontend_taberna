import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppDemoComponent } from './app-demo.component';
import { stubStorage } from '../test-fixtures';

describe('AppDemoComponent', () => {
  beforeEach(() => {
    stubStorage();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Renders the demo and follows the same button clicks as a visitor. */
  function render() {
    const fixture = TestBed.createComponent(AppDemoComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const button = (id: string) => el.querySelector<HTMLButtonElement>(`[data-testid="${id}"]`)!;
    const click = (id: string) => { button(id).click(); fixture.detectChanges(); };
    const text = (id: string) => el.querySelector(`[data-testid="${id}"]`)!.textContent!.trim();
    return { fixture, el, button, click, text };
  }

  it('labels the data as invented and opens Today with five metrics and the heart-rate chart', () => {
    const { el, button } = render();
    expect(el.textContent).toContain('Simulation mit erfundenen Beispieldaten');
    expect(el.querySelectorAll('[data-testid^="demo-metric-"]')).toHaveLength(5);
    expect(button('demo-tab-today').getAttribute('aria-pressed')).toBe('true');
    expect(button('demo-metric-hr').getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('#demo-chart-hr')).not.toBeNull();
  });

  it('expands one metric at a time and can collapse it again', () => {
    const { el, button, click } = render();
    for (const id of ['hrv', 'stress', 'spo2', 'steps']) {
      click(`demo-metric-${id}`);
      expect(el.querySelectorAll('[id^="demo-chart-"]')).toHaveLength(1);
      expect(el.querySelector(`#demo-chart-${id}`)).not.toBeNull();
      expect(button('demo-metric-hr').getAttribute('aria-expanded')).toBe('false');
    }
    expect(el.querySelector('#demo-chart-steps rect')).not.toBeNull();
    click('demo-metric-steps');
    expect(el.querySelectorAll('[id^="demo-chart-"]')).toHaveLength(0);
  });

  it('changes all four periods, charts and summaries; steps show day total or daily average', () => {
    const { el, button, click, text } = render();
    expect(text('demo-value-hr')).toBe('94');
    expect(text('demo-value-steps').replace(/\D/g, '')).toBe('6220');
    let previous = el.querySelector('#demo-chart-hr polyline')!.getAttribute('points');
    for (const [range, period] of [['week', '5.–11. Oktober'], ['month', 'Oktober 2026'], ['year', '2026']]) {
      click(`demo-range-${range}`);
      expect(button(`demo-range-${range}`).getAttribute('aria-pressed')).toBe('true');
      expect(text('demo-period')).toBe(period);
      const points = el.querySelector('#demo-chart-hr polyline')!.getAttribute('points');
      expect(points).not.toBe(previous);
      expect(points).not.toMatch(/NaN|Infinity/);
      previous = points;
      if (range === 'week') expect(text('demo-value-steps').replace(/\D/g, '')).toBe('6903');
    }
    click('demo-range-day');
    expect(text('demo-value-hr')).toBe('94');
  });

  it('starts and stops sample live pulse, and disconnecting stops it and disables live/sync', () => {
    const { button, click, text } = render();
    click('demo-live');
    expect(text('demo-live-value')).toBe('72');
    expect(button('demo-live').getAttribute('aria-pressed')).toBe('true');
    click('demo-live');
    expect(text('demo-live-value')).toBe('—');
    click('demo-live');
    click('demo-tab-devices');
    click('demo-connect');
    expect(text('demo-connection')).toBe('Nicht verbunden');
    expect(button('demo-sync').disabled).toBe(true);
    click('demo-tab-today');
    expect(text('demo-live-value')).toBe('—');
    expect(button('demo-live').disabled).toBe(true);
    click('demo-status');
    click('demo-connect');
    expect(text('demo-connection')).toBe('Verbunden');
    click('demo-tab-today');
    expect(button('demo-live').disabled).toBe(false);
  });

  it('simulates sync and preserves the chosen period and metric across screens', () => {
    const { el, button, click } = render();
    click('demo-range-month');
    click('demo-metric-spo2');
    click('demo-status');
    click('demo-sync');
    expect(el.textContent).toContain('gerade eben');
    click('demo-tab-today');
    expect(button('demo-range-month').getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('#demo-chart-spo2')).not.toBeNull();
    expect(button('demo-status').textContent).toContain('Gerade abgeglichen');
  });

  it('updates live pulse and its curve every 3.5 seconds, stops, and restarts from the first sample', () => {
    vi.useFakeTimers();
    const { fixture, el, click, text } = render();
    click('demo-live');
    expect(text('demo-live-value')).toBe('72');
    const curve = () => el.querySelector('[data-testid="demo-live-chart"] polyline')!.getAttribute('points');
    const first = curve();
    vi.advanceTimersByTime(3499);
    fixture.detectChanges();
    expect(text('demo-live-value')).toBe('72');
    vi.advanceTimersByTime(1);
    fixture.detectChanges();
    expect(text('demo-live-value')).toBe('74');
    expect(curve()).not.toBe(first);
    vi.advanceTimersByTime(3500);
    fixture.detectChanges();
    expect(text('demo-live-value')).toBe('71');
    click('demo-live');
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(7000);
    fixture.detectChanges();
    expect(text('demo-live-value')).toBe('—');
    click('demo-live');
    expect(text('demo-live-value')).toBe('72');
    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cleans up live updates on disconnect and keeps them stopped after reconnect', () => {
    vi.useFakeTimers();
    const { fixture, click, text } = render();
    click('demo-live');
    click('demo-tab-devices');
    vi.advanceTimersByTime(3500);
    fixture.detectChanges();
    click('demo-tab-today');
    expect(text('demo-live-value')).toBe('74');
    click('demo-tab-devices');
    click('demo-connect');
    expect(vi.getTimerCount()).toBe(0);
    click('demo-connect');
    vi.advanceTimersByTime(7000);
    fixture.detectChanges();
    click('demo-tab-today');
    expect(text('demo-live-value')).toBe('—');
    fixture.destroy();
  });

  it('follows the shop language without exposing raw translation keys or requesting data', () => {
    const { el, click } = render();
    click('demo-tab-devices');
    click('demo-lang-en');
    expect(el.textContent).toContain('Connected');
    expect(el.textContent).toContain('Simulation with invented sample data');
    click('demo-tab-today');
    expect(el.textContent).toContain('Heart rate');
    expect(el.textContent).not.toMatch(/demo\.|showcase\.|measure\./);
    click('demo-tab-devices');
    click('demo-lang-de');
    expect(el.textContent).toContain('Verbunden');
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
});
