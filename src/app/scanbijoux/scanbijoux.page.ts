import { Component, OnInit } from '@angular/core';
import { PostProvider } from '../../providers/post-provider';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { Storage } from '@ionic/storage';
import { Flashlight } from '@ionic-native/flashlight/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { MoninventairePage } from '../moninventaire/moninventaire.page';




@Component({
  selector: 'app-scanbijoux',
  templateUrl: './scanbijoux.page.html',
  styleUrls: ['./scanbijoux.page.scss'],
})
export class ScanbijouxPage implements OnInit {
  scannedData: any;
  encodedData: '';
  codeboutique:string='';
  encodeData: any;
  inputData: any;
  qrData = null;
  createdCode = null;
  scannedCode = null;
  comment: any = '';
  customers: any = [];
  limit: number = 10;
  start: number = 0;
  //sale_status: string = '';
  item_id: string = '';
  quantity: number = 0;
  prix_vente_g:number;
  poids: number = 0;
  stockname:string='';
  location_id:number=0;
  public item_locationss: number ;
 
  sale_id: number;
  codeacces: any;
  item_location:any;
  name:String ='';
  anggota: any;
  public showCamera = false;
  public textScanned: any = '';
  isFlashlight = false;
  constructor(  private postPvdr: PostProvider,
    private router: Router,
    public toastController: ToastController,
    private actRoute: ActivatedRoute,
    private storage: Storage,
    private qrScanner: QRScanner,
    private torchLight: Flashlight,
    private nativeAudio: NativeAudio, 
    private alertCtrl:AlertController,
    public network:Network,
      public dialog:Dialogs,
      private barcodeScanner: BarcodeScanner,
      public loadingController: LoadingController
      
     
    ) { 

     // this.scanCode();
   // this.scanBarcode();
      
    }
    scanBarcode() {
      const options: BarcodeScannerOptions = {
        preferFrontCamera: false,
        showFlipCameraButton: false,
        showTorchButton: true,
        torchOn: false,
        prompt: 'placer le barcode pour scanner',
        resultDisplayDuration: 10,
        formats: 'EAN_13,EAN_8,CODE_128,QR_CODE,PDF_417',
        orientation: 'portrait',
      };
  
      this.barcodeScanner.scan(options).then(barcodeData => {
        if (barcodeData.cancelled) {
          console.log("User cancelled the action!");
          this.retour();
        
          return false;
        }
       
       // this.scannedCode=barcodeData.text;
       
        this.scannedData = barcodeData.text;
        this.item_id=this.scannedData;
        
         // this.verif();
          this.qrcodeexist();
      }).catch(err => {
        console.log('Error', err);
      });
    }
  
  
    ionViewWillEnter() {
     
      this.storage.get('session_storage').then((res) => {
        this.anggota = res;
        this.codeacces = this.anggota.codeacces;
        this.item_location = this.anggota.item_location;
      });
    }

  ngOnInit() {
  }

  playaudio(){
    this.nativeAudio.preloadComplex('right', 'assets/son.wav',3,1,1);
  this.nativeAudio.play('right');
  }
  playaudiofalse(){
    this.nativeAudio.preloadComplex('right', 'assets/false.wav',3,1,1);
  this.nativeAudio.play('right');
  }
  turnOnTorch(){
    if(this.torchLight.available()){
      this.isFlashlight = false;
      this.torchLight.switchOn();
    }else{
      alert("Flashlight doesn't exist");
    }
  }

  turnOffTorch(){
    this.isFlashlight = true;
    this.torchLight.switchOff();
  }
  addCustomer() {
    this.router.navigate(['/scanbijoux']);
  }
  retour(){
    this.router.navigate(['/customer']);
  }
  verifCode(){
    return new Promise(resolve => {
      let body = {
        aksi: 'getqrcode',
        //limit : this.limit,
        //start : this.start,
        item_id : this.item_id,
        item_location:this.item_location,
      };

      this.postPvdr.postData(body, 'file_aksi.php').subscribe(data => {
        for (let customer of data.result) {
          this.customers.push(customer);
          this.poids = customer.poids;
          this.quantity=customer.quantity;
          this.prix_vente_g = customer.prix_vente_g;
          this.location_id=customer.location_id;

        }
        resolve(true);
      });
    });
  }
  testconnecion(){
    this.network.onDisconnect().subscribe(()=>{
    
      setTimeout(()=>{
        this.dialog.alert('Attention !!! vous navez plus de connexion Internet Verifier Votre Wifi ou Donne Mobile');
              },3000);
  
    });
  }
  scanCode() {
    this.showCamera = true;
    // Optionally request the permission early
    this.qrScanner.prepare()
    .then((status: QRScannerStatus) => {
      if (status.authorized) {
        // start scanning
       // console.log('Scan en cours...' + JSON.stringify(status));
       
        let scanSub = this.qrScanner.scan().subscribe((text: String) => {
        //  console.log('Scanned something', text.result);
       
          this.textScanned = text;
          this.item_id=this.textScanned;
        
         // this.verif();
          this.qrcodeexist();
         
         //this.createdProses();
          //this.comment=this.textScanned;
      //this.sale_status='1';
      
          //this.qrScanner.hide(); // hide camera preview
          //this.closeCamera();
          //this.addCustomer();
          
           
          
          
          
         
       
          scanSub.unsubscribe(); // stop scanning
          
          this.showCamera = false;
        
        });
      } else if (status.denied) {
        // camera permission was permanently denied
      } else {
        // permission was denied, but not permanently. You can ask for permission again at a later time.
      }
    })
    .catch((e: any) => console.log('Error is', e));
  }

