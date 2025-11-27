import { Box, Button, Stack, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ForumIcon from '@mui/icons-material/Forum';
import SaveIcon from '@mui/icons-material/Save';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { EditorMode, useWikiNoteStore } from '../../hooks/useWikiNoteStore';
import { useEffect, useRef, useState } from 'react';
import { ModeBtn, SaveBtn, TitleBox, TitleInput } from './WikiHeader.styles';
import { useBlocker, useNavigate, useLocation } from 'react-router';

const DEFAULT_TITLE_WIDTH = 120;
const MIN_RIGHT_PADDING = 14;
const FONT_SIZE = 16;

export default function WikiHeader(): JSX.Element {
  const { mode, setMode } = useWikiNoteStore();
  const wiki = useWikiNoteStore((s) => s.wiki);
  const updateWiki = useWikiNoteStore((s) => s.updateWiki);
  const saveWiki = useWikiNoteStore((s) => s.saveWiki);
  const isDirty = useWikiNoteStore((s) => s.isDirty);
  const isReadOnly = mode !== 'edit';
  const [focused, setFocused] = useState(false);
  const [inputWidth, setInputWidth] = useState(DEFAULT_TITLE_WIDTH);
  const [maxWidth, setMaxWidth] = useState(500);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonAreaRef = useRef<HTMLDivElement>(null);
  const blocker = useBlocker(() => mode === 'edit' && isDirty);

  useEffect(() => {
    updateMaxWidth();
    window.addEventListener('resize', updateMaxWidth);
    return () => window.removeEventListener('resize', updateMaxWidth);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get('mode');

    if (!m) {
      params.set('mode', 'read');
      navigate({ search: params.toString() }, { replace: true });
      return;
    }

    const validModes = ['read', 'edit', 'comment', 'file'];
    const valid: EditorMode = validModes.includes(m as EditorMode) ? (m as EditorMode) : 'read';

    if (valid !== m) {
      params.set('mode', valid);
      navigate({ search: params.toString() }, { replace: true });
      return;
    }

    setMode(valid);
  }, [location.search]);

  useEffect(() => {
    const t = wiki?.title ?? '';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = `600 ${FONT_SIZE}px sans-serif`;

    const textWidth = ctx.measureText(t || '没有标题').width;

    const calcWidth = Math.min(Math.max(textWidth + 12, DEFAULT_TITLE_WIDTH), maxWidth);

    setInputWidth(calcWidth);
  }, [wiki?.title, maxWidth]);

  const setUrlMode = (m: string) => {
    const params = new URLSearchParams(location.search);
    params.set('mode', m);
    navigate({ search: params.toString() }, { replace: true });
  };

  const updateMaxWidth = () => {
    if (!headerRef.current || !buttonAreaRef.current) return;

    const headerWidth = headerRef.current.clientWidth;
    const buttonWidth = buttonAreaRef.current.clientWidth;
    const calculated = headerWidth - buttonWidth - MIN_RIGHT_PADDING - 20;
    setMaxWidth(Math.max(calculated, DEFAULT_TITLE_WIDTH));
  };

  return (
    <>
      {blocker.state === 'blocked' && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}>
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              width: 360,
              p: 3,
              boxShadow: 24,
              textAlign: 'center',
            }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              未保存的更改
            </Typography>
            <Typography sx={{ mb: 3, color: 'text.secondary' }}>检测到未保存的更改，确定要离开吗？</Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button color="error" variant="contained" onClick={() => blocker.proceed()} sx={{ px: 4 }}>
                离开
              </Button>

              <Button variant="outlined" onClick={() => blocker.reset()} sx={{ px: 4 }}>
                留在当前页
              </Button>
            </Stack>
          </Box>
        </Box>
      )}

      <div
        ref={headerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          height: 48,
          borderBottom: '1px solid #e0e0e0',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
        <TitleBox
          focused={focused}
          readonly={isReadOnly}
          style={{ maxWidth }}
          onClick={() => {
            if (isReadOnly) {
              setUrlMode('edit');
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}>
          <TitleInput
            ref={inputRef}
            value={wiki?.title ?? ''}
            readOnly={isReadOnly}
            readonlyMode={isReadOnly}
            style={{ width: `${inputWidth}px` }}
            onChange={(e) => updateWiki({ title: e.target.value })}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              if (!wiki?.title || wiki.title.trim() === '') {
                updateWiki({ title: '没有标题' });
              }
            }}
          />
        </TitleBox>

        <Stack direction="row" spacing={0.5} sx={{ marginLeft: 'auto' }} ref={buttonAreaRef}>
          <ModeBtn
            className={mode === 'read' ? 'active' : ''}
            onClick={() => {
              setUrlMode('read');
            }}>
            <VisibilityIcon fontSize="small" />
          </ModeBtn>

          <ModeBtn
            className={mode === 'edit' ? 'active' : ''}
            onClick={() => {
              setUrlMode('edit');
            }}>
            <EditIcon fontSize="small" />
          </ModeBtn>

          <ModeBtn
            className={mode === 'file' ? 'active' : ''}
            onClick={() => {
              setUrlMode('file');
            }}>
            <AttachFileIcon fontSize="small" />
          </ModeBtn>

          <ModeBtn
            className={mode === 'comment' ? 'active' : ''}
            onClick={() => {
              setUrlMode('comment');
            }}>
            <ForumIcon fontSize="small" />
          </ModeBtn>

          <SaveBtn
            disabled={mode !== 'edit' || !isDirty}
            startIcon={<SaveIcon fontSize="small" />}
            onClick={saveWiki}
            sx={{
              color: mode === 'edit' && isDirty ? 'primary.main' : 'text.disabled',
              bgcolor: mode === 'edit' && isDirty ? 'rgba(25,118,210,0.08)' : 'transparent',
              '&:hover': {
                bgcolor: mode === 'edit' && isDirty ? 'rgba(25,118,210,0.15)' : 'rgba(0,0,0,0.04)',
              },
            }}>
            保存
          </SaveBtn>
        </Stack>
      </div>
    </>
  );
}