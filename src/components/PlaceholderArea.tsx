import React, { useState } from 'react';
import { Tag, TagCloseButton, useColorModeValue } from '@chakra-ui/react';
import type { AppTag, DashedPlaceholder } from '../types/Placeholder';

type PlaceholderAreaProps = {
  placeholder: DashedPlaceholder;
  updatePlaceholderTarget: (_name: string, _target: AppTag | null) => void;
  isSubmitting: boolean;
};

const PlaceholderArea: React.FC<PlaceholderAreaProps> = ({
  placeholder,
  updatePlaceholderTarget,
  isSubmitting
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const initialBorderColor = useColorModeValue('gray.500', 'gray.300');
  const border = placeholder.target ? '2px solid' : '2px dashed';

  const backgroundColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = placeholder.target ? backgroundColor : 'transparent';

  const [borderColor, setBorderColor] = useState<string>(initialBorderColor);

  // Drag and Drop Handlers
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (placeholder.target) {
      setBorderColor('red');
      e.dataTransfer.dropEffect = 'none';
    } else {
      setBorderColor('green');
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const onDragLeave = () => {
    setBorderColor(initialBorderColor);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setBorderColor(initialBorderColor);
    const draggedItem = e.dataTransfer.getData('draggedItem');
    const draggedTag: AppTag = JSON.parse(draggedItem);
    updatePlaceholderTarget(placeholder.name, draggedTag);
  };

  const removeTarget = (placeholderName: string) => {
    updatePlaceholderTarget(placeholderName, null);
  };

  return (
    <Tag
      border={border}
      borderColor={borderColor}
      bg={bgColor}
      color={textColor}
      padding="0.5em 1em"
      margin="0.3em"
      verticalAlign="middle"
      // Make the text not select-able
      userSelect="none"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      cursor={isSubmitting ? 'wait' : 'default'}
    >
      {placeholder.target ? placeholder.target.text : placeholder.name}
      {placeholder.target && (
        <TagCloseButton
          color="red"
          onClick={() => removeTarget(placeholder.name)}
        />
      )}
    </Tag>
  );
};

export default PlaceholderArea;
