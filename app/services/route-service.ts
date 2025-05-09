export const routeService = {
  // ... existing methods ...

  async findRoutes(origin: string, destination: string): Promise<Route[]> {
    try {
      const response = await fetch(
        `/api/routes/search?origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(destination)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search routes');
      }

      return response.json();
    } catch (error) {
      console.error('Error searching routes:', error);
      throw error;
    }
  }
};
