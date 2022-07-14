import { useState } from 'react';
import './App.css';
import { compile } from './parser';

function App() {
  const [source, setSource] = useState('(1+2)*3');
  const [result, setResult] = useState(compile(source, 'ast'));
  const [mode, setMode] = useState('ast');

  return (
    <div className="App">
      <div></div>
      <h1>Parser</h1>
      <div>
        <textarea
          className="source"
          id="src"
          rows={3}
          onChange={(e) => setSource(e.target.value)}
          value={source}
        ></textarea>
      </div>
      <div className="card">
        <div className="mode">
          <select
            onChange={(e) => {
              const m = e.target.value;
              setMode(m);
              setResult(compile(source, m));
            }}
            value={mode}
          >
            <option value="ast">Parse AST</option>
            <option value="eval">Evaluate</option>
            <option value="lex">Tokenize (Lex)</option>
            <option value="compile">Compile</option>
          </select>
        </div>
        <div className="buttons">
          <button onClick={() => setResult(compile(source, mode))}>
            Parse
          </button>
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
