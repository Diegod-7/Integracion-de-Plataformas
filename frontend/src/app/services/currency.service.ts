import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private DEFAULT_RATE = 850; // Valor predeterminado para 1 USD = 850 CLP
  private cachedExchangeRate: number | null = null;
  private lastFetchTime: number = 0;
  private CACHE_DURATION = 3600000; // 1 hora en milisegundos

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la tasa de cambio actual de USD a CLP
   * Utiliza caché para evitar llamadas frecuentes a la API
   */
  getExchangeRate(): Observable<number> {
    const now = Date.now();
    
    // Si tenemos una tasa en caché y no ha pasado más de una hora, usarla
    if (this.cachedExchangeRate && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      console.log(`Usando tasa de cambio en caché: ${this.cachedExchangeRate}`);
      return of(this.cachedExchangeRate);
    }
    
    // Obtener tasa actual desde la API
    return this.http.get<any>('https://open.er-api.com/v6/latest/USD')
      .pipe(
        map(response => {
          if (response && response.rates && response.rates.CLP) {
            const rate = response.rates.CLP;
            // Guardar en caché
            this.cachedExchangeRate = rate;
            this.lastFetchTime = now;
            console.log(`Nueva tasa de cambio obtenida: 1 USD = ${rate} CLP`);
            return rate;
          }
          console.log(`No se pudo obtener la tasa de cambio. Usando valor predeterminado: ${this.DEFAULT_RATE}`);
          return this.DEFAULT_RATE;
        }),
        catchError(error => {
          console.error('Error al obtener la tasa de cambio:', error);
          return of(this.DEFAULT_RATE);
        })
      );
  }

  /**
   * Convierte un monto de USD a CLP
   */
  convertUSDtoCLP(amountUSD: number): Observable<number> {
    return this.getExchangeRate().pipe(
      map(rate => Math.round(amountUSD * rate))
    );
  }

  /**
   * Formatea un número como moneda CLP
   */
  formatCLP(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
} 