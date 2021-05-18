/****************************************************************************************************
 * FILENAME: index.js
 * DESCRIPTION: Insubstantiate the App.js file with the potential to invoke the grid and drag-n-drop 
 * implementations
 * AUTHOR(S): Capstone 2019-2020
 * NOTES: This file is mandatory for react compilation. CSS is depriciated.
 ****************************************************************************************************/
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { DndProvider } from "react-dnd";
import { GridProvider } from "./components/grid/GridContext";
import { TouchBackend } from'react-dnd-touch-backend';

//React DnD warns this option may be buggy, needs more testing
const options = {enableMouseEvents: true}

ReactDOM.render(
   <DndProvider backend={TouchBackend} options={options}>
      <GridProvider>
         <App />
      </GridProvider>
   </DndProvider>,
   document.getElementById('app')
);