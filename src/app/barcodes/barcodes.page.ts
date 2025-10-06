import { Component, OnInit } from '@angular/core';
import { PostProvider } from '../../providers/post-provider';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, IonRouterOutlet, ModalController, Platform, ToastController } from '@ionic/angular';

import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { Storage } from '@ionic/storage';
import { Flashlight } from '@ionic-native/flashlight/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { CategorieInfo } from  '../../app/barcodes/categories.model'
const modeleAbregeParCategorie = {
  'Bagues': 'BG1',
  'Bracelets': 'BR2',
  'Bracelet + Bague': 'BRb',
  'Boucle d\'oreille': 'BD3',
  'Chaines': 'CH4',
  'Colliers': 'CO5',
  'Parrures': 'PR6',
  'Pendentifs': 'PD7',
  'Sautoirs': 'ST8',
  'Pierre': 'PI9',
  'Piercing': 'PC10',
  'Ensemble': 'EM11',
  'Ensemble Sautoir': 'EMS',
  'Fetiche': 'FE12',
  'Vice': 'VI13'
};

@Component({
  selector: 'app-barcodes',
  templateUrl: './barcodes.page.html',
  styleUrls: ['./barcodes.page.scss'],
})

export class BarcodesPage implements OnInit {
  
  identificationchoix:any;
  categoriess: CategorieInfo[] = [
    { nom_categorie: 'Bagues', grand_model: 'BG', petit_model: 'BP', moyen_model: 'BM' },
    { nom_categorie: 'Bracelets', grand_model: 'BRG', petit_model: 'BRP', moyen_model: 'BRM' },
    { nom_categorie: 'Sautoirs', grand_model: 'STG', petit_model: 'STP', moyen_model: 'STM' },
    { nom_categorie: 'Ensemble', grand_model: 'EMG', petit_model: 'EMP', moyen_model: 'EMM' },
    { nom_categorie: 'Boucle Doreille', grand_model: 'BDG', petit_model: 'BDP', moyen_model: 'BDM' },
    { nom_categorie: 'Chaines', grand_model: 'CHG', petit_model: 'CHP', moyen_model: 'CHM' },
    { nom_categorie: 'Pendentifs', grand_model: 'PDG', petit_model: 'PDP', moyen_model: 'PDM' },
    { nom_categorie: 'Vice', grand_model: 'VCG', petit_model: 'VCP', moyen_model: 'VCM' },
    { nom_categorie: 'Parrures', grand_model: 'PRG', petit_model: 'PRP', moyen_model: 'PRM' },
    { nom_categorie: 'Pierre', grand_model: 'PEG', petit_model: 'PEP', moyen_model: 'PEM' },
    { nom_categorie: 'Piercing', grand_model: 'PCG', petit_model: 'PCP', moyen_model: 'PCM' },
    { nom_categorie: 'Fetiche', grand_model: 'FEG', petit_model: 'FEP', moyen_model: 'FEM' },
    { nom_categorie: 'Chapelet', grand_model: 'CPG', petit_model: 'CPP', moyen_model: 'CPM' },
    { nom_categorie: 'Colliers', grand_model: 'COG', petit_model: 'COP', moyen_model: 'COM' },
  ];
  public category:any ='';
  comment: any = '';
  categories: any[];
  systeme_vente:any;
  stocks: any[];
  modeles:any[];
  user_id:any;
  titres:any[];
  titress:any;
  modeless:any;
  limiteDepassee: boolean = false;
  stockss:any;
  itemss2: any = [];
  selectedCategory: any;
  selectedTitre: any;
  selectedModele: any;
  nbrepieces: number = 1;
  heure : Date = new Date();
  name :string ='';
  reffacture :any ='';
  formatmodel: string;
  totalitems :number=0;
  totalpoids:number=0;
  totalpieces:number=0;
  location_name:any;
  nbre:number;
  identification:any;
  items: any = [];
  limit: number = 10;
  start: number = 0;
  //sale_status: string = '';
  item_id: string = '';
 
  quantity: number = 0;
  poids: number = 0;
  item_location: any = '';
  prix_du_g :number;
 pet:any;
 pett:any;
  sale_id: number;
  codeacces: any;
  username:string='';

