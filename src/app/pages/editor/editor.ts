import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface NotaItem {
  name: string;
  qty: number;
  price: number;
}

@Component({
  selector: 'app-editor',
  imports: [FormsModule],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor {
  // Profil toko
  storeName = signal('');
  storeAddress = signal('');
  storePhone = signal('');
  logo = signal('');
  notes = signal('');

  // Detail nota
  invoiceNo = signal('NZ-' + new Date().toISOString().slice(0, 10).replaceAll('-', '') + '-001');
  date = signal(new Date().toISOString().slice(0, 10));
  customer = signal('');

  // Item
  items = signal<NotaItem[]>([]);
  newName = signal('');
  newQty = signal(1);
  newPrice = signal('');

  // Diskon & pajak toko
  discount = signal(0); // persen
  taxOn = signal(true);
  taxLabel = signal('PPN');
  taxRate = signal(11); // persen

  template = signal<'minimal' | 'thermal' | 'elegan' | 'biru' | 'merah' | 'ombak' | 'vintage' | 'hijau'>('minimal');

  onLogo(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.logo.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  addItem() {
    const name = this.newName().trim();
    const price = Number(this.newPrice());
    if (!name || !price) return;
    this.items.update(list => [...list, { name, qty: this.newQty() || 1, price }]);
    this.newName.set('');
    this.newQty.set(1);
    this.newPrice.set('');
  }

  formatPriceInput(item: NotaItem, ev: Event) {
  const input = ev.target as HTMLInputElement;
  const raw = input.value.replace(/\D/g, '');
  item.price = raw ? Number(raw) : 0;
  input.value = raw ? Number(raw).toLocaleString('id-ID') : '';
}

formatNewPrice(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const raw = input.value.replace(/\D/g, '');
  this.newPrice.set(raw);
  input.value = raw ? Number(raw).toLocaleString('id-ID') : '';
}

  removeItem(i: number) {
    this.items.update(list => list.filter((_, x) => x !== i));
  }

  subtotal() {
    return this.items().reduce((s, i) => s + i.qty * i.price, 0);
  }

  discountAmount() {
    return Math.round(this.subtotal() * (this.discount() / 100));
  }

  taxAmount() {
    if (!this.taxOn()) return 0;
    return Math.round((this.subtotal() - this.discountAmount()) * (this.taxRate() / 100));
  }

  total() {
    return this.subtotal() - this.discountAmount() + this.taxAmount();
  }

  rupiah(n: number) {
    return n.toLocaleString('id-ID');
  }

  terbilang(n: number): string {
    const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
    const conv = (x: number): string => {
      if (x < 12) return satuan[x];
      if (x < 20) return conv(x - 10) + ' belas';
      if (x < 100) return conv(Math.floor(x / 10)) + ' puluh ' + conv(x % 10);
      if (x < 200) return 'seratus ' + conv(x - 100);
      if (x < 1000) return conv(Math.floor(x / 100)) + ' ratus ' + conv(x % 100);
      if (x < 2000) return 'seribu ' + conv(x - 1000);
      if (x < 1000000) return conv(Math.floor(x / 1000)) + ' ribu ' + conv(x % 1000);
      if (x < 1000000000) return conv(Math.floor(x / 1000000)) + ' juta ' + conv(x % 1000000);
      return conv(Math.floor(x / 1000000000)) + ' miliar ' + conv(x % 1000000000);
    };
    const t = conv(Math.floor(n)).replace(/\s+/g, ' ').trim();
    return (t ? t[0].toUpperCase() + t.slice(1) : 'Nol') + ' rupiah';
  }

  print() {
    window.print();
  }

  newInvoice() {
    this.items.set([]);
    this.customer.set('');
    const d = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    this.invoiceNo.set('NZ-' + d + '-' + String(Math.floor(Math.random() * 900) + 100));
  }
}