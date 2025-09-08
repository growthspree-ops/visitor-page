import React from 'react';

const Spinner = () => {
  return (
    <div
      style={{
        display: 'block',
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1031
      }}
    >
      <style>
        {`
          @keyframes spinner {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div
        style={{
          animation: '400ms linear infinite spinner',
          borderBottom: '2px solid transparent',
          borderLeft: '2px solid #29d',
          borderRadius: '50%',
          borderRight: '2px solid transparent',
          borderTop: '2px solid #29d',
          boxSizing: 'border-box',
          height: 18,
          width: 18
        }}
      />
    </div>
  );
};

export default Spinner;
