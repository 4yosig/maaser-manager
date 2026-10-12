/**
 * UI Module - Handles rendering all screens and components
 */

import { formatDate, formatCurrency, formatMonthYear, getHebrewMonthName, isEmpty, generateId, exportToCSV, downloadFile, parseDate, getTodayFormatted } from './utils.js';

export class UI {
  constructor(app) {
    this.app = app;
    this.currentScreen = 'dashboard';
    this.appElement = document.getElementById('app');
    this.modalContainer = document.getElementById('modal-container');
    this.toastContainer = document.getElementById('toast-container');
  }

  /**
   * Show a screen
   */
  async showScreen(screenName) {
    this.currentScreen = screenName;
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-screen="${screenName}"]`)?.classList.add('active');
    
    // Render screen content
    const content = await this.renderScreen(screenName);
    this.appElement.innerHTML = content;
    
    // Attach event listeners after rendering
    this.attachScreenEvents(screenName);
  }

  /**
   * Render appropriate screen
   */
  async renderScreen(screenName) {
    switch (screenName) {
      case 'dashboard':
        return await this.renderDashboard();
      case 'add-donation':
        return await this.renderAddDonation();
      case 'history':
        return await this.renderHistory();
      case 'settings':
        return await this.renderSettings();
      default:
        return await this.renderDashboard();
    }
  }

  /**
   * Render Dashboard Screen
   */
  async renderDashboard() {
    const balance = await this.app.calculator.getCurrentBalance();
    const currentMonth = await this.app.calculator.getMonthSummary(
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    );
    const donations = await this.app.db.getAll('donations');
    const settings = await this.app.db.getAll('settings');
    
    // Get recent donations
    const recentDonations = donations
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    const balanceStatusClass = balance > 0 ? 'debt' : (balance < 0 ? 'excess' : '');
    const balanceStatus = balance > 0 ? 'חוב לתרומה' : (balance < 0 ? 'מקדמה / עודף תרומות' : 'אין חוב פתוח');
    const displayAmount = Math.abs(balance);
    
    const baseAmount = settings.find(s => s.key === 'baseMaaserAmount')?.value || 1000;
    
    let html = `
      <div class="screen">
        <div class="screen-content">
          <!-- Balance Card -->
          <div class="card balance-card ${balanceStatusClass}">
            <div class="balance-card-content">
              <div style="font-size: 14px; opacity: 0.9;">יתרת המעשר הנוכחית</div>
              <div class="balance-amount">${formatCurrency(displayAmount)}</div>
              <div class="balance-status">${balanceStatus}</div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">חוב החודש</div>
              <div class="stat-value">${formatCurrency(currentMonth?.totalDebt || baseAmount)}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">תרומות החודש</div>
              <div class="stat-value">${formatCurrency(currentMonth?.totalDonations || 0)}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">מספר תרומות</div>
              <div class="stat-value">${currentMonth?.donationCount || 0}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">יתרה מחודש קודם</div>
              <div class="stat-value">${formatCurrency(currentMonth?.openingBalance || 0)}</div>
            </div>
          </div>

          <!-- Add Donation Button -->
          <button class="btn btn-primary btn-block" style="margin-bottom: 24px; height: 50px; font-size: 18px;" onclick="window.app.ui.showScreen('add-donation')">
            ＋ הוספת תרומה
          </button>

