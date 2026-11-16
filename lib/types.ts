export interface Genre { name: string; slug: string }

export interface Item {
  slug: string;
  title: string;
  poster: string;
  href: string;
  episode?: string;
  episodeSlug?: string;
  status?: string;
  type?: string;
  rating?: string;
  year?: string;
  time?: string;
  synopsis?: string;
  genres: Genre[];
}

export interface PageInfo { current: number; total?: number; hasNext?: boolean }
export interface ListResult { items: Item[]; page: PageInfo }

export interface EpisodeRef { slug: string; title: string; number?: number; date?: string }

export interface Detail {
  title: string;
  altTitle: string;
  synopsis: string;
  poster: string;
  genres: Genre[];
  status: string;
  type: string;
  year: string;
  studio: string;
  rating: string;
  duration: string;
  episodes: EpisodeRef[];
  recommendations: Item[];
}

export interface Stream { name: string; url: string }
export interface DownloadLink { name: string; url: string }
export interface DownloadGroup { quality: string; links: DownloadLink[] }

export interface EpisodePage {
  title: string;
  seriesTitle: string;
  seriesSlug: string;
  poster: string;
  streams: Stream[];
  downloads: DownloadGroup[];
  prev?: string;
  next?: string;
  episodes: EpisodeRef[];
  info: Record<string, string>;
}

export interface HomeData { hero: Item | null; latest: Item[]; ongoing: Item[]; completed: Item[] }
export interface ScheduleDay { index: number; label: string; items: Item[] }

export interface HistoryEntry {
  slug: string;
  title: string;
  poster: string;
  episodeSlug: string;
  episodeTitle: string;
  timestamp: number;
}
