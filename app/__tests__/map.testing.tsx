import React from 'react';
import { render } from '@testing-library/react-native';
import MapScreen from '../(tabs)/map'; // Adjust the import path as necessary

describe('MapScreen', () => {
  it('renders the map successfully', () => {
    // Render the MapScreen component
    const { getByTestId } = render(<MapScreen />);

    // Check if the MapView component is rendered
    const mapView = getByTestId('map-view');
    expect(mapView).toBeTruthy();
  });
});
