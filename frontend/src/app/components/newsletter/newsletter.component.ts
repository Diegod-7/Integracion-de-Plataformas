import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="newsletter-container">
      <h2>Suscríbete !</h2>
      <p class="description">
        Suscríbete ingresando tu correo para que puedas recibir de forma automática todo nuestro catálogo de ofertas semanales
      </p>
      
      <div class="form-container">
        <input 
          type="email" 
          [(ngModel)]="email" 
          placeholder="INGRESAR CORREO"
          class="email-input"
          [class.error]="showError"
        >
        <button (click)="onSubmit()" class="submit-button">
          Recibir ofertas
        </button>
      </div>

      <div *ngIf="showSuccess" class="success-message">
        ¡Gracias por suscribirte! Recibirás nuestras ofertas semanalmente.
      </div>

      <div *ngIf="showError" class="error-message">
        Por favor, ingresa un correo electrónico válido.
      </div>

      <div class="social-links">
        <p>Síguenos también en nuestras redes sociales</p>
        <div class="social-icons">
          <a href="#" target="_blank"><i class="fab fa-instagram"></i></a>
          <a href="#" target="_blank"><i class="fab fa-facebook"></i></a>
          <a href="#" target="_blank"><i class="fab fa-twitter"></i></a>
          <a href="#" target="_blank"><i class="far fa-envelope"></i></a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .newsletter-container {
      background-color: #f8f9fa;
      padding: 2rem;
      text-align: center;
      border-radius: 8px;
      max-width: 600px;
      margin: 2rem auto;
    }

    h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .description {
      color: #666;
      margin-bottom: 2rem;
    }

    .form-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      justify-content: center;
    }

    .email-input {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 300px;
      font-size: 1rem;
    }

    .email-input.error {
      border-color: #dc3545;
    }

    .submit-button {
      padding: 0.75rem 1.5rem;
      background-color: #000;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
    }

    .submit-button:hover {
      background-color: #333;
    }

    .success-message {
      color: #28a745;
      margin: 1rem 0;
    }

    .error-message {
      color: #dc3545;
      margin: 1rem 0;
    }

    .social-links {
      margin-top: 2rem;
      border-top: 1px solid #ddd;
      padding-top: 1rem;
    }

    .social-links p {
      color: #666;
      margin-bottom: 1rem;
    }

    .social-icons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
    }

    .social-icons a {
      color: #333;
      font-size: 1.5rem;
      transition: color 0.3s;
    }

    .social-icons a:hover {
      color: #666;
    }
  `]
})
export class NewsletterComponent {
  email: string = '';
  showSuccess: boolean = false;
  showError: boolean = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.showError = false;
    this.showSuccess = false;

    if (!this.isValidEmail(this.email)) {
      this.showError = true;
      return;
    }

    // Aquí puedes agregar la lógica para enviar el correo al backend
    this.http.post('http://localhost:3000/api/newsletter/subscribe', { email: this.email })
      .subscribe({
        next: () => {
          this.showSuccess = true;
          this.email = '';
        },
        error: () => {
          this.showError = true;
        }
      });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  }
} 