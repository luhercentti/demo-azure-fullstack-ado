import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';

// Mock fetch globally
global.fetch = jest.fn();

// Setup and teardown
beforeEach(() => {
  fetch.mockClear();
  fetch.mockReset();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('App Component', () => {
  test('renders user management title', async () => {
    // Mock the initial fetch call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce([])
    });
    
    render(<App />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  test('displays users after loading', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];
    
    // Mock the fetch call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockUsers)
    });

    render(<App />);
    
    // Wait for loading to complete first
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Then check for the user data
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('creates new user on form submit', async () => {
    // Mock the initial fetch for users (empty array)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce([])
    });

    render(<App />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify initial state
    expect(screen.getByText('User Management')).toBeInTheDocument();
    
    // Clear the fetch mock after initial load
    fetch.mockClear();
    
    // Mock the POST request (create user)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ 
        id: 1, 
        name: 'Test User', 
        email: 'test@example.com' 
      })
    });
    
    // Mock the subsequent GET request (fetch users after create)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce([
        { id: 1, name: 'Test User', email: 'test@example.com' }
      ])
    });
    
    // Fill out the form
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email');
    const submitButton = screen.getByText('Add User');
    
    fireEvent.change(nameInput, {
      target: { value: 'Test User' }
    });
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });
    
    // Submit the form
    fireEvent.click(submitButton);

    // Wait for the requests to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    }, { timeout: 5000 });

    // Verify the POST request was made correctly
    expect(fetch).toHaveBeenNthCalledWith(1, 'http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@example.com' })
    });

    // Verify the GET request was made (refetch users)
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://localhost:5000/api/users');

    // Verify form fields are cleared
    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
    }, { timeout: 5000 });
  });
});