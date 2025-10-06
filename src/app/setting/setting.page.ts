import { Component, OnInit } from '@angular/core';
import { PostProvider } from '../../providers/post-provider';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  // Mode segment : 'titre' | 'ref'
  mode: 'titre' | 'ref' = 'titre';

  // Liste des titres
  titres: any[] = [];
  // facteurs d'échelle (ajuste selon ta BDD)
  priceFactor = 1; // si tu dois diviser par 10 pour avoir FCFA
  isUpdatingAll = false;
  globalProgress = 0;
  message = '';

  // Référence single
  refId: string = '';
  refNewPrice: any = '';
  refCurrentPriceDisplay = '';
  refUpdating = false;
  refProgress = 0;

  constructor(
    private postPvdr: PostProvider,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadTitres();
  }

  // Chargement des titres distincts depuis l'API
  loadTitres() {
    const body = { aksi: 'get_distinct_titres' };
    this.postPvdr.postData(body, 'file_aksi.php').subscribe(
      (data: any) => {
        if (!data || !data.result) {
          this.titres = [];
          return;
        }
        this.titres = data.result.map((t: any) => ({
          ...t,
          new_price: this.scaleToDisplay(t.unit_price), // pré-rempli
          updating: false,
          progress: 0,
          updatedAt: null
        }));
      },
      (err) => {
        console.error('Erreur loadTitres', err);
      }
    );
  }

  // Formatage pour affichage FCFA (espaces milliers)
  scaleToDisplay(raw: number) {
    if (raw === null || raw === undefined) return '';
    const n = Math.round(Number(raw) / this.priceFactor);
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  // retourne string "56 000 FCFA"
  formatFCFA(raw: number) {
    if (raw === null || raw === undefined || raw === 0) return '0 FCFA';
    return `${this.scaleToDisplay(raw)} FCFA`;
  }

  // Convertit l'entrée utilisateur (string avec espaces) vers valeur brute attendue par l'API
  parsePriceInput(value: any) {
    if (value === null || value === undefined || value === '') return null;
    const digits = String(value).replace(/\s/g, '').replace(/,/g, '').replace(/[^0-9.-]/g, '');
    if (digits === '') return null;
    return Math.round(Number(digits) * this.priceFactor);
  }

  async updateSingleTitre(titre: any) {
    const newRaw = this.parsePriceInput(titre.new_price);
    if (newRaw === null) {
      const t = await this.toastCtrl.create({ message: 'Prix invalide', duration: 2000, color: 'warning' });
      t.present();
      return;
    }
    titre.updating = true;
    titre.progress = 0;
    try {
      const body = { aksi: 'update_prices', type_or: titre.type_or, new_price: newRaw };
      await this.postPvdr.postData(body, 'file_aksi.php').toPromise();
      titre.unit_price = newRaw;
      titre.updatedAt = new Date();
      titre.new_price = this.scaleToDisplay(newRaw);
      titre.progress = 1;
      const t = await this.toastCtrl.create({ message: `Titre ${titre.type_or} mis à jour`, duration: 2000, color: 'success' });
      t.present();
    } catch (e) {
      console.error(e);
      const t = await this.toastCtrl.create({ message: 'Erreur lors de la mise à jour', duration: 2500, color: 'danger' });
      t.present();
    } finally {
      titre.updating = false;
      titre.progress = 0;
    }
  }

  // Mettre à jour tous les titres séquentiellement (affiche progression globale)
  async updateAll() {
    this.isUpdatingAll = true;
    this.globalProgress = 0;
    const total = this.titres.length;
    for (let i = 0; i < total; i++) {
      const t = this.titres[i];
      const newRaw = this.parsePriceInput(t.new_price);
      if (newRaw !== null && newRaw !== Number(t.unit_price)) {
        t.updating = true;
        t.progress = 0;
        try {
          const body = { aksi: 'update_prices', type_or: t.type_or, new_price: newRaw };
          await this.postPvdr.postData(body, 'file_aksi.php').toPromise();
          t.unit_price = newRaw;
          t.updatedAt = new Date();
          t.progress = 1;
        } catch (e) {
          console.error('updateAll error for', t.type_or, e);
        } finally {
          t.updating = false;
        }
      }
      this.globalProgress = (i + 1) / total;
    }

    this.isUpdatingAll = false;
    this.globalProgress = 0;
    this.message = 'Mise à jour terminée avec succès !';
    const toast = await this.toastCtrl.create({ message: this.message, duration: 3000, color: 'success' });
    toast.present();
    // Recharge les titres pour refléter les nouvelles valeurs formatées
    this.loadTitres();
  }

  // Rechercher le prix actuel d'une référence (item_id)
  fetchRefCurrentPrice() {
    if (!this.refId || this.refId.trim() === '') {
      this.refCurrentPriceDisplay = '';
      return;
    }
    const body = { aksi: 'get_price_by_item', item_id: this.refId };
    this.postPvdr.postData(body, 'file_aksi.php').subscribe(
      (data: any) => {
        if (data && data.result && data.result.length > 0) {
          const item = data.result[0];
          this.refCurrentPriceDisplay = this.formatFCFA(item.unit_price);
        } else {
          this.refCurrentPriceDisplay = 'Référence introuvable';
        }
      },
      (err) => {
        console.error(err);
        this.refCurrentPriceDisplay = 'Erreur';
      }
    );
  }

  // Mettre à jour un seul item par référence (item_id)
  async updateByReference() {
    const raw = this.parsePriceInput(this.refNewPrice);
    if (!this.refId || raw === null) {
      const t = await this.toastCtrl.create({ message: 'Référence ou prix invalide', duration: 2000, color: 'warning' });
      t.present();
      return;
    }
    this.refUpdating = true;
    this.refProgress = 0;
    try {
      const body = { aksi: 'update_by_item_id', item_id: this.refId, new_price: raw };
      await this.postPvdr.postData(body, 'file_aksi.php').toPromise();
      this.refProgress = 1;
      const t = await this.toastCtrl.create({ message: 'Référence mise à jour', duration: 2000, color: 'success' });
      t.present();
      // actualiser liste et champs
      this.refNewPrice = '';
      this.refCurrentPriceDisplay = this.formatFCFA(raw);
      this.loadTitres();
    } catch (e) {
      console.error(e);
      const t = await this.toastCtrl.create({ message: 'Erreur lors de la mise à jour', duration: 2000, color: 'danger' });
      t.present();
    } finally {
      this.refUpdating = false;
      this.refProgress = 0;
    }
  }

  closePage() {
    this.navCtrl.back();
  }
}
