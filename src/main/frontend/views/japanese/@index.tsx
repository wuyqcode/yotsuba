import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { TextConvertEndpoint } from 'Frontend/generated/endpoints';
import {
  Box,
  Button,
  Card,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { useState, useRef } from 'react';
import { ReactReader } from 'react-reader';

export const config: ViewConfig = {
  menu: { order: 3, icon: 'HomeIcon' },
  title: 'かな変換ツール',
};

/* =========================================================
   分割函数：按 。 、 切分，且每段 ≥100 字（最后一段例外）
   ========================================================= */
function splitJapaneseTextMin100(text: string) {
  const parts: string[] = [];
  let buffer = '';

  for (const ch of text) {
    buffer += ch;

    if (
      (ch === '。' || ch === '、') &&
      buffer.length >= 100
    ) {
      parts.push(buffer);
      buffer = '';
    }
  }

  if (buffer.trim()) {
    parts.push(buffer);
  }

  return parts;
}

export default function JapaneseTool() {
  const [tab, setTab] = useState(0);

  // ---------- Text mode ----------
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [parts, setParts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);

  // ---------- EPUB mode（原样保留） ----------
  const [file, setFile] = useState<File | null>(null);
  const [originalEpubData, setOriginalEpubData] = useState<ArrayBuffer | null>(null);
  const [convertedEpubData, setConvertedEpubData] = useState<ArrayBuffer | null>(null);
  const [epubLocation, setEpubLocation] = useState<string | number>(0);
  const epubInputRef = useRef<HTMLInputElement | null>(null);

  const handleTabChange = (_: any, v: number) => setTab(v);

  /* =========================================================
     文本转换（核心逻辑）
     ========================================================= */
  const handleConvert = async () => {
    if (!input.trim()) return;

    const chunks = splitJapaneseTextMin100(input);

    setParts(chunks);
    setResult('');
    setProgress(0);
    setCurrentIndex(null);
    setConverting(true);

    for (let i = 0; i < chunks.length; i++) {
      setCurrentIndex(i);

      try {
        const res = await TextConvertEndpoint.convertText(chunks[i]);
        if (res) {
          setResult((prev) => prev + res);
        }
      } catch (e) {
        console.error('convert failed', e);
      }

      setProgress(Math.round(((i + 1) / chunks.length) * 100));
    }

    setCurrentIndex(null);
    setConverting(false);
  };

  return (
    <Box sx={{ maxWidth: '1100px', mx: 'auto', py: 6, px: 3 }}>
      {/* ================= Header ================= */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          かな変換 - ふりがな表示
        </Typography>
        <Typography pt={1} color="text.secondary">
          入力した日本語テキストの漢字に、ふりがな（読み仮名）を付けます。
        </Typography>
      </Box>

      {/* ================= Tabs ================= */}
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="テキスト入力" />
        <Tab label="EPUB アップロード" />
      </Tabs>

      {/* ##################################################
         TAB 0 : TEXT CONVERT
         ################################################## */}
      {tab === 0 && (
        <>
          {/* 输入 */}
          <Card sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" mb={1}>
              日本語テキストを入力（100文字以上で自動分割）
            </Typography>

            <TextField
              multiline
              fullWidth
              minRows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ここに日本語テキストを入力してください..."
            />
          </Card>

          {/* 按钮 */}
          <Button
            variant="contained"
            onClick={handleConvert}
            disabled={!input.trim() || converting}
            sx={{ mb: 3 }}
          >
            変換
          </Button>

          {/* 进度条 */}
          {converting && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" mb={1}>
                処理中… {progress}%
              </Typography>
              <Paper variant="outlined">
                <Box sx={{ width: `${progress}%`, height: 6, bgcolor: 'primary.main' }} />
              </Paper>
            </Box>
          )}

          {/* 实时结果 */}
          <Card sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              変換結果（リアルタイム）
            </Typography>

            <Box
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{
                __html: result || 'ここに変換結果が表示されます',
              }}
            />
          </Card>
        </>
      )}

      {/* ##################################################
         TAB 1 : EPUB（原样保留）
         ################################################## */}
      {tab === 1 && (
        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" mb={2}>
            EPUB ファイルをアップロード
          </Typography>

          <Button variant="contained" onClick={() => epubInputRef.current?.click()}>
            ファイル選択
          </Button>

          <input
            hidden
            type="file"
            accept=".epub"
            ref={epubInputRef}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;

              setFile(f);
              const buf = await f.arrayBuffer();
              setOriginalEpubData(buf);
              setConvertedEpubData(null);
            }}
          />

          {file && (
            <Button
              sx={{ mt: 3 }}
              variant="contained"
              onClick={async () => {
                const fd = new FormData();
                fd.append('file', file);
                const res = await fetch('/api/uploadEpub', { method: 'POST', body: fd });
                if (res.ok) {
                  const blob = await res.blob();
                  setConvertedEpubData(await blob.arrayBuffer());
                }
              }}
            >
              EPUB 変換
            </Button>
          )}

          {(originalEpubData || convertedEpubData) && (
            <Box sx={{ height: '80vh', mt: 4 }}>
              <ReactReader
                url={convertedEpubData || originalEpubData!}
                location={epubLocation}
                locationChanged={setEpubLocation}
              />
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}
