declare module 'md5' {
  function md5(value: string): string;
  export = md5;
}

declare module '@sentry/react' {
  export interface SentryOptions {
    dsn: string;
    environment?: string;
    release?: string;
    debug?: boolean;
    tracesSampleRate?: number;
    integrations?: SentryIntegration[];
  }
  
  export interface SentryIntegration {
    name: string;
    [key: string]: string | number | boolean | object | null | undefined;
  }
  
  export function init(options: SentryOptions): void;
  export function captureException(error: Error): void;
  export function captureMessage(message: string, level?: string): void;
  export function setUser(user: { id?: string; email?: string; username?: string } | null): void;
  export const Integrations: Record<string, SentryIntegration>;
}

declare module '@stripe/stripe-js' {
  export interface Stripe {
    paymentRequest(options: unknown): unknown;
    redirectToCheckout(options: unknown): Promise<{ error?: { message: string } }>;
    confirmCardPayment(clientSecret: string, data: unknown): Promise<unknown>;
  }
  
  export function loadStripe(publishableKey: string): Promise<Stripe>;
}

declare module 'stripe' {
  namespace Stripe {
    interface Customer {
      id: string;
      email: string;
      name?: string;
      metadata: Record<string, string>;
    }

    interface Subscription {
      id: string;
      customer: string;
      status: string;
      items: {
        data: Array<{
          id: string;
          price: Price;
        }>;
      };
    }

    interface Price {
      id: string;
      product: string;
      unit_amount: number;
      currency: string;
    }

    interface PaymentMethod {
      id: string;
      type: string;
      card?: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
      };
      metadata?: Record<string, string>;
    }

    interface Invoice {
      id: string;
      subscription: string | null;
      customer: string;
      amount_paid: number;
      currency: string;
      status: string;
      created: number;
      due_date: number | null;
      status_transitions: {
        paid_at: number | null;
      };
      hosted_invoice_url: string | null;
      lines: {
        data: Array<{
          description: string | null;
          amount: number;
          period: {
            start: number;
            end: number;
          };
        }>;
      };
    }

    interface PaymentIntent {
      id: string;
      status: string;
      client_secret: string;
    }

    interface SetupIntent {
      id: string;
      status: string;
      client_secret: string;
    }

    interface Event {
      id: string;
      type: string;
      data: {
        object: unknown;
      };
    }
  }

  export default class Stripe {
    constructor(apiKey: string, options?: Record<string, unknown>);
    customers: {
      create(params?: Record<string, unknown>): Promise<{ id: string }>;
      update(customerId: string, params?: Record<string, unknown>): Promise<Stripe.Customer>;
      retrieve(customerId: string): Promise<Stripe.Customer>;
    };
    subscriptions: {
      create(params?: Record<string, unknown>): Promise<Stripe.Subscription>;
      update(subscriptionId: string, params?: Record<string, unknown>): Promise<Stripe.Subscription>;
      retrieve(subscriptionId: string): Promise<Stripe.Subscription>;
      list(params?: Record<string, unknown>): Promise<{ data: Stripe.Subscription[] }>;
    };
    invoices: {
      retrieve(invoiceId: string): Promise<Stripe.Invoice>;
      list(params?: Record<string, unknown>): Promise<{ data: Stripe.Invoice[] }>;
    };
    paymentMethods: {
      attach(paymentMethodId: string, params?: Record<string, unknown>): Promise<Stripe.PaymentMethod>;
      detach(paymentMethodId: string): Promise<Stripe.PaymentMethod>;
      list(params?: Record<string, unknown>): Promise<{ data: Stripe.PaymentMethod[] }>;
    };
  }
}

/**
 * PayFast module declarations
 */
declare module 'payfast' {
  namespace PayFast {
    interface Customer {
      id: string;
      email: string;
      name?: string;
      metadata?: Record<string, string>;
    }

    interface Subscription {
      id: string;
      token: string;
      customer: string;
      status: string;
      amount: number;
      currency: string;
      frequency: number; // 3 for monthly, 6 for annual
      billing_date: string;
      custom_str1?: string; // User ID
      custom_str2?: string; // Plan ID
    }

    interface PaymentNotification {
      m_payment_id: string;
      pf_payment_id: string;
      payment_status: string;
      item_name: string;
      amount_gross: string;
      amount_fee: string;
      amount_net: string;
      custom_str1?: string; // User ID
      custom_str2?: string; // Plan ID
      token?: string; // Token for recurring billing
    }

    interface Payment {
      status: string;
      token?: string;
      reference: string;
    }

    interface Invoice {
      id: string;
      reference: string;
      status: string;
      amount: number;
      created: string;
      paid_at?: string;
    }
  }

  export interface PayFastConfig {
    merchant_id: string;
    merchant_key: string;
    passphrase?: string;
    return_url?: string;
    cancel_url?: string;
    notify_url?: string;
    sandbox?: boolean;
  }

  export interface PaymentResponse {
    success: boolean;
    url?: string;
    error?: string;
  }

  export default class PayFast {
    constructor(config: PayFastConfig);
    
    createPayment(params: Record<string, string | number>): PaymentResponse;
    
    validateNotification(data: Record<string, string>): boolean;
    
    cancelSubscription(token: string): Promise<boolean>;
  }
}

