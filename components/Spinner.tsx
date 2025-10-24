
import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div
      className="w-12 h-12 rounded-full animate-spin
      border-4 border-solid border-blue-500 border-t-transparent"
    ></div>
  </div>
);

export default Spinner;