  anggota: any;
  public showCamera = false;
  public titre: any = '';
  isFlashlight = false;
  constructor(  private postPvdr: PostProvider,
    private router: Router,
    private alertController: AlertController,
    public toastController: ToastController,
    private actRoute: ActivatedRoute,
    private storage: Storage,
    private qrScanner: QRScanner,
    private torchLight: Flashlight,
    private nativeAudio: NativeAudio, 
    private alertCtrl:AlertController,
    private barcodeScanner: BarcodeScanner,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet, private platform: Platform
    ) { 
      this.pet='caisse';
      this.pett='caisseb';
     // this.getRandomString(4);
   //   this.reffacture=cryptoRandomString({length: 10, characters: 'abc'});

         // this.scanCode();
     //this.scanBarcode();
     this.ionViewWillEnter();
      
    }

     getRandomString(length) {
      var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var result = '';
      for ( var i = 0; i < length; i++ ) {
          result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
          this.reffacture = result;
        }
      return this.reffacture;
  }
  
  //usage: getRandomString(20); // pass desired length of random string
  
    ionViewWillEnter() {
      if (this.platform.is('ios')) {
        this.routerOutlet.swipeGesture = false; // désactive le swipe retour pour cette page
      }
      this.items = [];
      this.itemss2 = [];
      this.start = 0;
      this.loadItems();
      this.storage.get('session_storage').then((res) => {
        this.anggota = res;
        this.username = this.anggota.username;
        this.identification = this.anggota.identification;
        this.codeacces = this.anggota.codeacces;
        this.item_location = this.anggota.item_location;
        this.user_id = this.anggota.user_id;
        this.nbre= 0;
      });
    }

