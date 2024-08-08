import {
  themeFactory,
  hex2rgb,
  ThemeColor,
  ThemeFont,
  ThemeScrollbar,
  ThemeShadow,
  ThemeSize,
  ThemeBorder,
  ThemeIcon,
  ThemeGlobal
} from '@milkdown/core';
import { useAllPresetRenderer } from '@milkdown/theme-pack-helper';
import { color } from './color';
import { getStyle } from './style';
import { getIcon } from './icon';

export const nes = themeFactory((emotion, manager) => {
  const { css } = emotion;
  manager.set(ThemeColor, (options) => {
    if (!options) return;
    const [key, opacity] = options;
    const hex = color[key];
    const rgb = hex2rgb(hex);
    if (!rgb) return;

    return `rgba(${rgb?.join(', ')}, ${opacity || 1})`;
  });

  manager.set(ThemeSize, (key) => {
    const size = {
      radius: '2px',
      lineWidth: '4px'
    };
    if (!key) return;
    return size[key];
  });

  manager.set(ThemeFont, (key) => {
    const font =
      'Press Start 2P, cursive, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif';

    const fontCode =
      'Press Start 2P, cursive, Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace';

    const f = {
      typography: font,
      code: fontCode
    };
    if (!key) return;
    return f[key];
  });

  manager.set(
    ThemeScrollbar,
    ([direction = 'y', type = 'normal'] = ['y', 'normal'] as never) => {
      const main = manager.get(ThemeColor, ['secondary', 0.38]);
      const bg = manager.get(ThemeColor, ['secondary', 0.12]);
      const hover = manager.get(ThemeColor, ['secondary']);
      return css`
        scrollbar-width: thin;
        scrollbar-color: ${main} ${bg};
        -webkit-overflow-scrolling: touch;
        &::-webkit-scrollbar {
          ${direction === 'y' ? 'width' : 'height'}: ${type === 'thin'
            ? 2
            : 12}px;
          background-color: transparent;
        }
        &::-webkit-scrollbar-track {
          border-radius: 999px;
          background: transparent;
          border: 4px solid transparent;
        }
        &::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background-color: ${main};
          border: ${type === 'thin' ? 0 : 4}px solid transparent;
          background-clip: content-box;
        }
        &::-webkit-scrollbar-thumb:hover {
          background-color: ${hover};
        }
      `;
    }
  );

  manager.set(ThemeShadow, () => {
    const lineWidth = manager.get(ThemeSize, 'lineWidth');
    const getShadow = (opacity: number) =>
      manager.get(ThemeColor, ['shadow', opacity]);
    return css`
      box-shadow: 0 ${lineWidth} ${lineWidth} ${getShadow(0.14)},
        0 2px ${lineWidth} ${getShadow(0.12)},
        0 ${lineWidth} 3px ${getShadow(0.2)};
    `;
  });

  manager.set(ThemeBorder, (direction) => {
    const lineWidth = manager.get(ThemeSize, 'lineWidth');
    const line = manager.get(ThemeColor, ['line']);
    const shadow = manager.get(ThemeColor, ['shadow']);
    if (!direction) {
      return css`
        border-style: solid;
        border-width: ${lineWidth};
        border-image-slice: 3;
        border-image-width: 3;
        border-image-repeat: stretch;
        border-image-source: url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="8" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M3 1 h1 v1 h-1 z M4 1 h1 v1 h-1 z M2 2 h1 v1 h-1 z M5 2 h1 v1 h-1 z M1 3 h1 v1 h-1 z M6 3 h1 v1 h-1 z M1 4 h1 v1 h-1 z M6 4 h1 v1 h-1 z M2 5 h1 v1 h-1 z M5 5 h1 v1 h-1 z M3 6 h1 v1 h-1 z M4 6 h1 v1 h-1 z" fill="rgb(255, 184, 108)" /></svg>');
        border-image-outset: 1;
        box-shadow: inset -6px -6px ${shadow};
        border-color: ${line};
      `;
    }
    return css`
        border-${direction}-style: solid;
        border-width: ${lineWidth};
        border-image-slice: 3;
        border-image-width: 3;
        border-image-repeat: stretch;
        border-image-source: url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="8" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M3 1 h1 v1 h-1 z M4 1 h1 v1 h-1 z M2 2 h1 v1 h-1 z M5 2 h1 v1 h-1 z M1 3 h1 v1 h-1 z M6 3 h1 v1 h-1 z M1 4 h1 v1 h-1 z M6 4 h1 v1 h-1 z M2 5 h1 v1 h-1 z M5 5 h1 v1 h-1 z M3 6 h1 v1 h-1 z M4 6 h1 v1 h-1 z" fill="rgb(255, 184, 108)" /></svg>');
        border-image-outset: 1;
        box-shadow: inset -6px -6px ${shadow};
        border-color: ${line};
      `;
  });

  manager.set(ThemeIcon, (icon) => {
    if (!icon) return;

    return getIcon(icon);
  });

  manager.set(ThemeGlobal, () => {
    getStyle(manager, emotion);
  });

  useAllPresetRenderer(manager, emotion);
});
