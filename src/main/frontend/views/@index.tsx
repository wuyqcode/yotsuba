import { BrowserRouter, Routes, Route, useNavigate } from 'react-router';
import { useEffect } from 'react';

const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/post');
  }, [navigate]);
  return <div>Redirecting...</div>;
};

export default Home;
