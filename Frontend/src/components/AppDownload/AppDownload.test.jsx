import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import AppDownload from './AppDownload';

describe('AppDownload Component', () => {
  test('renders component with heading', () => {
    // Arrange & Act
    render(<AppDownload />);
    
    // Assert
    expect(screen.getByText('Download Our Mobile App')).toBeInTheDocument();
  });

  test('renders description text', () => {
    // Arrange & Act
    render(<AppDownload />);
    
    // Assert
    expect(screen.getByText(/For better experience download/i)).toBeInTheDocument();
    expect(screen.getByText(/Available on both iOS and Android/i)).toBeInTheDocument();
  });

  test('renders app store images', () => {
    // Arrange & Act
    render(<AppDownload />);
    
    // Assert
    const playStoreImage = screen.getByAltText('Get it on Google Play');
    const appStoreImage = screen.getByAltText('Download on the App Store');
    expect(playStoreImage).toBeInTheDocument();
    expect(appStoreImage).toBeInTheDocument();
  });

  test('has correct id for navigation', () => {
    // Arrange
    const { container } = render(<AppDownload />);
    
    // Assert
    const appDownloadDiv = container.querySelector('#app-download');
    expect(appDownloadDiv).toBeInTheDocument();
  });
});