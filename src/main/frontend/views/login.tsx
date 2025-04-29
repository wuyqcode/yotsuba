import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { useAuth } from 'Frontend/util/auth.js';
import { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Alert } from '@mui/material';

export const config: ViewConfig = {
  menu: { exclude: true },
};

export default function LoginView() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { defaultUrl, error, redirectUrl } = await login(username, password);

    if (error) {
      setLoginError(true);
    } else {
      const url = redirectUrl ?? defaultUrl ?? '/';
      const path = new URL(url, document.baseURI).pathname;
      document.location = path;
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Card sx={{ width: 360, p: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Hilla Auth Starter
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Login using user/user or admin/admin
          </Typography>

          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid username or password
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
