import React, { useState } from 'react';

const Rules = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  const handleStart = () => {
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-blue-950 p-4 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="text-center font-mono">
              <h2 className="text-red-500 text-xl font-bold mb-2">RULES</h2>
              
              <div className="text-yellow-300 text-xs font-bold leading-tight">
                <p>FIND THE PATH BY FOLLOWING THE MATHEMATICAL SEQUENCE - GREEN TO RED</p>
                <p>MOVE TO ADJACENT CELLS ONLY - LEFT / RIGHT / UP / DOWN</p>
                <p>THE ANSWER TO EACH SUM IS THE FIRST NUMBER OF THE NEXT SUM</p>
                <p>A SQUARE CANNOT BE REUSED</p>
              </div>

              <h2 className="text-red-500 text-lg font-bold mt-3 mb-2">MORE</h2>
              
              <div className="text-yellow-300 text-xs font-bold leading-tight">
                <p>REMOVE CELLS NOT IN THE PATH (-1/2 POINTS)</p>
                <p>CHECK FOR MISTAKES (-1/4 POINTS)</p>
                <p>... THE RIGHT MATHS DOESN'T ALWAYS MEAN YOU'RE ON THE RIGHT PATH!</p>
              </div>

              <button
                onClick={handleStart}
                className="mt-4 px-6 py-2 bg-transparent border-2 border-red-500 text-red-500 text-xl font-bold rounded-lg hover:bg-blue-950 hover:text-white transition-colors font-mono"
              >
                START
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Rules;
