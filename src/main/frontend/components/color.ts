import type { Color } from '@milkdown/core';

const Dracula = {
  background: '#282a36',
  currentLine: '#44475a',
  foreground: '#f8f8f2',
  comment: '#6272a4',
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c'
};

export const color: Record<Color, string> = {
  shadow: Dracula.comment,
  primary: Dracula.purple,
  secondary: Dracula.pink,
  neutral: Dracula.foreground,
  solid: Dracula.yellow,
  line: Dracula.orange,
  background: Dracula.background,
  surface: Dracula.currentLine
};
