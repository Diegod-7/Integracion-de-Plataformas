import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <nav class="navbar">
      <div class="container">
        <a class="brand" href="/">Ferremas</a>
        <ul class="nav-links">
          <li><a routerLink="/products">Productos</a></li>
          <li><a href="#">Carrito</a></li>
        </ul>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .navbar {
      background-color: #333;
      padding: 1rem 0;
      color: white;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: bold;
    }
    .nav-links {
      list-style: none;
      display: flex;
      gap: 2rem;
      margin: 0;
      padding: 0;
    }
    .nav-links a {
      color: white;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .nav-links a:hover {
      color: #4CAF50;
    }
  `]
})
export class AppComponent {
  title = 'Ferremas';
} 