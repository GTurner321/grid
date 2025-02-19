window.Rules = (() => {
  function RulesComponent() {
    const [isVisible, setIsVisible] = React.useState(true);
    
    const handleStart = () => {
      setIsVisible(false);
      // Optionally dispatch a game start event
      window.dispatchEvent(new Event('gameStart'));
    };

    if (!isVisible) return null;

    return React.createElement(
      'div',
      {
        className: 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'
      },
      React.createElement(
        'div',
        {
          className: 'bg-blue-950 p-4 rounded-lg shadow-xl w-full max-w-2xl mx-4'
        },
        React.createElement(
          'div',
          {
            className: 'text-center font-mono'
          },
          React.createElement(
            'h2',
            {
              className: 'text-red-500 text-xl font-bold mb-2'
            },
            'RULES'
          ),
          React.createElement(
            'div',
            {
              className: 'text-yellow-300 text-xs font-bold leading-tight'
            },
            React.createElement('p', null, 'FIND THE PATH BY FOLLOWING THE MATHEMATICAL SEQUENCE - GREEN TO RED'),
            React.createElement('p', null, 'MOVE TO ADJACENT CELLS ONLY - LEFT / RIGHT / UP / DOWN'),
            React.createElement('p', null, 'THE ANSWER TO EACH SUM IS THE FIRST NUMBER OF THE NEXT SUM'),
            React.createElement('p', null, 'A SQUARE CANNOT BE REUSED')
          ),
          React.createElement(
            'h2',
            {
              className: 'text-red-500 text-lg font-bold mt-3 mb-2'
            },
            'MORE'
          ),
          React.createElement(
            'div',
            {
              className: 'text-yellow-300 text-xs font-bold leading-tight'
            },
            React.createElement('p', null, 'REMOVE CELLS NOT IN THE PATH (-1/2 POINTS)'),
            React.createElement('p', null, 'CHECK FOR MISTAKES (-1/4 POINTS)'),
            React.createElement('p', null, '... THE RIGHT MATHS DOESN\'T ALWAYS MEAN YOU\'RE ON THE RIGHT PATH!')
          ),
          React.createElement(
            'div',
            {
              className: 'flex justify-center mt-4'
            },
            React.createElement(
              'button',
              {
                onClick: handleStart,
                className: 'px-6 py-2 bg-transparent border-2 border-red-500 text-red-500 text-xl font-bold rounded-lg hover:bg-blue-950 hover:text-white transition-colors font-mono'
              },
              'START'
            )
          )
        )
      )
    );
  }
  return RulesComponent;
})();