          <!-- Recent Donations -->
          <div class="card">
            <h3 class="card-title">תרומות אחרונות</h3>
            ${recentDonations.length > 0 ? `
              <div>
                ${recentDonations.map(d => `
                  <div class="donation-item">
                    <div class="donation-info">
                      <div class="donation-beneficiary">${d.beneficiary}</div>
                      <div class="donation-date">${formatDate(d.date)}</div>
                    </div>
                    <div class="donation-amount">${formatCurrency(d.amount)}</div>
                  </div>
                `).join('')}
              </div>
              <button class="btn btn-secondary btn-block" onclick="window.app.ui.showScreen('history')" style="margin-top: 16px;">
                הצג את כל התרומות
              </button>
            ` : `
              <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">לא קיימות תרומות עדיין</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
    
    return html;
  }

  /**
   * Render Add Donation Screen
   */
  async renderAddDonation() {
    const categories = await this.app.db.getAll('categories');
    const beneficiaries = await this.getRecentBeneficiaries();
    
    const todayFormatted = getTodayFormatted();
    
    const paymentMethods = [
      'העברה בנקאית',
      'אשראי',
      'מזומן',
      'הוראת קבע',
      'לא צוין'
    ];
    
    let html = `
      <div class="screen no-bottom-padding">
        <div class="screen-content">
          <h1 style="margin-bottom: 24px;">הוספת תרומה</h1>
          
          <div class="card">
            <form id="donation-form">
              <!-- Amount -->
              <div class="form-group">
                <label for="amount">סכום (₪) *</label>
                <input 
                  type="number" 
                  id="amount" 
                  name="amount" 
                  placeholder="0.00" 
                  step="0.01" 
                  min="0"
                  required
                >
              </div>

              <!-- Beneficiary -->
              <div class="form-group">
                <label for="beneficiary">למי / מוטב *</label>
                <input 
                  type="text" 
                  id="beneficiary" 
                  name="beneficiary" 
                  placeholder="שם המוטב"
                  list="beneficiary-list"
                  required
                >
                <datalist id="beneficiary-list">
                  ${beneficiaries.map(b => `<option value="${b}">`).join('')}
                </datalist>
              </div>

              <!-- Date -->
              <div class="form-group">
                <label for="date">תאריך</label>
                <input 
                  type="text" 
                  id="date" 
                  name="date" 
                  placeholder="MM/DD/YYYY"
                  value="${todayFormatted}"
                  pattern="\\d{2}/\\d{2}/\\d{4}"
                >
              </div>

              <!-- Category -->
              <div class="form-group">
                <label for="category">קטגוריה</label>
                <select id="category" name="category">
                  <option value="">בחר קטגוריה...</option>
                  ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                </select>
              </div>

              <!-- Payment Method -->
              <div class="form-group">
                <label for="payment-method">אמצעי תשלום</label>
                <select id="payment-method" name="paymentMethod">
                  <option value="">בחר אמצעי...</option>
                  ${paymentMethods.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
              </div>

              <!-- Notes -->
              <div class="form-group">
                <label for="notes">הערות / מספר אסמכתה</label>
                <textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="הערות אופציונליות"
                  rows="3"
                ></textarea>
              </div>

              <!-- Section 46 -->
              <div class="form-group">
                <label class="checkbox-group">
                  <input type="checkbox" id="section46" name="section46">
                  <span class="checkbox-label">תרומה מוכרת לפי סעיף 46</span>
                </label>
              </div>

              <!-- Buttons -->
              <div class="btn-group" style="gap: 12px; margin-top: 24px;">
                <button type="submit" class="btn btn-primary btn-block">שמור תרומה</button>
                <button type="button" class="btn btn-secondary btn-block" onclick="window.app.ui.showScreen('dashboard')">ביטול</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    return html;
  }

  /**
   * Render History Screen
   */
  async renderHistory() {
    const donations = await this.app.db.getAll('donations');
    const categories = await this.app.db.getAll('categories');
    
    let html = `
      <div class="screen">
        <div class="screen-content">
          <h1 style="margin-bottom: 24px;">היסטוריה וסיכומים</h1>
          
          <!-- Filters -->
          <div class="card" style="margin-bottom: 24px;">
            <h3 class="card-title">סינון</h3>
            
            <div class="form-group">
              <label for="filter-month">חודש</label>
              <select id="filter-month">
                <option value="">כל החודשים</option>
                ${this.getMonthOptions()}
              </select>
            </div>

            <div class="form-group">
              <label for="filter-category">קטגוריה</label>
              <select id="filter-category">
                <option value="">כל הקטגוריות</option>
                ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="search">חיפוש</label>
              <input type="text" id="search" placeholder="חיפוש בשם מוטב או הערות...">
            </div>

            <button class="btn btn-primary btn-block" onclick="window.app.ui.applyFilters()">החל סינון</button>
          </div>

          <!-- Donations Table -->
          <div class="card">
            <h3 class="card-title" style="margin-bottom: 16px;">
              תרומות (${donations.length})
            </h3>
            
            ${donations.length > 0 ? `
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>תאריך</th>
                      <th>מוטב</th>
                      <th>סכום</th>
                      <th>קטגוריה</th>
                      <th>פעולות</th>
                    </tr>
                  </thead>
                  <tbody id="donations-table">
                    ${donations
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(d => `
                      <tr>
                        <td>${formatDate(d.date)}</td>
                        <td>${d.beneficiary}</td>
                        <td>${formatCurrency(d.amount)}</td>
                        <td>${d.category || '-'}</td>
                        <td>
                          <button class="btn btn-secondary btn-small" onclick="window.app.ui.editDonation(${d.id})">עריכה</button>
                          <button class="btn btn-danger btn-small" onclick="window.app.ui.deleteDonation(${d.id})">מחיקה</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div class="btn-group" style="margin-top: 16px;">
                <button class="btn btn-secondary btn-block" onclick="window.app.ui.exportCSV()">
                  📥 ייצוא CSV
                </button>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">לא קיימות תרומות</div>
              </div>
            `}
          </div>

          <!-- Monthly Summaries -->
          <div class="card">
            <h3 class="card-title">סיכומים חודשיים</h3>
            <div id="monthly-summaries">
              ${await this.renderMonthlySummaries()}
            </div>
          </div>
        </div>
      </div>
    `;
    
    return html;
  }

  /**
   * Render Settings Screen
   */
  async renderSettings() {
    const settings = await this.app.db.getAll('settings');
    const categories = await this.app.db.getAll('categories');
    
    const baseAmount = settings.find(s => s.key === 'baseMaaserAmount')?.value || 1000;
    const maaserDay = settings.find(s => s.key === 'maaserDay')?.value || 10;
    
    let html = `
      <div class="screen">
        <div class="screen-content">
          <h1 style="margin-bottom: 24px;">הגדרות</h1>
          
          <!-- Maaser Settings -->
          <div class="card">
            <h3 class="card-title">הגדרות מעשר</h3>
            
            <div class="form-group">
              <label for="base-amount">סכום חוב בסיס (₪)</label>
              <input 
                type="number" 
                id="base-amount" 
                value="${baseAmount}" 
                step="1" 
                min="0"
              >
              <button class="btn btn-primary" onclick="window.app.ui.saveSetting('baseMaaserAmount', document.getElementById('base-amount').value)" style="margin-top: 8px;">שמור</button>
            </div>

            <div class="form-group">
              <label for="maaser-day">יום יצירת החוב החודשי</label>
              <input 
                type="number" 
                id="maaser-day" 
                value="${maaserDay}" 
                min="1" 
                max="31"
              >
              <button class="btn btn-primary" onclick="window.app.ui.saveSetting('maaserDay', document.getElementById('maaser-day').value)" style="margin-top: 8px;">שמור</button>
            </div>
          </div>

          <!-- Category Management -->
          <div class="card">
            <h3 class="card-title">ניהול קטגוריות</h3>
            
            <div id="categories-list">
              ${categories.map(c => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--color-divider);">
                  <span>${c.name}</span>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-small" onclick="window.app.ui.showEditCategoryModal(${c.id}, '${c.name}')">עריכה</button>
                    <button class="btn btn-danger btn-small" onclick="window.app.ui.deleteCategory(${c.id})">מחיקה</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <button class="btn btn-primary btn-block" onclick="window.app.ui.showAddCategoryModal()" style="margin-top: 16px;">
              ＋ הוספת קטגוריה
            </button>
          </div>

          <!-- Data Export/Import -->
          <div class="card">
            <h3 class="card-title">גיבוי ויצוא</h3>
            
            <button class="btn btn-secondary btn-block" onclick="window.app.ui.exportData()" style="margin-bottom: 12px;">
              💾 ייצוא גיבוי JSON
            </button>

            <button class="btn btn-secondary btn-block" onclick="window.app.ui.importData()" style="margin-bottom: 12px;">
              📂 ייבוא גיבוי JSON
            </button>

            <button class="btn btn-secondary btn-block" onclick="window.app.ui.exportCSV()">
              📥 ייצוא CSV
            </button>
          </div>

          <!-- App Info -->
          <div class="card">
            <h3 class="card-title">אודות</h3>
            <p>ניהול המעשרות v1.0</p>
            <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 8px;">
              כל הנתונים נשמרים במכשיר זה בלבד. לא קיים שרת בענן.
            </p>
          </div>

          <!-- Danger Zone -->
          <div class="card" style="border: 2px solid var(--color-error-light);">
            <h3 class="card-title" style="color: var(--color-error);">אזור סכנה</h3>
            
            <button class="btn btn-danger btn-block" onclick="window.app.ui.clearAllData()">
              🗑️ מחיקת כל הנתונים
            </button>
            
            <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: 12px;">
              פעולה זו תמחק את כל הנתונים שלך וispatchאי ניתן לשחזר.
            </p>
          </div>
        </div>
      </div>
    `;
    
    return html;
  }

  /**
   * Get month options for select
   */
  getMonthOptions() {
    const donations = this.app.db.getAll('donations');
    const months = new Set();
    
    donations.then(d => {
      d.forEach(donation => {
        const date = new Date(donation.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthYear);
      });
    });
    
    return Array.from(months)
      .sort()
      .reverse()
      .map(m => {
        const [year, month] = m.split('-');
        const monthName = getHebrewMonthName(parseInt(month));
        return `<option value="${m}">${monthName} ${year}</option>`;
      })
      .join('');
  }

  /**
   * Get recent beneficiaries
   */
  async getRecentBeneficiaries() {
    const donations = await this.app.db.getAll('donations');
    const beneficiaries = [...new Set(donations.map(d => d.beneficiary))];
    return beneficiaries.slice(0, 10);
  }

  /**
   * Render monthly summaries
   */
  async renderMonthlySummaries() {
    const summaries = await this.app.calculator.getAllMonthlySummaries();
    
    if (summaries.length === 0) {
      return '<div class="empty-state"><p>אין סיכומים חודשיים</p></div>';
    }
    
    return summaries
      .sort((a, b) => new Date(`${b.year}-${String(b.month).padStart(2, '0')}`) - new Date(`${a.year}-${String(a.month).padStart(2, '0')}`))
      .map(s => `
        <div style="padding: 12px; border-bottom: 1px solid var(--color-divider);">
          <div style="font-weight: 600; margin-bottom: 8px;">
            ${getHebrewMonthName(s.month)} ${s.year}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">
            <div>
              <span style="color: var(--color-text-secondary);">חוב החודש:</span>
              <strong>${formatCurrency(s.totalDebt)}</strong>
            </div>
            <div>
              <span style="color: var(--color-text-secondary);">תרומות:</span>
              <strong>${formatCurrency(s.totalDonations)}</strong>
            </div>
            <div>
              <span style="color: var(--color-text-secondary);">יתרה פתיחה:</span>
              <strong>${formatCurrency(s.openingBalance)}</strong>
            </div>
            <div>
              <span style="color: var(--color-text-secondary);">יתרה סיום:</span>
              <strong ${s.closingBalance > 0 ? 'style="color: var(--color-error)"' : 'style="color: var(--color-success)"'}>${formatCurrency(s.closingBalance)}</strong>
            </div>
          </div>
        </div>
      `).join('');
  }

  /**
   * Attach screen event listeners
   */
  attachScreenEvents(screenName) {
    if (screenName === 'add-donation') {
      const form = document.getElementById('donation-form');
      if (form) {
        form.addEventListener('submit', (e) => this.handleAddDonation(e));
      }
    }
  }

  /**
   * Handle add donation form submission
   */
  async handleAddDonation(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const beneficiary = document.getElementById('beneficiary').value.trim();
    const dateStr = document.getElementById('date').value;
    const category = document.getElementById('category').value || null;
    const paymentMethod = document.getElementById('payment-method').value || null;
    const notes = document.getElementById('notes').value.trim() || null;
    const section46 = document.getElementById('section46').checked;

    if (isEmpty(beneficiary)) {
      this.showToast('אנא הזן את שם המוטב', 'error');
      return;
    }

    if (!amount || amount <= 0) {
      this.showToast('אנא הזן סכום תקין', 'error');
      return;
    }

    if (isEmpty(dateStr)) {
      this.showToast('אנא בחר תאריך', 'error');
      return;
    }

    // Parse date
    const date = parseDate(dateStr);
    if (isNaN(date.getTime())) {
      this.showToast('תאריך לא תקין', 'error');
      return;
    }

    const donation = {
      amount,
      beneficiary,
      date: date.toISOString(),
      category,
      paymentMethod,
      notes,
      section46,
      createdDate: new Date().toISOString()
    };

    try {
      await this.app.db.add('donations', donation);
      
      // Update monthly data
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      await this.app.calculator.getOrCreateMonthlyData(date, await this.app.db.getAll('settings'));
      await this.app.calculator.updateMonthTotalDonations(monthYear);
      await this.app.calculator.recalculateAllBalances();

      this.showToast('תרומה נשמרה בהצלחה', 'success');
      
      // Reset form and redirect
      setTimeout(() => {
        this.showScreen('dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error adding donation:', error);
      this.showToast('שגיאה בשמירת התרומה', 'error');
    }
  }

  /**
   * Delete donation
   */
  async deleteDonation(id) {
    if (!confirm('האם אתה בטוח שברצונך למחוק את התרומה?')) {
      return;
    }

    try {
      const donation = await this.app.db.get('donations', id);
      await this.app.db.delete('donations', id);
      
      // Update monthly data
      const monthYear = `${new Date(donation.date).getFullYear()}-${String(new Date(donation.date).getMonth() + 1).padStart(2, '0')}`;
      await this.app.calculator.updateMonthTotalDonations(monthYear);
      await this.app.calculator.recalculateAllBalances();

      this.showToast('התרומה נמחקה בהצלחה', 'success');
      this.showScreen('history');
    } catch (error) {
      console.error('Error deleting donation:', error);
      this.showToast('שגיאה במחיקת התרומה', 'error');
    }
  }

  /**
   * Edit donation
   */
  async editDonation(id) {
    const donation = await this.app.db.get('donations', id);
    if (!donation) {
      this.showToast('תרומה לא נמצאה', 'error');
      return;
    }

    // TODO: Implement edit modal
    this.showToast('עריכה בפיתוח', 'info');
  }

  /**
   * Export data to JSON
   */
  async exportData() {
    try {
      const data = await this.app.db.exportData();
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, `maaser-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      this.showToast('גיבוי ייצוא בהצלחה', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showToast('שגיאה בייצוא הגיבוי', 'error');
    }
  }

  /**
   * Import data from JSON
   */
  async importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text);

        if (confirm('זה יחליף את כל הנתונים הקיימים. האם אתה בטוח?')) {
          await this.app.db.importData(data);
          await this.app.calculator.recalculateAllBalances();
          this.showToast('הנתונים יובאו בהצלחה', 'success');
          setTimeout(() => this.showScreen('dashboard'), 1000);
        }
      } catch (error) {
        console.error('Error importing data:', error);
        this.showToast('שגיאה בייבוא הנתונים', 'error');
      }
    };
    input.click();
  }

  /**
   * Export to CSV
   */
  async exportCSV() {
    try {
      const donations = await this.app.db.getAll('donations');
      if (donations.length === 0) {
        this.showToast('אין תרומות לייצוא', 'warning');
        return;
      }

      const headers = ['תאריך', 'מוטב', 'סכום', 'קטגוריה', 'אמצעי תשלום', 'סעיף 46', 'הערות'];
      const data = donations.map(d => ({
        'תאריך': formatDate(d.date),
        'מוטב': d.beneficiary,
        'סכום': d.amount,
        'קטגוריה': d.category || '',
        'אמצעי תשלום': d.paymentMethod || '',
        'סעיף 46': d.section46 ? 'כן' : 'לא',
        'הערות': d.notes || ''
      }));

      exportToCSV(data, headers, `maaser-export-${new Date().toISOString().split('T')[0]}.csv`);
      this.showToast('ייצוא CSV בהצלחה', 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      this.showToast('שגיאה בייצוא CSV', 'error');
    }
  }

  /**
   * Save setting
   */
  async saveSetting(key, value) {
    try {
      const settings = await this.app.db.getAll('settings');
      const setting = settings.find(s => s.key === key);
      
      if (setting) {
        setting.value = isNaN(value) ? value : parseFloat(value);
        await this.app.db.update('settings', setting);
      } else {
        await this.app.db.add('settings', { key, value: isNaN(value) ? value : parseFloat(value) });
      }
      
      this.showToast('ההגדרה נשמרה בהצלחה', 'success');
    } catch (error) {
      console.error('Error saving setting:', error);
      this.showToast('שגיאה בשמירת ההגדרה', 'error');
    }
  }

  /**
   * Show add category modal
   */
  showAddCategoryModal() {
    // TODO: Implement modal
    this.showToast('הוספת קטגוריה בפיתוח', 'info');
  }

  /**
   * Show edit category modal
   */
  showEditCategoryModal(id, name) {
    // TODO: Implement modal
    this.showToast('עריכת קטגוריה בפיתוח', 'info');
  }

  /**
   * Delete category
   */
  async deleteCategory(id) {
    // TODO: Implement delete with confirmation
    this.showToast('מחיקת קטגוריה בפיתוח', 'info');
  }

  /**
   * Clear all data
   */
  async clearAllData() {
    if (!confirm('זו פעולה אי-הפיכה. האם אתה בטוח שברצונך למחוק את כל הנתונים?')) {
      return;
    }

    if (!confirm('זה יוציא את המערכת למצב ברירת מחדל. המשך?')) {
      return;
    }

    try {
      await this.app.db.clearAllData();
      this.showToast('כל הנתונים נמחקו בהצלחה', 'success');
      setTimeout(() => this.showScreen('dashboard'), 1000);
    } catch (error) {
      console.error('Error clearing data:', error);
      this.showToast('שגיאה במחיקת הנתונים', 'error');
    }
  }

  /**
   * Apply filters (placeholder)
   */
  applyFilters() {
    this.showToast('סינון בפיתוח', 'info');
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    `;
    
    this.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideInUp 300ms ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Render bottom navigation
   */
  renderNav() {
    return `
      <nav class="bottom-nav">
        <a class="nav-item active" data-screen="dashboard" onclick="window.app.ui.showScreen('dashboard')">
          <span class="nav-icon">🏠</span>
          <span>ראשי</span>
        </a>
        <a class="nav-item" data-screen="add-donation" onclick="window.app.ui.showScreen('add-donation')">
          <span class="nav-icon">➕</span>
          <span>תרומה</span>
        </a>
        <a class="nav-item" data-screen="history" onclick="window.app.ui.showScreen('history')">
          <span class="nav-icon">📊</span>
          <span>היסטוריה</span>
        </a>
        <a class="nav-item" data-screen="settings" onclick="window.app.ui.showScreen('settings')">
          <span class="nav-icon">⚙️</span>
          <span>הגדרות</span>
        </a>
      </nav>
    `;
  }
}
