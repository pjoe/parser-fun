import { useState } from 'react';
import './App.css';
import { parse } from './parser';

function App() {
  const [source, setSource] = useState('');
  const [result, setResult] = useState('');

  return (
    <div className="App">
      <div></div>
      <h1>Parser</h1>
      <div>
        <textarea
          className="source"
          id="src"
          rows={10}
          onChange={(e) => setSource(e.target.value)}
          value={source}
        ></textarea>
      </div>
      <div className="card">
        <div className="buttons">
          <button onClick={() => setResult(parse(source))}>Parse</button>
          <button
            onClick={() => {
              setSource('');
              setResult('');
            }}
          >
            Clear
          </button>
          <button onClick={() => setResult('')}>Clear Result</button>
        </div>
      </div>
      <p>
        <textarea className="output" disabled value={result}></textarea>
      </p>
    </div>
  );
}

export default App;
