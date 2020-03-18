import React from 'react';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { countSelector, increment } from './store';

const App = () => {
  const dispatch = useDispatch();
  const count = useSelector(countSelector);

  return (
    <div className="App">
        <p>
          Count {count}!
        </p>
        <button onClick={() => {dispatch(increment())} } >
          Increment
        </button>
    </div>
  );
}

export default App;
