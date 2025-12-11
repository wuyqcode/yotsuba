import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { TextConvertEndpoint } from 'Frontend/generated/endpoints';
import { Box, Button, Card, Divider, Stack, Tab, Tabs, TextField, Typography, Paper } from '@mui/material';
import { useState, useRef } from 'react';
import { ReactReader } from 'react-reader';

export const config: ViewConfig = {
  menu: { order: 3, icon: 'HomeIcon' },
  title: 'かな変換ツール',
};

export default function JapaneseTool() {
  const [tab, setTab] = useState(0); // 0=text, 1=epub
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [originalEpubData, setOriginalEpubData] = useState<ArrayBuffer | null>(null);
  const [convertedEpubData, setConvertedEpubData] = useState<ArrayBuffer | null>(null);
  const [epubLocation, setEpubLocation] = useState<string | number>(0);

  const [file, setFile] = useState<File | null>(null);
  const epubInputRef = useRef<HTMLInputElement | null>(null);

  const handleTabChange = (_: any, v: number) => setTab(v);

  const handleConvert = async () => {
    if (!input.trim()) return;
    const res = await TextConvertEndpoint.convertText(input);
    setResult(res ?? '');
  };

  return (
    <Box sx={{ maxWidth: '1100px', mx: 'auto', py: 6, px: 3 }}>
      {/* ---- Header ---- */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            noWrap
            sx={{
              whiteSpace: 'nowrap',
              fontSize: {
                xs: '1.2rem',
                sm: '1.5rem',
                md: '2rem',
              },
            }}>
            かな変換 - ふりがな表示
          </Typography>

          {/* 渐变 underline */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              left: 0,
              height: 6,
              width: '100%',
              borderRadius: 2,
              background: (theme) =>
                `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.contrastText})`,
            }}
          />
        </Box>

        <Typography pt={2} color="text.secondary">
          入力した日本語テキストの漢字に、ふりがな（読み仮名）を付けます。
        </Typography>
      </Box>

      {/* ---- Tabs ---- */}
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="テキスト入力" />
        <Tab label="EPUB アップロード" />
      </Tabs>

      {/* ##############################################
           TAB 0 : TEXT Convert
         ############################################## */}
      {tab === 0 && (
        <>
          <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1">日本語テキストを入力</Typography>
            </Stack>

            <TextField
              multiline
              fullWidth
              minRows={6}
              placeholder="ここに日本語のテキストを入力してください..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{
                '& textarea': { lineHeight: 1.8 },
                backgroundColor: '#fafafa',
                borderRadius: 2,
              }}
            />
          </Card>

          <Button
            variant="contained"
            onClick={handleConvert}
            disabled={!input.trim()}
            sx={{ mb: 6, py: 1.2, px: 4, borderRadius: 2 }}>
            変換
          </Button>

          {/* ---- Result ---- */}
          <Card
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: (theme) => theme.palette.primary.light + '10',
              border: (theme) => `1px solid ${theme.palette.primary.main}30`,
              boxShadow: 4,
              mb: 6,
            }}>
            <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
              変換結果
            </Typography>

            <Box
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.1rem' }}
              dangerouslySetInnerHTML={{
                __html: result || 'ここに変換結果が表示されます',
              }}
            />
          </Card>
        </>
      )}

      {/* ##############################################
           TAB 1 : EPUB Upload
         ############################################## */}
      {tab === 1 && (
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="subtitle1" mb={2}>
            EPUB ファイルをアップロード
          </Typography>

          {/* 文件选择 */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
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

                // （1）立即读取原文件 ArrayBuffer
                const arrayBuffer = await f.arrayBuffer();
                setOriginalEpubData(arrayBuffer);

                // 清空转换数据
                setConvertedEpubData(null);
              }}
            />

            {file && (
              <Typography color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                {file.name}
              </Typography>
            )}
          </Stack>

          {/* 转换按钮 */}
          {file && (
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={async () => {
                const fd = new FormData();
                fd.append('file', file as File);

                const res = await fetch('/api/uploadEpub', {
                  method: 'POST',
                  body: fd,
                });

                if (res.ok) {
                  const blob = await res.blob();

                  // （2）转换后的 ArrayBuffer
                  const arrayBuffer = await blob.arrayBuffer();
                  setConvertedEpubData(arrayBuffer);
                }
              }}>
              EPUB 変換
            </Button>
          )}

          {/* 下载按钮：用 blob 构建 URL，然后下载 */}
          {convertedEpubData && (
            <Button
              variant="outlined"
              sx={{ mt: 3, ml: 2 }}
              onClick={() => {
                const blob = new Blob([convertedEpubData], { type: 'application/epub+zip' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file?.name || 'converted.epub';
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 200);
              }}>
              EPUB ダウンロード
            </Button>
          )}

          {/* EPUB 阅读器预览 ArrayBuffer */}
          {(originalEpubData || convertedEpubData) && (
            <Box
              sx={{
                height: '80vh',
                mt: 4,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 2,
                border: '1px solid #ddd',
              }}>
              <ReactReader
                url={convertedEpubData || originalEpubData!} // <— 使用 ArrayBuffer
                location={epubLocation}
                locationChanged={(loc) => setEpubLocation(loc)}
              />
            </Box>
          )}
        </Card>
      )}

      {/* ##############################################
           Information Section (MUI styled like shadcn)
         ############################################## */}
      <Card
        sx={{
          mt: 10,
          p: 4,
          borderRadius: 3,
          backgroundColor: (theme) => theme.palette.primary.light + '10',
          border: (theme) => `1px solid ${theme.palette.primary.main}20`,
          boxShadow: 3,
        }}>
        <Typography variant="h5" color="primary" fontWeight="bold" mb={2}>
          日本の文字と読み方
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {/* Hiragana */}
          <Box>
            <Typography variant="h6" color="primary" fontWeight="bold">
              ひらがな
            </Typography>
            <Typography color="text.secondary" sx={{ pl: 2 }}>
              ひらがなは、日本語の音を表す表音文字の一つです。主に日本固有の言葉、漢字の送り仮名、助詞・助動詞などに使われます。丸みを帯びた形が特徴です。
            </Typography>
          </Box>

          {/* Katakana */}
          <Box>
            <Typography variant="h6" color="primary" fontWeight="bold">
              カタカナ
            </Typography>
            <Typography color="text.secondary" sx={{ pl: 2 }}>
              カタカナも、日本語の音を表す表音文字の一つです。主に外国から来た言葉（外来語）、擬音語・擬態語、または特定の言葉を強調する際に使われます。直線的で角張った形が特徴です。
            </Typography>
          </Box>

          {/* Kanji */}
          <Box>
            <Typography variant="h6" color="primary" fontWeight="bold">
              漢字（かんじ）
            </Typography>
            <Typography color="text.secondary" sx={{ pl: 2 }}>
              漢字は、主に意味を表す文字です。多くは中国から伝わり、日本語の表記に欠かせない要素です。一つの漢字が複数の読み方を持つこともあります。
            </Typography>
          </Box>

          {/* Furigana */}
          <Box>
            <Typography variant="h6" color="primary" fontWeight="bold">
              ふりがな（振り仮名）
            </Typography>
            <Typography color="text.secondary" sx={{ pl: 2 }}>
              ふりがなは、漢字などの文字の読み方を示すために付けられる仮名です。
            </Typography>
          </Box>

          {/* ruby example */}
          <Box>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Web でのふりがな表示
            </Typography>
            <Typography color="text.secondary" sx={{ pl: 2 }}>
              ウェブページでは、HTMLのrubyタグを使用することで、文字の上にふりがなを表示することができます。例：{' '}
              <ruby>
                漢字<rt>かんじ</rt>
              </ruby>
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}
