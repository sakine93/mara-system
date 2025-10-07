import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController,AlertController, ModalController } from '@ionic/angular';
import { PostProvider } from '../../providers/post-provider';
import { Storage } from '@ionic/storage';
import { QRCodeModule } from 'angularx-qrcode';
import { Network } from '@ionic-native/network/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { FacturebijouxPage } from '../facturebijoux/facturebijoux.page';
import { FaturerecuPage } from '../faturerecu/faturerecu.page';
import { FacturebijouxComponent } from '../facturebijoux/facturebijoux.component';

@Component({
  selector: 'app-historiquerecu',
  templateUrl: './historiquerecu.page.html',
  styleUrls: ['./historiquerecu.page.scss'],
})
export class HistoriquerecuPage implements OnInit {
  reffacture:any;
  customers: any = [];
  limit: number = 10;
  datevente :string='';
  start: number = 0;
  username: string;
  anggota: any;
  comment:string;
  codeacces: any;
  phone_number:any;
  item_location:number;
  totalvente:any;
  nbrepiece:any;
  nbre:any;
  require:any;
  datefinstock:string='';
  daterecustock:string='';
  num_sale:number=0;
  public myAngularxQrCode: string = 'null'; 

  constructor(
    private router: Router,
    private postPvdr: PostProvider,
    public toastController: ToastController,
    private storage: Storage,
    public network:Network,
    public dialog:Dialogs,
    public alertCtrl:AlertController,
    public modalController: ModalController,
    
  ) { 
    this.datevente ='00/00/0000'

    this.ionViewWillEnter();
    
    this.network.onDisconnect().subscribe(()=>{
    
      setTimeout(()=>{
        this.dialog.alert('Attention !!! vous navez plus de connexion Internet Verifier Votre Wifi ou Donne Mobile');
              },3000);
  
    });
    this.network.onConnect().subscribe(()=>{
    
    })
  }
  
  showCustomer(id) {
    this.router.navigate(['/showcustomer/' + id+ '/']);
    sale_id : id
 
  }
  loadSalesReport() {
    const start = this.daterecustock || new Date().toISOString().substring(0,10);
    const end   = this.datefinstock || new Date().toISOString().substring(0,10);
  
    let body = {
      aksi: 'get_sales_report',
      startDate: start,
      endDate: end
    };
  
    this.postPvdr.postData(body, 'file_aksi.php').subscribe((data: any) => {
      if (data && data.success) {
        this.customers = data.result.map((r: any) => {
          // Normaliser champs numériques
          const total_pieces = parseInt(r.total_pieces, 10) || 0;
          const total_poids  = parseFloat(r.total_poids) || 0;
          const total_vente  = parseFloat(r.total_vente) || 0;
  
          // Détails : accepter 2 formats
          let details_list: any[] = [];
  
          // 1) format moderne : details_list déjà en tableau d'objets
          if (Array.isArray(r.details_list) && r.details_list.length) {
            details_list = r.details_list.map((d: any) => ({
              type_or: d.type_or || d.titre || d.name || '-',
              total_poids: Number(d.total_poids || d.total_poids || 0),
              total_pieces: parseInt(d.total_pieces || d.total_pieces || 0, 10),
              total_vente: Number(d.total_vente || d.total_montant || 0)
            }));
          }
          // 2) ancien format agrégé en string "titre::poids::qte::montant||titre2::..."
          else if (r.details_agg && typeof r.details_agg === 'string') {
            const parts = r.details_agg.split('||');
            for (const p of parts) {
              if (!p) continue;
              const f = p.split('::');
              details_list.push({
                type_or: f[0] || '-',
                total_poids: parseFloat(f[1]) || 0,
                total_pieces: parseInt(f[2], 10) || 0,
                total_vente: parseFloat(f[3]) || 0
              });
            }
          }
  
          // calculs locaux (facultatif) : total poids / pieces / montant depuis details_list
          const details_totals = details_list.reduce((acc, it) => {
            acc.pieces += (parseInt(it.total_pieces, 10) || 0);
            acc.poids  += (parseFloat(it.total_poids) || 0);
            acc.montant+= (parseFloat(it.total_vente) || 0);
            return acc;
          }, {pieces:0, poids:0, montant:0});
  
          return {
            employee_id: r.employee_id,
            employee_name: r.employee_name || ('Emp ' + r.employee_id),
            total_pieces: total_pieces,
            total_poids: total_poids,
            total_vente: total_vente,
            details_list: details_list,
            details_totals: details_totals,
            showDetails: false
          };
        });
  
        // Optionnel : trier par montant décroissant
        this.customers.sort((a,b) => b.total_vente - a.total_vente);
      } else {
        this.customers = [];
      }
    }, err => {
      console.error('Erreur loadSalesReport', err);
      this.customers = [];
    });
  }
  
  
 

