import React from 'react';

const Rules = () => {
  return (
    <>
      <style>
        {`
          .command-box {
            position: fixed;
            top: 20px;
            left: 20px;
            background-color: #f5f5dc;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px;
            width: 45px;
            height: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 1000;
            color: #666;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .command-box:hover {
            width: 600px;
            height: 400px;
            overflow-y: auto;
            background-color: #f5f5dc;
            display: block;
            padding: 15px;
          }

          .command-box .title {
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            line-height: 1;
          }

          .command-box:hover .title {
            display: none;
          }

          .command-box .content {
            display: none;
            margin-top: 15px;
            font-size: 14px;
            line-height: 1.6;
          }

          .command-box:hover .content {
            display: block;
          }
        `}
      </style>
      <div className="command-box">
        <div className="title">RULES</div>
        <div className="content">
          <h3>How to Play</h3>
          <ol>
            <li>Select a difficulty level</li>
            <li>Find the path by following the mathematical sequence, from green to red</li>
            <li>Move to adjacent cells only, left / right / up / down; you cannot go back to the same cell</li>
            <li>The answer to each sum is the first number in the next sum</li>
          </ol>
          
          <h3>More</h3>
          <ol>
            <li>You can remove all the cells which are not in the path (cost: 1/2 points)</li>
            <li>You can check whether you've made any mistakes, but the right Maths doesn't always mean you're on the right path (cost: 1/4 points)</li>
            <li>Bonus points depend on time</li>
          </ol>
        </div>
      </div>
    </>
  );
};

export default Rules;
