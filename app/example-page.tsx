'use client';

import createClientComponent from './dynamic-wrap';

function ExamplePage() {
  // Your component with hooks
  return <div>Your component content</div>;
}

// Export a properly wrapped version of the component
export default createClientComponent(ExamplePage);
