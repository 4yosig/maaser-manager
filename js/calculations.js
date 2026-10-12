/**
 * Calculations Module - Core business logic for Maaser calculations
 */

import { formatMonthYear, getMonthYear, getCurrentMonthYear } from './utils.js';

export class MaaserCalculator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Ensure monthly debt exists for current month
   */
  async ensureCurrentMonthDebt(settings) {
    const currentMonth = getCurrentMonthYear();
    const monthlyData = await this.db.getAll('monthlyData');
    
    const currentMonthData = monthlyData.find(m => 
      m.yearMonth === currentMonth.yearMonth
    );

    if (!currentMonthData) {
      // Create new monthly data
      const baseMaaserAmount = settings.find(s => s.key === 'baseMaaserAmount')?.value || 1000;
      const newMonthData = {
        yearMonth: currentMonth.yearMonth,
        year: currentMonth.year,
        month: currentMonth.month,
        baseDebt: baseMaaserAmount,
        additionalDebt: 0,
        totalDonations: 0,
        createdDate: new Date().toISOString()
      };
      
      await this.db.add('monthlyData', newMonthData);
    }
  }

  /**
   * Get or create monthly data for a specific date
   */
  async getOrCreateMonthlyData(date, settings) {
    const monthYear = getMonthYear(new Date(date));
    const monthlyData = await this.db.getAll('monthlyData');
    
    let data = monthlyData.find(m => m.yearMonth === monthYear.yearMonth);
    
    if (!data) {
      const baseMaaserAmount = settings.find(s => s.key === 'baseMaaserAmount')?.value || 1000;
      data = {
        yearMonth: monthYear.yearMonth,
        year: monthYear.year,
        month: monthYear.month,
        baseDebt: baseMaaserAmount,
        additionalDebt: 0,
        totalDonations: 0,
        createdDate: new Date().toISOString()
      };
      
      const id = await this.db.add('monthlyData', data);
      data.id = id;
    }
    
    return data;
  }

  /**
   * Calculate total debt for a specific month
   */
  async calculateMonthDebt(monthYear) {
    const monthlyData = await this.db.getAll('monthlyData');
    const data = monthlyData.find(m => m.yearMonth === monthYear);
    
    if (!data) {
      return 0;
    }
    
    return (data.baseDebt || 0) + (data.additionalDebt || 0);
  }

  /**
   * Calculate opening balance for a specific month
   */
  async calculateOpeningBalance(monthYear, allMonthlyData) {
    const [year, month] = monthYear.split('-').map(Number);
    
    if (month === 1) {
      // January - look for December of previous year
      const previousMonth = `${year - 1}-12`;
      const prevData = allMonthlyData.find(m => m.yearMonth === previousMonth);
      return prevData ? (prevData.closingBalance || 0) : 0;
    } else {
      // Previous month
      const previousMonth = `${year}-${String(month - 1).padStart(2, '0')}`;
      const prevData = allMonthlyData.find(m => m.yearMonth === previousMonth);
      return prevData ? (prevData.closingBalance || 0) : 0;
    }
  }

  /**
   * Calculate closing balance for a month
   * Formula: Opening Balance + Base Debt + Additional Debt - Total Donations
   */
  async calculateClosingBalance(monthYear) {
    const allMonthlyData = await this.db.getAll('monthlyData');
    const monthData = allMonthlyData.find(m => m.yearMonth === monthYear);
    
    if (!monthData) {
      return 0;
    }
    
    const openingBalance = await this.calculateOpeningBalance(monthYear, allMonthlyData);
    const baseDebt = monthData.baseDebt || 0;
    const additionalDebt = monthData.additionalDebt || 0;
    const totalDonations = monthData.totalDonations || 0;
    
    const closingBalance = openingBalance + baseDebt + additionalDebt - totalDonations;
    
    // Update the monthly data with calculated values
    monthData.openingBalance = openingBalance;
    monthData.totalDebt = baseDebt + additionalDebt;
    monthData.closingBalance = closingBalance;
    
    await this.db.update('monthlyData', monthData);
    
    return closingBalance;
  }

  /**
   * Update total donations for a month
   */
  async updateMonthTotalDonations(monthYear) {
    const donations = await this.db.getAll('donations');
    const monthDonations = donations.filter(d => {
      const donationMonth = getMonthYear(new Date(d.date));
      return donationMonth.yearMonth === monthYear;
    });
    
    const total = monthDonations.reduce((sum, d) => sum + d.amount, 0);
    
    const monthlyData = await this.db.getAll('monthlyData');
    const data = monthlyData.find(m => m.yearMonth === monthYear);
    
    if (data) {
      data.totalDonations = total;
      await this.db.update('monthlyData', data);
    }
    
    return total;
  }

  /**
   * Recalculate all balances after a change (donation added/edited/deleted)
   */
  async recalculateAllBalances() {
    const monthlyData = await this.db.getAll('monthlyData');
    
    // Sort by date
    monthlyData.sort((a, b) => {
      const aDate = new Date(`${a.year}-${String(a.month).padStart(2, '0')}-01`);
      const bDate = new Date(`${b.year}-${String(b.month).padStart(2, '0')}-01`);
      return aDate - bDate;
    });
    
    // Recalculate each month
    for (const data of monthlyData) {
      await this.updateMonthTotalDonations(data.yearMonth);
      await this.calculateClosingBalance(data.yearMonth);
    }
  }

  /**
   * Get current balance (closing balance of current month or latest month with data)
   */
  async getCurrentBalance() {
    const currentMonth = getCurrentMonthYear();
    
    // First try current month
    let balance = await this.calculateClosingBalance(currentMonth.yearMonth);
    
    if (balance === 0) {
      // Get latest month with data
      const monthlyData = await this.db.getAll('monthlyData');
      if (monthlyData.length > 0) {
        monthlyData.sort((a, b) => {
          const aDate = new Date(`${a.year}-${String(a.month).padStart(2, '0')}-01`);
          const bDate = new Date(`${b.year}-${String(b.month).padStart(2, '0')}-01`);
          return bDate - aDate;
        });
        
        const latestMonth = monthlyData[0];
        balance = await this.calculateClosingBalance(latestMonth.yearMonth);
      }
    }
    
    return balance;
  }

  /**
   * Get monthly summary data
   */
  async getMonthSummary(monthYear) {
    const monthlyData = await this.db.getAll('monthlyData');
    const data = monthlyData.find(m => m.yearMonth === monthYear);
    
    if (!data) {
      return null;
    }
    
    // Calculate balances
    await this.updateMonthTotalDonations(monthYear);
    await this.calculateClosingBalance(monthYear);
    
    const donations = await this.db.getAll('donations');
    const monthDonations = donations.filter(d => {
      const donationMonth = getMonthYear(new Date(d.date));
      return donationMonth.yearMonth === monthYear;
    });
    
    // Group by category
    const categories = await this.db.getAll('categories');
    const donationsByCategory = {};
    
    categories.forEach(cat => {
      donationsByCategory[cat.name] = monthDonations
        .filter(d => d.category === cat.name)
        .reduce((sum, d) => sum + d.amount, 0);
    });
    
    return {
      yearMonth: monthYear,
      year: data.year,
      month: data.month,
      baseDebt: data.baseDebt || 0,
      additionalDebt: data.additionalDebt || 0,
      totalDebt: (data.baseDebt || 0) + (data.additionalDebt || 0),
      openingBalance: data.openingBalance || 0,
      totalDonations: data.totalDonations || 0,
      closingBalance: data.closingBalance || 0,
      donationCount: monthDonations.length,
      donationsByCategory: donationsByCategory,
      donations: monthDonations
    };
  }

  /**
   * Get all monthly summaries
   */
  async getAllMonthlySummaries() {
    const monthlyData = await this.db.getAll('monthlyData');
    
    // Sort chronologically
    monthlyData.sort((a, b) => {
      const aDate = new Date(`${a.year}-${String(a.month).padStart(2, '0')}-01`);
      const bDate = new Date(`${b.year}-${String(b.month).padStart(2, '0')}-01`);
      return aDate - bDate;
    });
    
    const summaries = [];
    for (const data of monthlyData) {
      const summary = await this.getMonthSummary(data.yearMonth);
      if (summary) {
        summaries.push(summary);
      }
    }
    
    return summaries;
  }
}
