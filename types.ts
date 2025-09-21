export interface Prompt {
  id: string;
  title: string;
  content: string; // For image prompts, this is the main positive prompt
  negativePrompt?: string;
  parameters?: string;
  imageUrl?: string;
  folderId: string | null;
  promptType: string;
  model: string;
  color: string;
  createdAt: string;
}

export interface Folder {
  id:string;
  name: string;
  createdAt: string;
}

export interface ArtistStyle {
  era: string;
  genre: string;
  style: string;
  vocals: string;
  mood: string;
  instrumentation: string;
  mastering: string;
}

export interface LastUsedSettings {
  promptType: string;
  folderId: string | null;
  model: string;
}
