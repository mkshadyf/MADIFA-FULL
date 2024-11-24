interface AdFrequencyCap {
  lastShown: number;
  count: number;
}

interface AdManagerConfig {
  maxAdsPerHour: number;
  minTimeBetweenAds: number; // in milliseconds
  maxDailyAds: number;
}

class AdManager {
  private static instance: AdManager;
  private frequencyCaps: Map<string, AdFrequencyCap>;
  private config: AdManagerConfig;

  private constructor() {
    this.frequencyCaps = new Map();
    this.config = {
      maxAdsPerHour: 3,
      minTimeBetweenAds: 5 * 60 * 1000, // 5 minutes
      maxDailyAds: 20,
    };

    // Load frequency caps from localStorage if available
    if (typeof window !== 'undefined') {
      const savedCaps = localStorage.getItem('adFrequencyCaps');
      if (savedCaps) {
        this.frequencyCaps = new Map(JSON.parse(savedCaps));
      }
    }
  }

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  private saveFrequencyCaps(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'adFrequencyCaps',
        JSON.stringify(Array.from(this.frequencyCaps.entries()))
      );
    }
  }

  private cleanOldEntries(): void {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Convert to array first to avoid iteration issues
    Array.from(this.frequencyCaps.entries()).forEach(([key, value]) => {
      if (value.lastShown < oneDayAgo) {
        this.frequencyCaps.delete(key);
      }
    });

    this.saveFrequencyCaps();
  }

  public canShowAd(adType: string): boolean {
    this.cleanOldEntries();

    const now = Date.now();
    const cap = this.frequencyCaps.get(adType);

    if (!cap) {
      return true;
    }

    // Check minimum time between ads
    if (now - cap.lastShown < this.config.minTimeBetweenAds) {
      return false;
    }

    // Check hourly limit
    const hourAgo = now - 60 * 60 * 1000;
    const hourlyCount = Array.from(this.frequencyCaps.values()).filter(
      (c) => c.lastShown > hourAgo
    ).length;
    if (hourlyCount >= this.config.maxAdsPerHour) {
      return false;
    }

    // Check daily limit
    const dailyCount = Array.from(this.frequencyCaps.values()).length;
    if (dailyCount >= this.config.maxDailyAds) {
      return false;
    }

    return true;
  }

  public recordAdShow(adType: string): void {
    const now = Date.now();
    const current = this.frequencyCaps.get(adType);

    this.frequencyCaps.set(adType, {
      lastShown: now,
      count: (current?.count || 0) + 1,
    });

    this.saveFrequencyCaps();
  }

  public getAdStats(adType: string): {
    canShow: boolean;
    timeUntilNext?: number;
    dailyRemaining: number;
  } {
    const canShow = this.canShowAd(adType);
    const cap = this.frequencyCaps.get(adType);
    const now = Date.now();

    return {
      canShow,
      timeUntilNext: cap
        ? Math.max(0, this.config.minTimeBetweenAds - (now - cap.lastShown))
        : 0,
      dailyRemaining: this.config.maxDailyAds - (cap?.count || 0),
    };
  }
}

export const adManager = AdManager.getInstance(); 