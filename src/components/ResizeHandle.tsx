
import React from 'react';

interface ResizeHandleProps {
  onResize: (e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onResize }) => {
  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 opacity-50"
      onMouseDown={onResize}
    />
  );
};

export default ResizeHandle;
