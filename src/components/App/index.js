import React, { useEffect, useState } from 'react';
import './stylesheet.scss';
import Splash from '../Splash';
import { classes } from '../../common/utils';
import Main from '../Main';
import { Route } from 'react-router-dom';
import Learn from '../Learn';
import Learn1 from '../Learn1';

function eval_edit_distance(arr1, arr2) {
  var matrix = [];

  var i;
  for(i = 0; i <= arr2.length; i++){
    matrix[i] = [i];
  }

  var j;
  for(j = 0; j <= arr1.length; j++){
    matrix[0][j] = j;
  }

  for(i = 1; i <= arr2.length; i++){
    for(j = 1; j <= arr1.length; j++){
      if(arr2[i-1] == arr1[j-1]){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1,
                                Math.min(matrix[i][j-1] + 1,
                                         matrix[i-1][j] + 1));
      }
    }
  }

  return matrix[arr2.length][arr1.length];
}
var result = eval_edit_distance(
  [1,2,3,3,3],
  [1,2,2,3,3]
)
console.log(result)

result = eval_edit_distance(
  [1,2,3,3,3],
  [1,2,3,3,3]
)
console.log(result)

function App() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      <Route path="/" exact component={Main}/>
      <Route path="/learn/:category/:item" exact component={Learn}/>
      <Route path="/learn1/:category/:item" exact component={Learn1}/>
      <Splash className={classes('splash', splash && 'on')}/>
    </div>
  );
}

export default App;
