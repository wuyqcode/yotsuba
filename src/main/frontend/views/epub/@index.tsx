import { ViewConfig } from '@vaadin/hilla-file-router/types.js';

import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  RadioGroup,
  Stack,
  Typography
} from '@mui/material';
import { useRef, useState } from 'react';

export const config: ViewConfig = {
  menu: { order: 1, icon: 'vaadin:phone' },
  title: 'Public'
};

const ImageUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [outputFormat, setOutputFormat] = useState('');

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const handleFormatChange = (event: any) => {
    setOutputFormat(event.target.value);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/uploadEpub', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const disposition = response.headers.get('content-disposition');
        let filename = file.name;
        if (disposition) {
          filename = decodeURIComponent(
            disposition.split('filename=')[1]
          ).replace(/\+/g, ' ');
        }
        let blobURL = window.URL.createObjectURL(blob);
        let tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.download = filename;
        document.body.appendChild(tempLink);
        tempLink.click();
        setTimeout(function () {
          document.body.removeChild(tempLink);
          window.URL.revokeObjectURL(blobURL);
        }, 200);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  return (
    <Container>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          Epub Converter
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item container xs={12} justifyContent="center">
          <Stack>
            <Button variant="contained" component="label">
              Upload File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {file && <Typography variant="body1">{file.name}</Typography>}
          </Stack>
        </Grid>
        <Grid item container xs={12} justifyContent="center">
          <FormControl component="fieldset">
            <FormLabel component="legend">Select Output Format</FormLabel>
            <RadioGroup value={outputFormat} onChange={handleFormatChange}>
              <FormControlLabel
                value="hiragana"
                required
                disabled
                control={<Checkbox defaultChecked />}
                label="追加平假名"
              />
              <FormControlLabel
                value="english"
                control={<Checkbox />}
                label="追加英文"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item container xs={12} justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Convert
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ImageUpload;
