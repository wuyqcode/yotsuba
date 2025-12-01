import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import {
  Box,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { useState, KeyboardEvent } from 'react';

export const config: ViewConfig = {
  menu: { order: 7, icon: 'NumbersIcon' },
  title: 'Base62转换器',
};

const BASE62_CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function intToBase62(num: number, padTo4: boolean = true): string {
  if (num === 0) {
    const base = '0';
    return padTo4 ? base.padStart(4, '0') : base;
  }
  if (num < 0 || !Number.isInteger(num)) {
    throw new Error('Number must be a non-negative integer.');
  }

  let n = num;
  const result: string[] = [];
  while (n > 0) {
    const remainder = n % 62;
    result.push(BASE62_CHARSET[remainder]);
    n = Math.floor(n / 62);
  }
  let base62Str = result.reverse().join('');

  if (padTo4 && base62Str.length < 4) {
    base62Str = base62Str.padStart(4, '0');
  }

  return base62Str;
}

function base62ToInt(str: string): number {
  if (!str || typeof str !== 'string') {
    throw new Error('Base62 string is required.');
  }
  let result = 0;
  for (const ch of str) {
    const index = BASE62_CHARSET.indexOf(ch);
    if (index === -1) {
      throw new Error(`Invalid character '${ch}'. Allowed: 0-9, a-z, A-Z.`);
    }
    result = result * 62 + index;
  }
  return result;
}

export default function Base62ConverterView() {
  const [base10Input, setBase10Input] = useState<string>('');
  const [base62Input, setBase62Input] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [padTo4, setPadTo4] = useState<boolean>(true);
  const [error10, setError10] = useState<string>('');
  const [error62, setError62] = useState<string>('');

  const handleBase10To62 = () => {
    setError10('');
    setError62('');
    setResult('');

    const val = base10Input.trim();
    if (val === '') {
      setError10('Please enter a decimal integer.');
      return;
    }

    const num = Number(val);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) {
      setError10('Number must be a non-negative integer.');
      return;
    }

    try {
      const base62 = intToBase62(num, padTo4);
      setResult(base62);
    } catch (e) {
      setError10(e instanceof Error ? e.message : String(e));
    }
  };

  const handleBase62To10 = () => {
    setError10('');
    setError62('');
    setResult('');

    const str = base62Input.trim();
    if (str === '') {
      setError62('Please enter a Base62 string.');
      return;
    }

    try {
      const num = base62ToInt(str);
      setResult(String(num));
    } catch (e) {
      setError62(e instanceof Error ? e.message : String(e));
    }
  };

  const handleBase10KeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBase10To62();
    }
  };

  const handleBase62KeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBase62To10();
    }
  };

  return (
    <Box height={'100%'}>
      <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Base10 ↔ Base62 Converter
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            Charset:{' '}
            <code style={{ background: '#eceef1', padding: '2px 4px', borderRadius: '4px', fontSize: '0.85rem' }}>
              0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
            </code>
            <br />
            Optionally pads Base62 to 4 chars like your Python <code style={{ background: '#eceef1', padding: '2px 4px', borderRadius: '4px', fontSize: '0.85rem' }}>int_to_base62</code>.
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Base10 to Base62 */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Base10 (decimal integer)
              </Typography>
              <TextField
                fullWidth
                type="number"
                inputProps={{ min: 0, step: 1 }}
                placeholder="e.g. 1, 62, 3844, 14776335"
                value={base10Input}
                onChange={(e) => setBase10Input(e.target.value)}
                onKeyDown={handleBase10KeyDown}
                error={!!error10}
                helperText={error10}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Checkbox checked={padTo4} onChange={(e) => setPadTo4(e.target.checked)} />
                }
                label={
                  <Typography variant="body2">
                    Pad Base62 to at least 4 characters (like <code style={{ background: '#eceef1', padding: '2px 4px', borderRadius: '4px', fontSize: '0.85rem' }}>zfill(4)</code>)
                  </Typography>
                }
              />
              <Box mt={2}>
                <Button variant="contained" color="primary" onClick={handleBase10To62} fullWidth>
                  Convert → Base62
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Base62 to Base10 */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Base62 string
              </Typography>
              <TextField
                fullWidth
                type="text"
                placeholder="e.g. 0001, 0010, 1000, 100000"
                value={base62Input}
                onChange={(e) => setBase62Input(e.target.value)}
                onKeyDown={handleBase62KeyDown}
                error={!!error62}
                helperText={error62}
                sx={{ mb: 2 }}
              />
              <Box>
                <Button variant="contained" color="primary" onClick={handleBase62To10} fullWidth>
                  Convert → Base10
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Result */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Result
              </Typography>
              <TextField
                fullWidth
                type="text"
                placeholder="Result will appear here"
                value={result}
                InputProps={{
                  readOnly: true,
                }}
              />
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}

