import React, { useState, useEffect } from 'react';
import { Text } from '@chakra-ui/react';

interface ImageProps {
  url: string;
  alt?: string;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
}

const Image: React.FC<ImageProps> = ({
  url,
  alt = 'image',
  width = '50px',
  height = '30px',
  style = {}
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!url) return;
      try {
        const response = await fetch(url.trim());
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        setError(false);
      } catch (_) {
        setError(true);
      }
    };

    loadImage();

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [url]);

  const containerStyle = {
    width,
    height,
    background: '#f5f5f5',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const defaultStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '4px',
    background: '#f5f5f5',
    border: '10px solid #ccc',
    display: 'block',
    objectFit: 'contain'
  };

  const combinedStyle: React.CSSProperties = {
    ...defaultStyle,
    ...style,
    userSelect: 'none',
    pointerEvents: 'none'
  };

  if (error) {
    return (
      <Text as="span" fontWeight="bold" color="red.500">
        Failed to load
      </Text>
    );
  }

  if (!imageSrc) {
    return <Text as="span">Loading...</Text>;
  }

  return (
    <div style={containerStyle}>
      <img
        src={imageSrc}
        alt={alt}
        style={combinedStyle}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        tabIndex={-1}
      />
    </div>
  );
};

export default Image;
