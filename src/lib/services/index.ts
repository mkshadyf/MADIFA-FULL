/**
 * Service Registry
 * 
 * This file serves as a central registry for all services in the application.
 * It ensures that services are instantiated as singletons and provides a unified
 * access point for all service functionality.
 */

// Import service instances
import { createClient } from '../supabase/client';
import { analyticsService } from './analytics';
import { contentService } from './content';
import { downloadsManager } from './downloads';
import { errorMonitoring } from './error-monitoring';
import { moderationService } from './moderation';
import { getNotifications, sendNotification } from './notifications';
import { paymentService } from './payment';
import { permissionService } from './permissions';
import { getSearchSuggestions, searchContent } from './search';
import { storageQuotaManager } from './storage-quota';
import { subscriptionService } from './subscription';
import { userService } from './user';
import { vimeoService } from './vimeo';

// Create the service registry
export const services = {
  // Core services
  supabase: createClient(),
  error: errorMonitoring,

  // Content services
  content: contentService,
  vimeo: vimeoService,
  search: {
    searchContent,
    getSearchSuggestions
  },

  // User services
  user: userService,
  permissions: permissionService,

  // Subscription services
  subscription: subscriptionService,
  payment: paymentService,

  // Storage services
  quota: storageQuotaManager,
  downloads: downloadsManager,

  // Notification services
  notifications: {
    getNotifications,
    sendNotification
  },

  // Other services
  moderation: moderationService,
  analytics: analyticsService
};

// Type for the service registry
export type ServiceRegistry = typeof services;

/**
 * Hook to access services within components
 * Usage:
 * const { content, vimeo } = useServices();
 */
export function useServices(): ServiceRegistry {
  return services;
}

// Re-export services selectively to avoid naming conflicts
export { analyticsService } from './analytics';
export { contentService } from './content';
export { downloadsManager } from './downloads';
export { errorMonitoring } from './error-monitoring';
export { moderationService } from './moderation';
export { getNotifications, sendNotification } from './notifications';
export { paymentService } from './payment';
export { permissionService } from './permissions';
export { getSearchSuggestions, searchContent } from './search';
export { storageQuotaManager } from './storage-quota';
export { subscriptionService } from './subscription';
export { userService } from './user';
export { vimeoService } from './vimeo';