  ngOnInit() {
    this.ionViewWillEnter();
    this.datefinstock = new Date().toISOString().substring(0, 10);
    this.daterecustock = new Date().toISOString().substring(0, 10);
   
  }

  async facture(reffacture) {
    const modale = await this.modalController.create({
      component: FacturebijouxPage,
      cssClass: 'my-custom-class',
      componentProps: {
        reffacture:reffacture,
       
       
      },
   
    });
    return await modale.present();
  }


  validateStock(reffacture){
alert(reffacture);
this.createdProses(reffacture);
  }
  

  async createdProses(reffacture) {
    if(this.comment==''){
     const toast = await this.toastController.create({
       message: 'Les infos du clients st obligatoires',
       duration: 2000
     });
   }
  
    else {
     let body = {
       aksi: 'updatefacture',
       comment : this.comment,
       reffacture:reffacture,
    
      // sale_status : '1',
       codeacces:this.codeacces,
       item_location : this.item_location,
      
      
     };
     this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
       var alertpesan = data.msg;
       if (data.success) {
         
         const toast = await this.toastController.create({
           message: 'facture bien validé ',
           duration: 2000
         });
         toast.present();
         this.ionViewWillEnter();
       } else {
         const toast = await this.toastController.create({
           message: alertpesan,
           duration: 2000
         });
       }
     });
   }
 }

 


  ionViewWillEnter() {
    this.customers = [];
    this.start = 0;
    this.loadCustomer();
    this.loadSalesReport();
    this.storage.get('session_storage').then((res) => {
      this.anggota = res;
      this.username = this.anggota.username;
      this.codeacces = this.anggota.codeacces;
      this.phone_number = this.anggota.phone_number;
      this.item_location = this.anggota.item_location;
      this.nbre= 0;
    });
  }

  async proseslogout() {
    this.storage.clear();
    this.router.navigate(['/login']);
    const toast = await this.toastController.create({
      message: 'Logout successful',
      duration: 2000
     });
    toast.present();

  }


 

  
 

 


  
 

  doRefresh(event) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 500);
  }

  loadData(event: any) {
    this.start += this.limit;
    setTimeout(() => {
    this.loadCustomer().then(() => {
    event.target.complete();
    });
    }, 500);
  }


  delCustomers(id) {
    let body = {
        aksi: 'delete',
        num_sale : id
      };

    this.postPvdr.postData(body, 'file_aksi.php').subscribe(data => {
        this.ionViewWillEnter();
      });
  }

  menuApp(){
    this.router.navigate(['menubijouterie']);
  }
  goBack(){
    this.router.navigate(['customer']);
  }

  loadCustomer() {
    return new Promise(resolve => {
      let body = {
        aksi: 'gethistoriquestock',
        limit : this.limit,
        start : this.start,
        daterecustock:this.daterecustock,
        datefinstock:this.datefinstock,
        codeacces : this.codeacces,
        datevente : this.datevente,
        item_location : this.item_location,
      };

      let body2 = {
        aksi: 'gettotal',
        limit : this.limit,
        start : this.start,
        codeacces : this.codeacces,
        item_location : this.item_location,
      };

      this.postPvdr.postData(body, 'file_aksi.php').subscribe(data => {
        for (let customer of data.result) {
         
          this.customers.push(customer);
         
        }
        resolve(true);
      });

      this.postPvdr.postData(body2, 'file_aksi.php').subscribe(data => {
        for (let customer of data.result) {
          this.nbre =0;
          this.totalvente =customer.totalvente;
          this.nbrepiece= customer.nbrepiece;
        
         
        }
        resolve(true);
      });
    });
  }


  



}
