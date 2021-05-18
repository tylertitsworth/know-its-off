/****************************************************************************************************
 * FILENAME: GridContext.js
 * DESCRIPTION: Create a Grid Context
 * AUTHOR(S): Capstone 2019-2020
 * NOTES: This is depreciated, and very messy. I wish I knew what was going on. We wanted to 
 * replace this with just a library that does it for us
 ****************************************************************************************************/
import React, { Component, createContext } from "react";
import Cookies from 'js-cookie';

//import { GridContextProvider } from "react-grid-dnd";

// Helper functions

function move(array, oldIndex, newIndex) {
  if (newIndex >= array.length) {
    newIndex = array.length - 1;
  }
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  return array;
}

function moveElement(array, index, offset) {
  const newIndex = index + offset;

  return move(array, index, newIndex);
}

/*function findIndexofItems(i, items_copy, cookie_items) {
  return items_copy.findIndex(item => item.id === cookie_items[i].id) 
}*/

// Context

const GridContext = createContext({ items: [] });

export class GridProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      moveItem: this.moveItem,
      setItems: this.setItems
    };
  }

  render() {
    return (
      <GridContext.Provider value={this.state}>
        {this.props.children}
      </GridContext.Provider>
    );
  }

  setItems = items => {
    if(!Cookies.get('idList') && items){
      this.setState({items})
    }
    else{
      var i, j
      var items_copy = items.slice()
      //retreive cookie
      var cookie_idList = JSON.parse(Cookies.get('idList'));
      var myArr = []
      //reorder items based on cookie_idList
      for(i in cookie_idList){
         for(j in items_copy){
            const itemID = items_copy[j].id
            const cookieID = cookie_idList[i]
            if(itemID === cookieID){
               myArr.push(items_copy[j])
               items_copy.splice(j,1)
            }
          }
        }
      }
      for(i in items_copy){myArr.push(items_copy[i])}
      if(myArr){
         this.setState({items: myArr})
      }
  };

  moveItem = (sourceId, destinationId) => {
    const sourceIndex = this.state.items.findIndex(
      item => item.id === sourceId
    );
    const destinationIndex = this.state.items.findIndex(
      item => item.id === destinationId
    );

    // If source/destination is unknown, do nothing.
    if (sourceId === -1 || destinationId === -1) {
      return;
    }

    const offset = destinationIndex - sourceIndex;

    this.setState(state => ({
      items: moveElement(state.items, sourceIndex, offset)
    }));

    //store items in cookie
    var i
    var idList = []
    for(i in this.state.items){
       idList.push(this.state.items[i].id)
    }
    Cookies.set('idList', idList)
  };
}

export default GridContext;