  closeCamera() {
    this.showCamera = false;
    this.qrScanner.hide(); // hide camera preview
    this.qrScanner.destroy();
    this.turnOffTorch();
    this.retour();
    
  }


  async verificationcode() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Nous verifions la reference un instant ...',
      duration: 1000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    this.showAlert();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Patienter Un Instant svp ...',
      duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    this.showAlert();
  }

  async qrcodeexist() {
    this.verifCode();
    if (this.poids == 0) {
      this.presentLoading();
      
    

    }
   
  }
  async erreurboutique(){


    await this.alertCtrl.create({
      header:"INFORMATION  DU BIJOUX",
      message:'REF-BIJOUX =>'+'<b style="color:red">'+this.item_id+'</b>'+'<br>'+'Poids => '+'<b>'+this.poids +'</b>' +' (g) ' +'<br>'+'Nbre Piece => '+'<b>'+this.quantity+'</b>' +'(p)'+ '<br>'+'Vitrine  =>'+this.stockname +'?',
      
      buttons:[
      {text:'Continuer',handler:(res)=>{
       
        this.createdProses();
        }
      
      },
      
      {
      text:"Annuler",handler:(res)=>{
        this.closeCamera();
      
      }
      }
      ]
          }).then(res =>res.present());
  }

  async showAlert() {
    await this.alertCtrl.create({
      header: "",
      message: 'Un bijoux détecté en vente. Voulez-vous confirmer le scan ?',
      buttons: [
        {
          text: 'Continuer',
          handler: (res) => {
            this.verifCode();
            if (this.poids == 0) {
              this.playaudiofalse();
              alert('Erreur: Ce Bijou n\'est pas reconnu dans le système');
              this.closeCamera();
            } else if (this.location_id == this.item_location) {
            
             
              if (this.location_id == 39) {
                this.stockname = 'Stock RECYCLAGE HML';
  
                // Demander à l'utilisateur si c'est une vente par façon ou normale
                this.alertVenteType();
              }
              if (this.location_id == 38) {
                this.stockname = 'Stock RECYCLAGE LIBERTE5';
  
                // Demander à l'utilisateur si c'est une vente par façon ou normale
                this.alertVenteType();
              }
              if (this.location_id == 34) {
                this.stockname = 'Stock Barcode';
  
                // Demander à l'utilisateur si c'est une vente par façon ou normale
                //this.alertVenteType();
              }
              if (this.location_id == 35) {
                this.stockname = 'Stock HLM POIDS RECU ';
  
                // Demander à l'utilisateur si c'est une vente par façon ou normale
                this.alertVenteType();
              }
              if (this.location_id == 36) {
                this.stockname = 'Stock Barcode LIBERTE 5';
  
                // Demander à l'utilisateur si c'est une vente par façon ou normale
                this.alertVenteType();
              }
              if (this.location_id == 37) {
                this.stockname = 'Stock ARRIVAGE VOYAGE';
  
                // Demander à l'utilisateur si c'est une vente par façon ou normale
                this.alertVenteType();
              }
  
             this.erreurboutique();
            } else {
              // Cas où le bijou est dans le bon endroit
              this.createdProses();
            }
          }
        },
        {
          text: "Annuler",
          handler: (res) => {
            this.closeCamera();
          }
        }
      ]
    }).then(res => res.present());
  }
  
  // Nouvelle fonction pour gérer le choix du type de vente
  async alertVenteType() {
    const alert = await this.alertCtrl.create({
      header: 'Type de Vente',
      message: 'Veuillez sélectionner le type de vente',
      buttons: [
        {
          text: 'Par Barcode',
          handler: () => {
            this.updateVenteType('Facon');
            this.createdProses();
          }
        },
        {
          text: 'Avec Poids',
          handler: () => {
            this.updateVenteType('Normale');
            this.createdProses();
          }
        },
        {
          text: 'Annuler',
          handler: () => {
            this.closeCamera();
          }
        }
      ]
    });
    alert.present();
  }
  
  // Fonction pour mettre à jour le type de vente
  async updateVenteType(typeVente: string) {
    let body = {
      aksi: 'updatevty',
      item_id: this.item_id,
      type_v: typeVente // Mise à jour du type de vente
    };
  
    // Envoi de la requête pour modifier le type_v de l'item_id concerné
    this.postPvdr.postData(body, 'file_aksi.php').subscribe(async data => {
      if (data.success) {
        console.log(`Le type de vente pour l'item ${this.item_id} a été mis à jour à ${typeVente}.`);
      } else {
        const toast = await this.toastController.create({
          message: 'Erreur lors de la mise à jour du type de vente.',
          duration: 2000
        });
        toast.present();
      }
    });
  }
  
  async createdProses() {
    if (this.poids == 0) {
      alert('Erreur Qr code');
       this.closeCamera();
       //this.scanCode();
     }else{
      let body = {
        aksi: 'add',
        //comment : this.comment,
        item_id : this.item_id,
       // sale_status : '1',
        codeacces:this.codeacces,
        quantity:this.quantity,
         poids:this.poids,
        item_location:this.location_id,
        prix_vente_g:this.prix_vente_g,
       
      };
      this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
        var alertpesan = data.msg;
        if (data.success) {
          this.retour();
          
        } else {
          this.playaudiofalse();
          const toast = await this.toastController.create({
            message: 'Erreur Ce bijoux est deja Scanner ',
            duration: 2000
          });
          toast.present();
          this.closeCamera();
        }
        
      });
    
  }
}

}
