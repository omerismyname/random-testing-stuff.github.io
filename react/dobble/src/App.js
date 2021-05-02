import './App.css';
import { createMuiTheme } from '@material-ui/core/styles';
import { TextField, ThemeProvider } from '@material-ui/core';
import { useState } from 'react';

const gridW = 7; // dobble grid width
const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});

export default function App() {
  const [selectedNumber, setSelectedNumber] = useState(null);
  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <div className="dobble-grid" style={{gridTemplateColumns: `repeat(${gridW}, 1fr)`}}>
          <DobbleCards width={gridW} selected={selectedNumber}></DobbleCards>
        </div>
        <TextField value={selectedNumber || ""} onChange={e => {
          setSelectedNumber(Math.min(parseInt(e.target.value), (gridW+1)*gridW-1) || null);
        }}></TextField>
      </div>
    </ThemeProvider>
  );
}

function DobbleCards(props) {
  const cards = generateDobble(props.width);
  let cardsArr = [];
  for (let i = 0; i < cards.length; i++) {
    cardsArr.push(
      <div className="dobble-card" style={{gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(props.width+1))}, 2ch)`}} key={i}>
        <DobbleIcons icons={cards[i]} selected={props.selected}></DobbleIcons>
      </div>
    );
  }
  return cardsArr; 
}

function DobbleIcons(props) {
  let iconsArr = [];
  for (let i = 0; i < props.icons.length; i++) {
    let iconColour = (props.selected === null || props.selected === props.icons[i]) ? "#ffffff" : "#555555";
    iconsArr.push(
      <span className="dobble-icon" key={i} style={{color: iconColour}}>{props.icons[i]}</span>
    );
  }
  return iconsArr;
}

function generateDobble(width) {
  let arr = new Array(width*width);
  for (let i = 0; i < width*width; i++) {
    arr[i] = [];
  }
  for (let gradient = 0; gradient < width; gradient++) {
    for (let startX = 0; startX < width; startX++) {
      for (let y = 0; y < width; y++) {
        let x = (startX+gradient*y) % width;
        arr[y*width+x].push((gradient*width)+startX);
      }
    }
  }
  for (let y = 0; y < width; y++) {
    for (let x = 0; x < width; x++) {
      arr[y*width+x].push((width*width)+y);
    }
  }
  for (let i = 0; i < width*width; i++) {
    for (let j = i+1; j < width*width; j++) {
      let matches = 0;
      for (let k = 0; k < (width+1)*width; k++) {
        if (arr[i].includes(k) && arr[j].includes(k)) matches++;
      }
      if (matches > 1) alert("AAAAAAAAAAAA");
    }
  }
  return arr;
}