import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileEditPage from '../(tabs)/profile';

describe('ProfileEditPage', () => {
  it('should render input fields correctly when in edit mode', () => {
    const { getByText, getByPlaceholderText } = render(<ProfileEditPage />);

    // Simulate pressing the edit button to enter edit mode
    fireEvent.press(getByText('Edit Profile'));

    // Check if the input fields are rendered
    expect(getByPlaceholderText('Enter full name')).toBeTruthy();
    expect(getByPlaceholderText('Enter height')).toBeTruthy();
    expect(getByPlaceholderText('Enter weight')).toBeTruthy();
    expect(getByPlaceholderText('Enter your phone number')).toBeTruthy();
    expect(getByPlaceholderText('Enter your address')).toBeTruthy();
  });
});
