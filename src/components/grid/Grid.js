/****************************************************************************************************
 * FILENAME: Grid.jss
 * DESCRIPTION: Declares parameters of grid for styling purposes
 * AUTHOR(S): Capstone 2019-2020
 * NOTES: This is depreciated
 ****************************************************************************************************/
import React from "react";
import styled from "styled-components";

export const Grid = styled.div`
  width: 100%;
  padding: 0px 10px 0px 10px;
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
`;

/*export const GridImage = styled.div`
  flex-grow: 1;
  border: 1px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: ${props => `url("${props.src}")`};
  background-size: cover;
  background-position: 50%;
`;*/

const GridItemWrapper = styled.div`
  flex: 0 0 25%;
  flex-grow: 0.75;
  min-width: 250px;
  max-width: 500px;
  max-height: 270px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  box-sizing: border-box;
  :before {
    content: "";
    display: table;
    padding-top: 100%;
  }
`;

export const GridItem = ({ forwardedRef, ...props }) => (
  <GridItemWrapper ref={forwardedRef} {...props} />
);
