/**
 * Lightweight & Privacy-First Analytics for EQUILIBRA
 * Zero third-party trackers, zero invasive cookies, fully compliant with privacy laws (GDPR/ARCO).
 * Tracks high-level conversions: Page views, CTA clicks, WhatsApp launches, and Bookings.
 */

export interface AnalyticsEvent {
  name: string;
  category?: 'cta' | 'navigation' | 'booking' | 'contact' | 'modal' | 'engagement';
  label?: string;
  value?: number;
  timestamp: string;
}

const ANALYTICS_STORAGE_KEY = 'equilibra_analytics_events';
const CONSENT_STORAGE_KEY = 'equilibra_cookies_consent';

export function isAnalyticsAllowed(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return true; // Default privacy-friendly first-party metrics enabled
    const parsed = JSON.parse(raw);
    return parsed.analytics !== false;
  } catch {
    return true;
  }
}

export function trackEvent(name: string, category: AnalyticsEvent['category'] = 'engagement', label?: string, value?: number): void {
  if (!isAnalyticsAllowed()) {
    return;
  }

  const event: AnalyticsEvent = {
    name,
    category,
    label,
    value,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing: AnalyticsEvent[] = JSON.parse(localStorage.getItem(ANALYTICS_STORAGE_KEY) || '[]');
    // Keep last 150 events locally
    const updated = [event, ...existing].slice(0, 150);
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.debug('[Analytics] Event tracking error:', err);
  }

  // Dispatch custom window event for reactive UI/components
  window.dispatchEvent(new CustomEvent('equilibra_analytics_event', { detail: event }));
}

export function trackPageView(pageName: string = 'home'): void {
  trackEvent('page_view', 'navigation', pageName);
}

export function trackCtaClick(ctaName: string, location: string): void {
  trackEvent('cta_click', 'cta', `${ctaName} [${location}]`);
}

export function trackWhatsAppClick(source: string = 'floating_button'): void {
  trackEvent('whatsapp_click', 'contact', source);
}

export function trackBookingStart(serviceId?: string): void {
  trackEvent('booking_started', 'booking', serviceId || 'general');
}

export function trackBookingSuccess(serviceId?: string, code?: string): void {
  trackEvent('booking_confirmed', 'booking', `${serviceId || 'servicio'}:${code || 'success'}`);
}

export function getAnalyticsSummary(): {
  totalPageViews: number;
  totalCtaClicks: number;
  totalWhatsAppClicks: number;
  totalBookings: number;
  recentEvents: AnalyticsEvent[];
} {
  try {
    const events: AnalyticsEvent[] = JSON.parse(localStorage.getItem(ANALYTICS_STORAGE_KEY) || '[]');
    return {
      totalPageViews: events.filter(e => e.name === 'page_view').length,
      totalCtaClicks: events.filter(e => e.name === 'cta_click').length,
      totalWhatsAppClicks: events.filter(e => e.name === 'whatsapp_click').length,
      totalBookings: events.filter(e => e.name === 'booking_confirmed').length,
      recentEvents: events.slice(0, 20),
    };
  } catch {
    return {
      totalPageViews: 0,
      totalCtaClicks: 0,
      totalWhatsAppClicks: 0,
      totalBookings: 0,
      recentEvents: [],
    };
  }
}
