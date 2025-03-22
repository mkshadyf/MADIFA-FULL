/**
 * User Interactions Service
 * 
 * This file exports functions from the user service to maintain
 * backward compatibility with components using the older API.
 */

import { userService } from './user/user-service';
import type { Content } from '@/types/content';

// Export individual functions for direct imports
export function toggleFavorite(userId: string, contentId: string): Promise<boolean> {
  return userService.toggleFavorite(contentId, userId);
}

export function toggleWatchlist(userId: string, contentId: string): Promise<boolean> {
  return userService.toggleWatchlist(contentId, userId);
}

export function rateContent(userId: string, contentId: string, rating: number): Promise<void> {
  return userService.rateContent(contentId, userId, rating);
}

export function getUserFavorites(userId: string): Promise<Content[]> {
  return userService.getUserFavorites(userId);
}

export function getUserWatchlist(userId: string): Promise<Content[]> {
  return userService.getUserWatchlist(userId);
}

export function getUserRatings(userId: string): Promise<{
  content_id: string;
  title: string;
  rating: number;
  rated_at: string;
}[]> {
  return userService.getUserRatings(userId);
}

export function getContentInteractions(
  userId: string,
  contentId: string
): Promise<{
  isFavorite: boolean;
  isWatchlisted: boolean;
  rating: number | null;
}> {
  return userService.getContentInteractions(contentId, userId)
    .then(result => ({
      isFavorite: result.favorite || false,
      isWatchlisted: result.watchlist || false,
      rating: result.rating || null
    }));
}

// Create a service object that matches what components expect
export const userInteractionsService = {
  toggleFavorite,
  toggleWatchlist,
  rateContent,
  getUserFavorites,
  getUserWatchlist,
  getUserRatings,
  getContentInteractions
};
