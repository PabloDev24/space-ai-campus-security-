import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session-store';

function token(payload: object): string {
  const encoded = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${encoded}.signature`;
}

describe('SessionStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  it('accepts a current Caseta JWT', () => {
    const store = TestBed.inject(SessionStore);
    store.setToken(token({ exp: Math.floor(Date.now() / 1000) + 60, role: 'Caseta' }));
    expect(store.isValid()).toBe(true);
    expect(store.role()).toBe('Caseta');
  });

  it('rejects an expired JWT', () => {
    const store = TestBed.inject(SessionStore);
    store.setToken(token({ exp: Math.floor(Date.now() / 1000) - 1, role: 'Caseta' }));
    expect(store.isValid()).toBe(false);
  });

  it('clears persisted session data', () => {
    const store = TestBed.inject(SessionStore);
    store.setToken(token({ exp: Math.floor(Date.now() / 1000) + 60, role: 'Caseta' }));
    store.clear();
    expect(store.token()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});
