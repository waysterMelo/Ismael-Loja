import { Customer, PromissoryNote } from '../types';
import { MOCK_CUSTOMERS, MOCK_NOTES } from '../constants';

const CUSTOMERS_KEY = 'iwr_customers';
const NOTES_KEY = 'iwr_notes';

export const storageService = {
  // Initialize data if empty
  init: () => {
    if (!localStorage.getItem(CUSTOMERS_KEY)) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(MOCK_CUSTOMERS));
    }
    if (!localStorage.getItem(NOTES_KEY)) {
      localStorage.setItem(NOTES_KEY, JSON.stringify(MOCK_NOTES));
    }
  },

  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addCustomer: (customer: Customer) => {
    const customers = storageService.getCustomers();
    customers.push(customer);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  toggleCustomerVip: (id: string) => {
    const customers = storageService.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index].isVip = !customers[index].isVip;
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    }
  },

  getNotes: (): PromissoryNote[] => {
    const data = localStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  getNotesByCustomerId: (customerId: string): PromissoryNote[] => {
    const notes = storageService.getNotes();
    return notes.filter(n => n.customerId === customerId).sort((a, b) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  },

  addNote: (note: PromissoryNote) => {
    const notes = storageService.getNotes();
    notes.push(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  },

  updateNoteStatus: (id: string, status: any) => {
    const notes = storageService.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index].status = status;
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  },

  markWhatsappSent: (id: string) => {
    const notes = storageService.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index].whatsappSent = true;
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }
  }
};