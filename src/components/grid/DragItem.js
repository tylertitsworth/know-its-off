/****************************************************************************************************
 * FILENAME: DragItem.js
 * DESCRIPTION: Enable Tile dragging within the Drag-n-Drop Grid Context
 * AUTHOR(S): Capstone 2019-2020
 * NOTES: I wish it had comments so I knew what was going on. It looks like it enables drag properties, 
 * but it's not clear how to customize this to increase clarity in dnd mechanics
 * A change was made 05/10/21 to 
 ****************************************************************************************************/
import React, { memo, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

const DragItem = memo(({ id, onMoveItem, children }) => {
  const ref = useRef(null);

  const [{ isDragging }, connectDrag] = useDrag({ // https://github.com/react-dnd/react-dnd/releases/tag/v14.0.0
    type: "IMG",
    item: () => ({id}),
    collect: monitor => {
      return {
        isDragging: monitor.isDragging()
      };
    }
  });

  const [, connectDrop] = useDrop({
    accept: "IMG",
    hover(hoveredOverItem) {
      if (hoveredOverItem.id !== id) {
        onMoveItem(hoveredOverItem.id, id);
      }
    }
  });

  connectDrag(ref);
  connectDrop(ref);

  const opacity = isDragging ? 0.5 : 1;
  const containerStyle = { opacity };

  return React.Children.map(children, child =>
    React.cloneElement(child, {
      forwardedRef: ref,
      style: containerStyle
    })
  );
});

export default DragItem;