  ngOnInit() {
   // this.getRandomString(4);
  }
// Définition de l'objet de correspondance des abréviations de modèle par catégorie
verifierLimitePieces() {
  this.limiteDepassee = this.nbrepieces > 30;
}

// Fonction pour retourner l'abréviation du modèle en fonction du nom de la catégorie
getModeleAbrege(nomCategorie: string): string {
  // Vérifier si la catégorie a une correspondance d'abréviation de modèle
  if (modeleAbregeParCategorie.hasOwnProperty(nomCategorie)) {
    return modeleAbregeParCategorie[nomCategorie];
  } else {
    return '';
  }
}

// Fonction pour gérer le changement de catégorie
onChange(event) {
  const categorieInfo = this.categories.find(cat => cat.nom_categorie === this.category);
  
  if (categorieInfo) {
    const modeleAbrege = this.getModeleAbrege(categorieInfo.nom_categorie);
    this.name = modeleAbrege;
  }
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
    this.loadItems().then(() => {
    event.target.complete();
    });
    }, 500);
  }

  async confirmDeleteAll() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer tous les codes-barres ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Supprimer',
          handler: () => {
            // Action de suppression
            this.deleteAll();
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  deleteAll() {
    let body = {
      aksi: 'deleteallbarcode',
      identification: this.identification,
      user_id: this.user_id,
    };
  
    this.postPvdr.postData(body, 'file_aksi.php').subscribe(data => {
      this.ionViewWillEnter();
    });
  }
  delItems(id) {
    let body = {
        aksi: 'deleteitems',
        item_id : id
      };

    this.postPvdr.postData(body, 'file_aksi.php').subscribe(data => {
        this.ionViewWillEnter();
      });
  }

  loadItems() {
    return new Promise(resolve => {
      let body1 = {
        aksi: 'getallcategorie',
        limit : this.limit,
        start : this.start,
        identification : this.identification,
      };
      let bodyst = {
        aksi: 'getallstock',
        limit : this.limit,
        start : this.start,
        identification : this.identificationchoix,
      };

     
      let bodytit = {
        aksi: 'getalltitre',
        limit : this.limit,
        start : this.start,
        identification : this.identification,
      };

      let body = {
        aksi: 'getbarcodesliste',
        limit : this.limit,
        start : this.start,
        codeacces : this.user_id,
      };
      let bodys = {
        aksi: 'getbarcodesliste2',
        limit : this.limit,
        start : this.start,
        codeacces : this.user_id,
      };

      let body2 = {
        aksi: 'gettotalbarcodes',
        limit : this.limit,
        start : this.start,
        codeacces : this.user_id,
      };

      this.postPvdr.postData(body, 'file_aksi.php').subscribe(data => {
        for (let item of data.result) {
         
          this.items.push(item);
         
        }
        resolve(true);
      });
      this.postPvdr.postData(bodys, 'file_aksi.php').subscribe(data => {
        for (let item of data.result) {
         
          this.itemss2.push(item);
         
        }
        resolve(true);
      });

     // ✅ Compatible anciens TS/targets
this.postPvdr.postData(body2, 'file_aksi.php').subscribe((data: any) => {
  // Sécuriser l'accès
  var r = (data && typeof data === 'object') ? data.result : null;

  if (r && !Array.isArray(r) && typeof r === 'object') {
    // result = objet unique
    this.totalitems    = Number(r.totalitems != null ? r.totalitems : 0);
    this.totalpoids    = Number(r.totalpoids  != null ? r.totalpoids  : 0);
    this.totalpieces   = Number(r.totalpieces != null ? r.totalpieces : 0);
    this.location_name = (r.location_name != null ? String(r.location_name) : '');
  } else if (Array.isArray(r) && r.length > 0) {
    // result = tableau → on prend la 1ère ligne
    var item = r[0];
    this.totalitems    = Number(item && item.totalitems != null ? item.totalitems : 0);
    this.totalpoids    = Number(item && item.totalpoids  != null ? item.totalpoids  : 0);
    this.totalpieces   = Number(item && item.totalpieces != null ? item.totalpieces : 0);
    this.location_name = (item && item.location_name != null ? String(item.location_name) : '');
  } else {
    // défaut si rien
    this.totalitems    = 0;
    this.totalpoids    = 0;
    this.totalpieces   = 0;
    this.location_name = '';
  }

  resolve(true);
}, function(_err: any){
  // défaut en cas d'erreur réseau
  this.totalitems    = 0;
  this.totalpoids    = 0;
  this.totalpieces   = 0;
  this.location_name = '';
  resolve(true);
}.bind(this));

      this.postPvdr.postData(body1, 'file_aksi.php').subscribe(data => {
        this.categories = data.result;
        resolve(true);
      });

      this.postPvdr.postData(bodyst, 'file_aksi.php').subscribe(data => {
        this.stocks = data.result;
        resolve(true);
      });

   

      this.postPvdr.postData(bodytit, 'file_aksi.php').subscribe(data => {
        this.titres = data.result;
        resolve(true);
      });


    });
  }
  

 

 


  retourachat(){
    this.router.navigate(['/barcodes']);
  }

  updateItem(id,category,type_or,systeme_vente) {
    this.router.navigate(['/updateitem/' + id + '/' + category + '/' + type_or+ '/'+ systeme_vente+ '/']);
  }
  

 
 

  annulerq(){
    this.router.navigate(['/customer']);
  }
  





  async showAlert() {
    await this.alertCtrl.create({
header:"#Retenez bien Ce Code#",
inputs:[
{
  label:'REF - FACTURE ',
  type:'text', disabled:true, name:'reffacture',value:this.getRandomString(4)
  
}

],

buttons:[
{text:'Valider et Termine',handler:(res)=>{
  this.reffacture=res.reffacture;
 
  this.createdProsesitemsUpdate();

}

},{
text:"Annuler"
}
]
    }).then(res =>res.present());
  }

  async confirmerGeneration() {
    if (!this.nbrepieces || this.nbrepieces <= 0) {
      const toast = await this.toastController.create({
        message: 'Veuillez entrer un nombre de pièces valide supérieur à 0',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }
  
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Vous êtes sur le point de générer ${this.nbrepieces} barcodes pour la catégorie ${this.category}  Continuer?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Génération annulée');
          }
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.createdProsesitems();
          }
        }
      ]
    });
  
    await alert.present();
  }
  

  async confirmerGenerationp() {
    if (this.nbrepieces > 30) {
      const alert = await this.alertController.create({
        header: 'Limite dépassée',
        message: 'Le nombre de pièces ne peut pas dépasser 50.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
  
    if (!this.nbrepieces || this.nbrepieces <= 0) {
      const toast = await this.toastController.create({
        message: 'Veuillez entrer un nombre de pièces valide supérieur à 0',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Vous êtes sur le point de générer ${this.nbrepieces} barcodes pour la catégorie ${this.category} pour poids. Continuer?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Génération annulée');
          }
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.createdProsesitemsp();
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  
  async createdProsesitems() {
    
    if(this.titress==''){
     
      alert('Aucun titre choisi')
    }else if(this.name==''){
      alert('Aucune categorie choisie')
    } else if(this.modeless==''){
      alert('Aucune modele choisie')
    } 
    else if(this.titress==''){
      alert('Aucune titre choisie')
    } 
    else if(this.stockss==''){
      alert('Aucune stock choisie')
    } 
    else if(this.prix_du_g==0){
      alert('Metter votre prix de revient')
    }  
    else{
      let body = {
        aksi: 'additems',
        //comment : this.comment,
        item_location:this.stockss,
        titre : this.titre,
        systeme_venteb:'barcode',
        titress:this.titress,
        category:this.category,
        prix_du_g:this.prix_du_g,
        heure:this.heure,
        nbrepieces: this.nbrepieces,
        //reffacture:this.reffacture,
        name:this.name,
       // sale_status : '1',
        codeacces:this.user_id,
        username:this.username,
       // quantity:this.quantity,
         poids:this.poids,
        //item_location:this.item_location
       
      };
      this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
        var alertpesan = data.msg;
        if (data.success) {
        //  this.closeCameraachat();
          //this.router.navigate(['/barcodes']);
          this.ionViewWillEnter();
         
          
        } else {
         
          const toast = await this.toastController.create({
            message: 'Erreur Ce titre est deja Scanner ',
            duration: 2000
          });
          toast.present();
         
        }
        
      });
    }
    
    
  
}

async createdProsesitemsp() {
    
  if(this.titress==''){
   
    alert('Aucun titre choisi')
  }else if(this.name==''){
    alert('Aucune categorie choisie')
  } else if(this.modeless==''){
    alert('Aucune modele choisie')
  } 
  else if(this.titress==''){
    alert('Aucune titre choisie')
  } 
  else if(this.stockss==''){
    alert('Aucune stock choisie')
  } 
  else if(this.prix_du_g==0){
    alert('Metter votre prix de revient')
  }  
  else{
    let body = {
      aksi: 'additemsp',
      //comment : this.comment,
      item_location:this.stockss,
      titre : this.titre,
      titress:this.titress,
      systeme_ventep:'poids',
      category:this.category,
      prix_du_g:this.prix_du_g,
      heure:this.heure,
      nbrepieces: this.nbrepieces,
      //reffacture:this.reffacture,
      name:this.name,
     // sale_status : '1',
      codeacces:this.user_id,
      username:this.username,
      quantity:this.quantity,
       poids:this.poids,
      //item_location:this.item_location
     
    };
    this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
      var alertpesan = data.msg;
      if (data.success) {
      //  this.closeCameraachat();
        //this.router.navigate(['/barcodes']);
        this.ionViewWillEnter();
       
        
      } else {
       
        const toast = await this.toastController.create({
          message: 'Erreur Ce titre est deja Scanner ',
          duration: 2000
        });
        toast.present();
       
      }
      
    });
  }
  
  

}


async createdProsesitemsUpdate() {
  if(this.name==''){
    const toast = await this.toastController.create({
      message: 'Aucune numero de facture',
      duration: 2000
    });
  } 
  else{
    let body = {
      aksi: 'finalisebarcode2',
      //comment : this.comment,
      titre : this.titre,
      category:this.category,
      reffacture:this.reffacture,
      name:this.name,
     // sale_status : '1',
      codeacces:this.codeacces,
      user_id:this.user_id,
      username:this.username,
      quantity:this.quantity,
       poids:this.poids,
      //item_location:this.item_location
     
    };
    this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
      var alertpesan = data.msg;
      if (data.success) {
      //  this.closeCameraachat();
      this.name='';
      
        this.router.navigate(['/customer']);
        this.ionViewWillEnter();
       
        
      } else {
       
        const toast = await this.toastController.create({
          message: 'Erreur Ce titre est deja Scanner ',
          duration: 2000
        });
        toast.present();
       
      }
      
    });
  }
  
  

}

// Dans votre composant TypeScript
getCategoryColor(category: string): string {
  // Vous pouvez définir la logique pour attribuer une couleur à chaque catégorie ici
  // Par exemple, renvoyer "primary" pour la catégorie "A", "secondary" pour "B", etc.
  // Ou vous pouvez utiliser du CSS personnalisé pour définir des couleurs spécifiques.
  return 'danger';
}
getCountByCategory(category: string): number {
  return this.items.filter(item => item.category === category).length;
}


}
