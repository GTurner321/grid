// Helper functions for sector generation
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const isSimplifiedFraction = (n, d) => gcd(n, d) === 1;

const generateSectorPath = (radius, startAngle, endAngle) => {
  const start = {
    x: radius + radius * Math.cos(startAngle),
    y: radius + radius * Math.sin(startAngle)
  };
  const end = {
    x: radius + radius * Math.cos(endAngle),
    y: radius + radius * Math.sin(endAngle)
  };
  const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;
  return `M ${radius} ${radius} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

// Color mapping for denominators
const denominatorColors = {
  2: '#FFB3B3', // light red
  3: '#BDFCC9', // light green
  4: '#B3E0FF', // light blue
  5: '#FFE6B3', // light orange
  6: '#E6B3FF', // light purple
  8: '#B3FFB3', // mint
};

// Dot Number SVG Generation
const createDotNumberSVG = (number, size = 40) => {
  const dotSize = size / 5;
  const spacing = size / 4;
  const padding = size / 10;

  const dotPositions = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
    7: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 0], [2, 1], [2, 2]],
    8: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]],
    9: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]
  };

  const dots = dotPositions[number] || [];

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  dots.forEach(([x, y]) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', padding + x * spacing);
    circle.setAttribute('cy', padding + y * spacing);
    circle.setAttribute('r', dotSize / 2);
    circle.setAttribute('fill', 'currentColor');
    svg.appendChild(circle);
  });

  return svg;
};

// Fraction Symbol SVG Generation
const createFractionSymbolSVG = (numerator, denominator, size = 40) => {
  const radius = size / 2;
  const sectorAngle = (2 * Math.PI) / denominator;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  // White background
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  background.setAttribute('cx', radius);
  background.setAttribute('cy', radius);
  background.setAttribute('r', radius - 0.5);
  background.setAttribute('fill', 'white');
  svg.appendChild(background);

  // Filled sectors
  for (let index = 0; index < numerator; index++) {
    const startAngle = -Math.PI/2 + (index * sectorAngle);
    const endAngle = startAngle + sectorAngle;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', generateSectorPath(radius - 0.5, startAngle, endAngle));
    path.setAttribute('fill', denominatorColors[denominator]);
    path.setAttribute('stroke', 'none');
    svg.appendChild(path);
  }

  // Division lines
  for (let index = 0; index < denominator; index++) {
    const angle = -Math.PI/2 + (index * sectorAngle);
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', radius);
    line.setAttribute('y1', radius);
    line.setAttribute('x2', radius + (radius - 0.5) * Math.cos(angle));
    line.setAttribute('y2', radius + (radius - 0.5) * Math.sin(angle));
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }

  // Outer circle
  const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  outerCircle.setAttribute('cx', radius);
  outerCircle.setAttribute('cy', radius);
  outerCircle.setAttribute('r', radius - 0.5);
  outerCircle.setAttribute('fill', 'none');
  outerCircle.setAttribute('stroke', 'black');
  outerCircle.setAttribute('stroke-width', '1');
  svg.appendChild(outerCircle);

  return svg;
};

const createSymbol = (symbol, size = 40) => {
  // Handle integer values 1-9
  if (Number.isInteger(symbol) && symbol >= 1 && symbol <= 9) {
    return createDotNumberSVG(symbol, size);
  }
  
  // Handle fractions (passed as "n/d" string)
  if (typeof symbol === 'string' && symbol.includes('/')) {
    const [num, den] = symbol.split('/').map(Number);
    console.log('Fraction input:', num, den);  // Debug logging
    
    // Modify this condition to explicitly list allowed denominators
    if ([2, 3, 4, 5, 6, 8].includes(den) && isSimplifiedFraction(num, den)) {
      return createFractionSymbolSVG(num, den, size);
    }
  }
  
  return null;
};

// Available symbols for reference
const validSymbols = [
  // Integers 1-9
  ...Array.from({ length: 9 }, (_, i) => i + 1),
  // Valid fractions (excluding denominators 7,9,10,11,12)
  '1/2', '1/3', '2/3', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5',
  '1/6', '5/6', '1/8', '3/8', '5/8', '7/8'
];

export default {
  createSymbol,
  validSymbols
};
