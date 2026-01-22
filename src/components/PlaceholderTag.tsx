import React from 'react';
import { Tag, TagLabel } from '@chakra-ui/react';
import type { AppTag } from '../types/Placeholder';

type PlaceholderTagProps = {
  tag: AppTag;
  colorScheme: string;
  canDrag: boolean;
};

const PlaceholderTag: React.FC<PlaceholderTagProps> = ({
  tag,
  colorScheme,
  canDrag
}) => {
  return (
    <Tag
      cursor={canDrag ? 'grab' : 'not-allowed'}
      variant="subtle"
      colorScheme={colorScheme}
      m={2}
      p={2.5}
      draggable={canDrag}
      onDragStart={(e) => {
        e.dataTransfer.setData('draggedItem', JSON.stringify(tag));
      }}
    >
      <TagLabel>{tag.text}</TagLabel>
    </Tag>
  );
};

export default PlaceholderTag;
