import { Prompt, Folder, ArtistStyle } from './types';
import { PROMPT_TYPES, IMAGE_PROMPT_TYPE, ARTIST_STYLE_PROMPT_TYPE } from './constants';

const FOLDERS = [
  'Тексты',
  'Изображения',
  'Код',
  'Аналитика',
  'Креатив',
  'Обучение',
  'Автоматизация'
];

const folderData = FOLDERS.map(name => ({
  id: `folder-${name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`,
  name: name,
  createdAt: new Date().toISOString()
}));

export const sampleFolders: Folder[] = folderData;

const artistStyleContent: ArtistStyle = {
  era: "2020s",
  genre: "alt-R&B, trap, synthwave",
  style: "cinematic and expansive, drenched in synth-heavy atmospheres, blending futuristic trap grit with retro-futurist textures, slow builds and dramatic drops",
  vocals: "male, Canadian-American,  reverb-soaked falsettos and layered harmonies floating in space, contrasted with  pitched, erratic ad-libs breaking through the haze",
  mood: "grandiose, nocturnal, otherworldly, tense yet euphoric, suspended between romance and chaos",
  instrumentation: "analog synth walls, cosmic pads, distorted basslines, gliding arpeggios, sharp hi-hats, booming 808s, subtle guitar feedback woven into the atmosphere",
  mastering: "masterpiece, widescreen stereo depth, powerful low end, shimmering highs, immersive and dynamic mix, 24 bit resolution, 192 khz sample rate, signature MIKE DEAN space-opera polish"
};


export const samplePrompts: Prompt[] = [
  {
    id: crypto.randomUUID(),
    title: 'Создать рекламные слоганы',
    content: 'Создайте 5 запоминающихся слоганов для нового бренда экологичных кроссовок под названием «[НазваниеБренда]». Целевая аудитория — [ЦелеваяАудитория].',
    folderId: 'folder-креатив',
    promptType: PROMPT_TYPES[0], // Генерация
    model: 'ChatGPT',
    color: '#3b82f6', // blue
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Шаблон React компонента',
    content: 'Создайте функциональный компонент React на TypeScript с именем «[ИмяКомпонента]» и пропсами «[СписокПропсов]». Включите базовую стилизацию с помощью Tailwind CSS.',
    folderId: 'folder-код',
    promptType: PROMPT_TYPES[3], // Задачи
    model: 'Gemini',
    color: '#8b5cf6', // violet
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Научно-фантастический городской пейзаж',
    content: 'Гиперреалистичный, раскинувшийся футуристический городской пейзаж ночью, неоновые вывески отражаются на мокрых улицах, летающие автомобили, кинематографическое освещение, 8k, фотореалистично.',
    negativePrompt: 'мультяшный, размытый, уродливые автомобили',
    parameters: '--ar 16:9 --style raw --v 6',
    imageUrl: 'https://cdn.midjourney.com/1c83b063-f22a-4493-b184-27f95d315264/0_0.png',
    folderId: 'folder-изображения',
    promptType: IMAGE_PROMPT_TYPE,
    model: 'Midjourney',
    color: '#ec4899', // pink
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'JSON из неструктурированного текста',
    content: 'Извлеките имя, адрес электронной почты и компанию из следующего текста и отформатируйте его как объект JSON: [ФрагментТекста]',
    folderId: 'folder-аналитика',
    promptType: PROMPT_TYPES[2], // Анализ и структурирование
    model: 'Claude',
    color: '#f97316', // orange
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Анализ тональности',
    content: 'Проанализируйте тональность следующего отзыва клиента. Классифицируйте его как положительный, отрицательный или нейтральный и дайте краткое обоснование. Отзыв: [ОтзывКлиента]',
    folderId: 'folder-аналитика',
    promptType: PROMPT_TYPES[2], // Анализ и структурирование
    model: 'Grok',
    color: '#22c55e', // green
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Краткое изложение технической статьи',
    content: 'Сделайте краткое изложение следующей статьи в виде трех ключевых пунктов для нетехнической аудитории. Ссылка на статью: [URL]',
    folderId: null, // Uncategorized
    promptType: PROMPT_TYPES[2], // Анализ и структурирование
    model: 'Claude',
    color: '#eab308', // yellow
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Создать Shell-скрипт',
    content: 'Напишите bash-скрипт, который находит все `.log` файлы в каталоге старше [КоличествоДней] дней и сжимает их в один архив `.tar.gz`.',
    folderId: 'folder-код',
    promptType: PROMPT_TYPES[3], // Инструкции
    model: 'Grok',
    color: '#14b8a6', // teal
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Сгенерировать идеи для историй',
    content: 'Предложите три уникальные идеи для короткометражного фильма. Каждая идея должна включать жанр «[Жанр]», главного героя с «[ЧертаХарактера]» и неожиданный сюжетный поворот, включающий «[ЭлементПоворота]».',
    folderId: 'folder-креатив',
    promptType: PROMPT_TYPES[4], // Задачи
    model: 'ChatGPT',
    color: '#d946ef', // fuchsia
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Artist Sound & Production Profile',
    content: `const [Artist]Sound_[Producer] = {
  era: "[era]",
  genre: "[genre]",
  style: "[style]",
  vocals: "[vocals]",
  mood: "[mood]",
  instrumentation: "[instrumentation]",
  mastering: "[mastering]"
};`,
    folderId: 'folder-креатив',
    promptType: PROMPT_TYPES[4], // Задачи
    model: 'Gemini',
    color: '#ef4444', // red
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Artist Lyrical & Artistic Profile',
    content: `const [Artist]LyricalProfile = {
  typicalThemesAndEmotionalPalette: "[typicalThemesAndEmotionalPalette]",
  wordChoiceImageryMotifs: "[wordChoiceImageryMotifs]",
  flowRhymeHabitsRhythmicQuirks: "[flowRhymeHabitsRhythmicQuirks]",
  personaVocalStyleArtistSignatures: "[personaVocalStyleArtistSignatures]"
};`,
    folderId: 'folder-креатив',
    promptType: PROMPT_TYPES[4], // Задачи
    model: 'ChatGPT',
    color: '#84cc16', // lime
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'The Weeknd/Playboi Carti Sound (Mike Dean Producer)',
    content: JSON.stringify(artistStyleContent),
    folderId: 'folder-креатив',
    promptType: ARTIST_STYLE_PROMPT_TYPE,
    model: 'MusicGen',
    color: '#06b6d4', // cyan
    createdAt: new Date().toISOString(),
  },
];