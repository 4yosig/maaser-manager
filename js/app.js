/**
 * Main App Module - Orchestrates the entire application
 */

import { Database } from './db.js';
import { MaaserCalculator } from './calculations.js';
import { UI } from './ui.js';

export class App {
  constructor() {
    this.db = new Database();
    this.calculator = new MaaserCalculator(this.db);
    this.ui = new UI(this);
    this.initialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing Maaser Manager...');
      
      // Initialize database
      await this.db.init();
      console.log('Database initialized');
      
      // Ensure current month debt exists
      const settings = await this.db.getAll('settings');
      await this.calculator.ensureCurrentMonthDebt(settings);
      
      // Recalculate all balances
      await this.calculator.recalculateAllBalances();
      
      // Render navigation
      const navHtml = this.ui.renderNav();
      document.body.insertAdjacentHTML('beforeend', navHtml);
      
      // Show default screen
      await this.ui.showScreen('dashboard');
      
      this.initialized = true;
      console.log('Maaser Manager initialized successfully');
      
      // Setup periodic balance recalculation
      this.setupPeriodicTasks();
      
    } catch (error) {
      console.error('Error initializing app:', error);
      this.ui.showToast('שגיאה בטעינת האפליקציה', 'error');
    }
  }

  /**
   * Setup periodic background tasks
   */
  setupPeriodicTasks() {
    // Check for new month every hour
    setInterval(async () => {
      const settings = await this.db.getAll('settings');
      await this.calculator.ensureCurrentMonthDebt(settings);
      await this.calculator.recalculateAllBalances();
    }, 60 * 60 * 1000); // Every hour
  }
}

// Export for use in HTML
export default App;
