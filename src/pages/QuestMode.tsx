import React from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterCustomization from '@/components/character/CharacterCustomization';

export default function CharacterMode() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return <CharacterCustomization onBack={handleBack} />;
}