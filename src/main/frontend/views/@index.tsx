import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';

export const config: ViewConfig = {
  menu: { exclude: true },
};

const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/note');
  }, [navigate]);
  return <div>Redirecting...</div>;
};

export default Home;
