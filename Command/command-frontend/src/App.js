import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = (event) => {
      setMessage(event.data);
      console.log(event.data)
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="App">
      <h1>Command Dashboard</h1>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;