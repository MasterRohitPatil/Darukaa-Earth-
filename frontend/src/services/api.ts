import type { EnvironmentalState } from '../types';

const API_BASE = '/api';

export const api = {
  async healthCheck() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async setGeminiKey(apiKey: string) {
    const res = await fetch(`${API_BASE}/settings/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gemini_api_key: apiKey })
    });
    if (!res.ok) throw new Error(`Set Key error: ${res.statusText}`);
    return res.json();
  },

  async sendMessage(message: string, sessionId?: string, structuredData?: Partial<EnvironmentalState>) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        structured_data: structuredData
      })
    });
    if (!res.ok) throw new Error(`Chat API error: ${res.statusText}`);
    return res.json();
  },

  async getState(sessionId: string) {
    const res = await fetch(`${API_BASE}/state/${sessionId}`);
    if (!res.ok) throw new Error(`Get State error: ${res.statusText}`);
    return res.json();
  },

  async enrichCoordinates(latitude: number, longitude: number) {
    const res = await fetch(`${API_BASE}/geo/enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude })
    });
    if (!res.ok) throw new Error(`Geo API error: ${res.statusText}`);
    return res.json();
  },

  async runScenario(state: EnvironmentalState, scenarioType: string) {
    const res = await fetch(`${API_BASE}/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, scenario_type: scenarioType })
    });
    if (!res.ok) throw new Error(`Scenario error: ${res.statusText}`);
    return res.json();
  },

  async getEvidence(query?: string) {
    const url = query ? `${API_BASE}/evidence?query=${encodeURIComponent(query)}` : `${API_BASE}/evidence`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Evidence API error: ${res.statusText}`);
    return res.json();
  }
};
