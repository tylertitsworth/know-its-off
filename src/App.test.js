/****************************************************************************************************
 * FILENAME: App.test.js
 * DESCRIPTION: App testing environment
 * AUTHOR(S): Capstone 2019-2020
 * NOTES: Depreciated, run yarn test to use this file
 ****************************************************************************************************/
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
