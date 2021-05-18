/****************************************************************************************************
 * FILENAME: GridApp.js
 * DESCRIPTION: Generate a grid instance and map tiles for each device item
 * AUTHOR(S): Capstone 2019-2020
 * NOTES: All I did was change the item keys
 ****************************************************************************************************/
import React, { useContext} from "react";
import DragItem from "./DragItem";
import { Grid, GridItem } from "./Grid";
import GridContext from "./GridContext";
import Tile from "../tile.js";

function GridApp(props) {
  const {items, moveItem} = useContext(GridContext);

  return (
    <div className="GridApp">
      <Grid>
        {items.map(item => (
          <DragItem key={item.id} id={item.id} onMoveItem={moveItem}>
            <GridItem>
              <Tile key={item.id} device_id={item.id} device_battery={item.device_battery} appliance_name={item.appliance_name} state={item.device_state} timestamp={item.timestamp} />
            </GridItem>
          </DragItem>
        ))}
      </Grid>
    </div>
  );
}

export default GridApp;
