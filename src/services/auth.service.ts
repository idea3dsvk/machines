
import { Injectable, signal, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError, map, from, switchMap } from 'rxjs';
import { User } from '../models';
import { ApiService } from '../core/services/api.service';
import { SupabaseService } from '../core/services/supabase.service';
import { environment } from '../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(ApiService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  
  currentUser = signal<User | null>(null);

  constructor() {
    this.initializeAuth();
    this.setupAuthListener();
  }

  /**
   * Inicializovať autentifikáciu pri štarte aplikácie
   */
  private async initializeAuth(): Promise<void> {
    if (environment.enableMockData) {
      // Mock mode - použiť localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          this.currentUser.set(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          this.clearAuthData();
        }
      }
      return;
    }

    // Supabase mode - skontrolovať session
    try {
      const { data: { session } } = await this.supabaseService.auth.getSession();
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  /**
   * Nastaviť listener pre auth zmeny
   */
  private setupAuthListener(): void {
    if (environment.enableMockData) return;

    this.supabaseService.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser.set(null);
      }
    });
  }

  /**
   * Načítať používateľský profil z databázy
   */
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const user: User = {
          id: (data as any).id,
          email: (data as any).email,
          role: (data as any).role,
        };
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  /**
   * Prihlásenie používateľa s emailom a heslom
   */
  loginWithEmail(email: string, password: string): Observable<boolean> {
    console.log('loginWithEmail() called with email:', email);
    console.log('enableMockData:', environment.enableMockData);
    
    // Pre development môžeme používať mock prihlásenie
    if (environment.enableMockData) {
      console.log('Using mock login');
      const role = email.includes('admin') ? 'admin' : 'technician';
      return this.mockLogin(role);
    }

    return this.performSupabaseLogin(email, password);
  }

  /**
   * Prihlásenie používateľa (legacy metóda pre spätnu kompatibilitu)
   */
  login(role: 'admin' | 'technician', password?: string): Observable<boolean> {
    console.log('login() called with role:', role);
    console.log('enableMockData:', environment.enableMockData);
    
    // Pre development môžeme používať mock prihlásenie
    if (environment.enableMockData) {
      console.log('Using mock login');
      return this.mockLogin(role);
    }

    // Supabase Auth
    const email = `${role}@example.com`;
    const pwd = password || 'password123';
    
    return this.performSupabaseLogin(email, pwd);
  }

  /**
   * Vykonať Supabase prihlásenie
   */
  private performSupabaseLogin(email: string, password: string): Observable<boolean> {
    
    console.log('Attempting Supabase login with email:', email);
    
    // Použiť direct fetch pretože Supabase JS klient má problém s promise resolution
    const loginPromise = fetch(`${environment.supabase.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': environment.supabase.anonKey,
      },
      body: JSON.stringify({
        email,
        password: password,
      }),
    })
      .then(async res => {
        console.log('Supabase API response:', res.status);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error_description || data.msg || 'Login failed');
        }
        
        console.log('Login successful, user:', data.user);
        
        // Uložiť tokeny do localStorage
        console.log('Storing tokens in localStorage...');
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
        }));
        
        // Načítať user profile priamo cez fetch (pretože Supabase klient nefunguje)
        console.log('Loading user profile for ID:', data.user.id);
        try {
          const profileRes = await fetch(`${environment.supabase.url}/rest/v1/users?id=eq.${data.user.id}`, {
            headers: {
              'apikey': environment.supabase.anonKey,
              'Authorization': `Bearer ${data.access_token}`,
            },
          });
          
          const profiles = await profileRes.json();
          console.log('Profile response:', profiles);
          
          if (profiles && profiles.length > 0) {
            const profile = profiles[0];
            const user: User = {
              id: profile.id,
              email: profile.email,
              role: profile.role,
            };
            this.currentUser.set(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('User profile loaded:', user);
          } else {
            console.warn('No profile found, using data from auth user_metadata');
            // Získať rolu z user metadata
            const userRole = data.user.user_metadata?.role || data.user.raw_user_meta_data?.role || 'technician';
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              role: userRole,
            };
            this.currentUser.set(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
          // Fallback - použiť rolu z user metadata
          const userRole = data.user.user_metadata?.role || data.user.raw_user_meta_data?.role || 'technician';
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            role: userRole,
          };
          this.currentUser.set(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        
        return true;
      })
      .catch(error => {
        console.error('Login error:', error);
        throw error;
      });

    return from(loginPromise).pipe(
      tap(success => {
        if (success) {
          // Navigovať na dashboard po úspešnom prihlásení
          console.log('Login successful, navigating to dashboard...');
          console.log('Current user:', this.currentUser());
          // Použiť NgZone pre správnu detekciu zmien
          this.ngZone.run(() => {
            this.router.navigate(['/dashboard']).then(() => {
              console.log('Navigation completed');
            });
          });
        }
      }),
      catchError(error => {
        console.error('Login catchError:', error);
        return of(false);
      })
    );
  }

  /**
   * Registrácia nového používateľa (iba pre Supabase)
   */
  signUp(email: string, password: string, role: 'admin' | 'technician'): Observable<boolean> {
    if (environment.enableMockData) {
      return of(false);
    }

    return from(
      this.supabaseService.auth.signUp({
        email,
        password,
      })
    ).pipe(
      tap(async ({ data, error }) => {
        if (error) throw error;
        
        // Vytvoriť profil v users tabuľke
        if (data.user) {
          await this.supabaseService.db.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
            role: role,
          } as any);
          
          await this.loadUserProfile(data.user.id);
        }
      }),
      map(({ error }) => !error),
      catchError(error => {
        console.error('Sign up error:', error);
        return of(false);
      })
    );
  }

  /**
   * Mock prihlásenie pre development
   */
  private mockLogin(role: 'admin' | 'technician'): Observable<boolean> {
    const user: User = {
      id: role === 'admin' ? '1' : '2',
      email: `${role}@example.com`,
      role: role,
    };
    
    const mockToken = this.generateMockToken(user);
    
    this.currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem(environment.jwtTokenKey, mockToken);
    
    this.router.navigateByUrl('/dashboard');
    return of(true);
  }



  /**
   * Odhlásenie používateľa
   */
  logout(): Observable<void> {
    console.log('🚪 Logging out...');
    
    if (environment.enableMockData) {
      this.clearAuthData();
      return of(undefined);
    }

    // Direct fetch workaround pre Supabase logout
    const token = localStorage.getItem('supabase.auth.token');
    
    if (!token) {
      console.log('No token found, clearing auth data');
      this.clearAuthData();
      return of(undefined);
    }

    const tokenData = JSON.parse(token);
    
    // Volať Supabase logout endpoint
    return from(
      fetch(`${environment.supabase.url}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': environment.supabase.anonKey,
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })
      .then(res => {
        console.log('📥 Logout response status:', res.status);
        // Logout endpoint môže vrátiť 204 No Content alebo iný status
        if (res.status === 204 || res.ok) {
          console.log('✅ Successfully logged out from Supabase');
        } else {
          console.warn('⚠️ Logout returned non-success status, but will clear local data anyway');
        }
      })
      .catch(error => {
        console.error('❌ Logout error:', error);
        // Aj keď zlyhá network request, vymažeme lokálne dáta
      })
    ).pipe(
      tap(() => this.clearAuthData()),
      map(() => undefined),
      catchError(() => {
        this.clearAuthData();
        return of(undefined);
      })
    );
  }

  /**
   * Vymazať autentifikačné dáta
   */
  private clearAuthData(): void {
    console.log('🧹 Clearing auth data');
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('supabase.auth.token');
    console.log('➡️ Redirecting to login');
    this.router.navigateByUrl('/login');
  }

  /**
   * Vygenerovať mock JWT token pre development
   */
  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hodín
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Kontrola či je používateľ admin
   */
  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  /**
   * Kontrola či je používateľ prihlásený
   */
  async isAuthenticated(): Promise<boolean> {
    if (environment.enableMockData) {
      return !!this.currentUser();
    }

    const { data } = await this.supabaseService.auth.getSession();
    return !!data.session;
  }
}