declare module 'express' {
  export interface Request {
    user?: { id: string; email: string }
    session?: Record<string, unknown>
    body: Record<string, unknown>
    params: Record<string, string>
    query: Record<string, string | string[]>
    headers: Record<string, string | string[] | undefined>
  }

  export interface Response {
    status(code: number): Response
    json(data: unknown): void
    send(data: unknown): void
    end(): void
    setHeader(name: string, value: string): Response
  }

  export interface NextFunction {
    (err?: Error): void
  }
}

declare module 'express-rate-limit' {
  interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string | object;
    statusCode?: number;
    headers?: boolean;
    keyGenerator?: (req: Request) => string;
    skip?: (req: Request) => boolean;
  }
  function rateLimit(options?: RateLimitOptions): unknown;
  export = rateLimit;
}

declare module 'helmet' {
  interface HelmetOptions {
    contentSecurityPolicy?: boolean | object;
    crossOriginEmbedderPolicy?: boolean | object;
    crossOriginOpenerPolicy?: boolean | object;
    crossOriginResourcePolicy?: boolean | object;
    dnsPrefetchControl?: boolean | object;
    expectCt?: boolean | object;
    frameguard?: boolean | object;
    hidePoweredBy?: boolean | object;
    hsts?: boolean | object;
    ieNoOpen?: boolean | object;
    noSniff?: boolean | object;
    originAgentCluster?: boolean | object;
    permittedCrossDomainPolicies?: boolean | object;
    referrerPolicy?: boolean | object;
    xssFilter?: boolean | object;
  }
  function helmet(options?: HelmetOptions): unknown;
  export = helmet;
}

declare module 'next' {
  export interface NextApiRequest {
    body: Record<string, unknown>;
    query: Record<string, string | string[]>;
    cookies: Record<string, string>;
    headers: Record<string, string | string[]>;
    method: string;
  }

  export interface NextApiResponse {
    status(code: number): NextApiResponse;
    json(data: unknown): void;
    send(data: unknown): void;
    end(): void;
  }
}

declare module 'next/headers' {
  interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }
  
  export function cookies(): {
    get(name: string): { value: string } | undefined;
    getAll(): Array<{ name: string; value: string }>;
    set(name: string, value: string, options?: CookieOptions): void;
  };
  export function headers(): Headers;
}

declare module '@supabase/auth-helpers-nextjs' {
  interface ClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    global?: {
      headers?: Record<string, string>;
    };
  }
  
  export function createServerComponentClient(options: { cookies: () => { get: (name: string) => { value: string } | undefined } }): unknown;
  export function createRouteHandlerClient(options: { cookies: () => { get: (name: string) => { value: string } | undefined } }): unknown;
  export function createMiddlewareClient(options: { req: Request; res: Response }): unknown;
}

declare module 'next/server' {
  export interface NextRequest extends Request {
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string, options?: Record<string, unknown>): void;
    };
    nextUrl: URL;
  }

  export interface ResponseInit {
    status?: number;
    headers?: Record<string, string> | Headers;
    statusText?: string;
  }

  export class NextResponse extends Response {
    static json(body: unknown, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: ResponseInit): NextResponse;
    static rewrite(url: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
}

declare module 'next/router' {
  export interface Router {
    push(url: string, as?: string, options?: Record<string, unknown>): Promise<boolean>;
    replace(url: string, as?: string, options?: Record<string, unknown>): Promise<boolean>;
    prefetch(url: string, as?: string, options?: Record<string, unknown>): Promise<void>;
    back(): void;
    reload(): void;
    query: Record<string, string | string[] | undefined>;
    pathname: string;
    asPath: string;
    events: {
      on(event: string, handler: (...args: unknown[]) => void): void;
      off(event: string, handler: (...args: unknown[]) => void): void;
    };
  }

  export function useRouter(): Router;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(url: string): void;
    replace(url: string): void;
    refresh(): void;
    back(): void;
    forward(): void;
  };

  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module 'next/link' {
  import type { ComponentType, ReactNode } from 'react';

  interface LinkProps {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
  }

  const Link: ComponentType<LinkProps>;
  export default Link;
}

// User Interactions Module
declare module '@/lib/services/user-interactions' {
  import type { Content } from '@/types/content';
  
  export function toggleFavorite(userId: string, contentId: string): Promise<boolean>;
  export function toggleWatchlist(userId: string, contentId: string): Promise<boolean>;
  export function rateContent(userId: string, contentId: string, rating: number): Promise<void>;
  export function getUserFavorites(userId: string): Promise<Content[]>;
  export function getUserWatchlist(userId: string): Promise<Content[]>;
  export function getUserRatings(userId: string): Promise<{
    content_id: string;
    title: string;
    rating: number;
    rated_at: string;
  }[]>;
  export function getContentInteractions(
    userId: string,
    contentId: string
  ): Promise<{
    isFavorite: boolean;
    isWatchlisted: boolean;
    rating: number | null;
  }>;
  
  export const userInteractionsService: {
    toggleFavorite: typeof toggleFavorite;
    toggleWatchlist: typeof toggleWatchlist;
    rateContent: typeof rateContent;
    getUserFavorites: typeof getUserFavorites;
    getUserWatchlist: typeof getUserWatchlist;
    getUserRatings: typeof getUserRatings;
    getContentInteractions: typeof getContentInteractions;
  };
}