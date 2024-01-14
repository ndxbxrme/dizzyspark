function parseRange(input) {
  // Split the input string by commas and trim whitespace
  const elements = input.split(',').map(e => e.trim());

  // Initialize an empty result array
  const result = [];

  // Loop through each element
  for (const element of elements) {
    if (element.includes('-')) {
      // If the element contains a hyphen, it's a range
      const [start, end] = element.split('-').map(e => parseInt(e.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        // Generate the range of numbers
        if(start <= end) {
          for (let i = start; i <= end; i++) {
            result.push(i);
          }
        }
        else {
          for (let i = start; i>=end; i--) {
            result.push(i);
          }
        }
      }
    } else {
      // If the element is a single number, parse and add it
      const num = parseInt(element);
      if (!isNaN(num)) {
        result.push(num);
      }
    }
  }

  return result;
}
export {parseRange};