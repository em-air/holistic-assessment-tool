import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes';

const CriticalThinkingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTES.ANALOGY_QUIZ, { replace: true });
  }, [navigate]);

  return null;
};

export default CriticalThinkingPage;
