import type Player from '@vimeo/player';

export type VimeoPlayer = Player;

export type VimeoVideoStatus = 'available' | 'transcoding' | 'uploading' | 'error';
export type VimeoPrivacyView = 'anybody' | 'nobody' | 'password' | 'disable' | 'contacts' | 'unlisted';
export type VimeoPrivacyEmbed = 'public' | 'private';
export type VimeoPrivacyComments = 'anybody' | 'nobody' | 'all';
export type VimeoTranscodeStatus = 'complete' | 'in_progress' | 'error';

export interface VimeoPrivacy {
  view: VimeoPrivacyView;
  embed: VimeoPrivacyEmbed;
  comments: VimeoPrivacyComments;
  download: boolean;
  add?: boolean;
}

export interface VimeoPicture {
  uri: string;
  active: boolean;
  type: string;
  base_link: string;
  resource_key?: string;
  default_picture?: boolean;
  sizes: Array<{
    width: number;
    height: number;
    link: string;
    link_with_play_button?: string;
  }>;
}

export interface VimeoFile {
  quality: string;
  rendition?: string;
  type: string;
  width: number;
  height: number;
  link: string;
  size?: number;
  fps?: number;
}

export interface VimeoCategory {
  uri: string;
  name: string;
  subcategories?: Array<{
    name: string;
  }>;
}

export interface VimeoTag {
  uri: string;
  name: string;
  tag: string;
}

export interface VimeoStats {
  plays: number;
  finishes?: number;
  loads?: number;
  likes: number;
  comments: number;
  downloads?: number;
}

export interface VimeoMetadataConnections {
  likes?: {
    total: number;
  };
  videos?: {
    uri: string;
    total: number;
  };
}

export interface VimeoMetadata {
  connections: VimeoMetadataConnections;
  total?: number;
  page?: number;
  per_page?: number;
  has_more?: boolean;
}

export interface VimeoVideo {
  uri: string;
  name: string;
  description: string | null;
  type: string;
  link: string;
  player_embed_url: string;
  duration: number;
  width: number;
  height: number;
  size: number;
  fps?: number;
  quality?: string;
  error_message?: string;
  pictures: VimeoPicture;
  status: VimeoVideoStatus;
  created_time: string;
  modified_time: string;
  release_time: string;
  privacy: VimeoPrivacy;
  categories?: VimeoCategory[];
  tags: VimeoTag[];
  stats?: VimeoStats;
  metadata?: VimeoMetadata;
  base_link?: string;
}

export interface VimeoChapter {
  uri: string;
  active: boolean;
  type: string;
  timecode: number;
  title: string;
}

export interface VimeoProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface VimeoThumbnail {
  uri: string;
  active: boolean;
  type: string;
  base_link: string;
  sizes: {
    width: number;
    height: number;
    link: string;
    link_with_play_button: string;
  }[];
}

export interface VimeoError extends Error {
  name: 'VimeoError';
  code: string;
  message: string;
  developer_message: string;
  error_code: number | string;
  status?: number;
  link?: string | null;
}

export interface VimeoFolder {
  uri: string;
  name: string;
  created_time: string;
  modified_time: string;
  user: {
    uri: string;
    name: string;
  };
  metadata: VimeoMetadata;
}

export interface VimeoUploadOptions {
  name: string;
  description?: string;
  privacy?: VimeoPrivacy;
  folder_uri?: string;
}

export type VideoQuality = 'auto' | '4K' | '2K' | '1080p' | '720p' | '540p' | '480p' | '360p' | '240p'

export interface VimeoQualityChangeEvent {
  quality: VideoQuality;
  previousQuality: VideoQuality | null;
}

export interface VimeoUploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  progress: number;
}

export interface VimeoUploadResponse {
  upload: {
    upload_link: string;
    approach: string;
    size: number;
    redirect_url?: string;
  };
  uri: string;
  ticket_id: string;
}

export interface VimeoService {
  uploadVideo(file: File, metadata: VimeoUploadOptions): Promise<VimeoVideo>;
  createFolder(name: string): Promise<VimeoFolder>;
  updateVideoMetadata(videoId: string, metadata: Partial<VimeoUploadOptions>): Promise<VimeoVideo>;
  updateVideoPrivacy(videoId: string, privacy: VimeoPrivacy): Promise<VimeoVideo>;
  getVideoDetails(videoId: string): Promise<VimeoVideo>;
  uploadThumbnail(videoId: string, file: File): Promise<VimeoVideo>;
  generateThumbnail(videoId: string, time: number): Promise<VimeoVideo>;
  getVideos(options?: { page?: number; per_page?: number }): Promise<VimeoVideo[]>;
  deleteVideo(videoId: string): Promise<void>;
  updateVideo(videoId: string, updates: Partial<VimeoVideo>): Promise<VimeoVideo>;
  createShowcase(name: string, description?: string): Promise<VimeoFolder>;
  addToShowcase(showcaseId: string, videoId: string): Promise<void>;
  getVideosByFolder(folderId: string): Promise<VimeoVideo[]>;
  getAllVideos(): Promise<VimeoVideo[]>;
  getFolders(): Promise<VimeoFolder[]>;
  getVideo(videoId: string): Promise<VimeoVideo>;
}

export interface VimeoPlayerOptions {
  id: number | string;
  url?: string;
  width?: number;
  height?: number;
  autopause?: boolean;
  autoplay?: boolean;
  background?: boolean;
  byline?: boolean;
  color?: string;
  controls?: boolean;
  dnt?: boolean;
  keyboard?: boolean;
  loop?: boolean;
  muted?: boolean;
  pip?: boolean;
  playsinline?: boolean;
  portrait?: boolean;
  quality?: VideoQuality;
  responsive?: boolean;
  speed?: boolean;
  texttrack?: string;
  title?: boolean;
  transparent?: boolean;
}

export interface VimeoTimeUpdateEvent {
  seconds: number
  percent: number
  duration: number
}

export interface VimeoProgressEvent {
  seconds: number
  percent: number
}
