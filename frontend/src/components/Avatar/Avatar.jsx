// frontend/src/components/Avatar/Avatar.jsx
import React from 'react';
import styles from './Avatar.module.css';

// Função para pegar as iniciais do nome
const getInitials = (name = '') => {
  const nameParts = name.split(' ');
  if (nameParts.length > 1) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

function Avatar({ name }) {
  return (
    <div className={styles.avatar}>
      {getInitials(name)}
    </div>
  );
}

export default Avatar;