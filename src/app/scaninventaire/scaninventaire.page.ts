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



@Component({
  selector: 'app-scaninventaire',
  templateUrl: './scaninventaire.page.html',
  styleUrls: ['./scaninventaire.page.scss'],
})
export class ScaninventairePage implements OnInit {
  scannedData: any;
  encodedData: '';
  encodeData: any;
  inputData: any;
  qrData = null;
  createdCode = null;
  scannedCode = null;
  comment: any = '';
  customers: any = [];
  limit: number = 10;
  start: number = 0;
  totallus:any;
  totalstock:any;
  totalstocklus:any;
  nbrepiece:any;
  nbre:any;
  selectedTab:any;
  //sale_status: string = '';
  item_id: string = '';
  quantity: number = 0;
  prix_vente_g:number;
  poids: number = 0;
  item_location: number ;
 
  sale_id: number;
  codeacces: any;
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
    this.scanBarcode();
    this.selectedTab='inventory';
      
    }

  

    scanBarcode() {
      const options: BarcodeScannerOptions = {
        preferFrontCamera: false,
        showFlipCameraButton: true,
        showTorchButton: true,
        torchOn: false,
        prompt: 'Place a barcode inside the scan area',
        resultDisplayDuration: 500,
        formats: 'EAN_13,EAN_8,CODE_128,QR_CODE,PDF_417',
        orientation: 'portrait',
      };
  
      this.barcodeScanner.scan(options).then(barcodeData => {
        if (barcodeData.cancelled) {
          console.log("User cancelled the action!");
          this.retour2();
        
          return false;
        }
       // this.scannedCode=barcodeData.text;
       
        this.scannedData = barcodeData.text;
        this.item_id=this.scannedData;
        
         // this.verif();
          this.createdProses();
      }).catch(err => {
        console.log('Error', err);
      });
    }

    doRefresh(event) {
      setTimeout(() => {
        this.ionViewWillEnter();
        event.target.complete();
      }, 100);
    }
  
    loadData(event: any) {
      this.start += this.limit;
      setTimeout(() => {
      this.loadCustomer().then(() => {
      event.target.complete();
      });
      }, 500);
    }
  
  
    ionViewWillEnter() {
     
      this.customers = [];
      this.start = 0;
      this.loadCustomer();
      this.storage.get('session_storage').then((res) => {
        this.anggota = res;

        this.codeacces = this.anggota.codeacces;
        this.anggota = res;
        this.codeacces = this.anggota.codeacces;
        this.item_location = this.anggota.item_location;
        this.item_location = this.anggota.item_location;
        this.nbre= 0;
      });

    
    }

  ngOnInit() {
    this.scanBarcode();
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
    this.router.navigate(['/moninventaire']);
  }
  retour2(){
    this.router.navigate(['/scaninventaire']);
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
         // this.item_location=customer.item_location;

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
          this.createdProses();
         
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
  closeCamera2() {
    this.showCamera = false;
    this.qrScanner.hide(); // hide camera preview
    this.qrScanner.destroy();
    this.scanBarcode();
    //this.turnOffTorch();
   // this.retour2();
    
  }

  async presentLoading() {
   
    this.showAlert();
  }

  async qrcodeexist() {
    this.verifCode();
    if (this.poids == 0) {
      this.showAlert();
      
    

    }
   
  }

  async showAlert() {
    await this.alertCtrl.create({
header:"Validation du bijoux ",

buttons:[
{text:'Valider',handler:(res)=>{

    //this.playaudio();
    this.createdProses();
  
  

}

},{
text:"Annuler",handler:(res)=>{
  this.closeCamera();

}
}
]
    }).then(res =>res.present());
  }
  async verif(){
    const toast = await this.toastController.create({
      message: 'Verification en cours.... ',
      duration: 2000
    });
    toast.present();
  }

  delCustomers(id) {
    let body = {
        aksi: 'deleteinventaire',
        num_sale : id
      };

    this.postPvdr.postData(body, 'file_aksi.php').subscribe(data => {
        this.ionViewWillEnter();
      });
  }

  async createdProses2() {
    if(this.codeacces==''){
     const toast = await this.toastController.create({
       message: 'Identifier vous pour valider',
       duration: 2000
     });
   }
  
    else {
     let body = {
       aksi: 'marquelu',
       comment : this.comment,
    
      // sale_status : '1',
       codeacces:this.codeacces,
       item_location : this.item_location,
      
      
     };
     this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
       var alertpesan = data.msg;
       if (data.success) {
         
         const toast = await this.toastController.create({
           message: 'Les barcodes ont été bien validés',
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




 async createdProses5(item_id) {
  if (item_id == '') {
    alert('Indiquer le numero de barcode svp');
     this.closeCamera();
    // this.scanBarcode();
   }else{
    let body = {
      aksi: 'additeminventory',
      //comment : this.comment,
      item_id : item_id,
     // sale_status : '1',
      codeacces:this.codeacces,
     // quantity:this.quantity,
       //poids:this.poids,
      //item_location:this.item_location,
      //prix_vente_g:this.prix_vente_g,
     
    };
    this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
      var alertpesan = data.msg;
      if (data.success) {
        this.closeCamera();
     this.scanBarcode();
        //this.router.navigate(['/scaninventaire']);
      } else {
        this.playaudiofalse();
        const toast = await this.toastController.create({
          message: 'Erreur Ce bijoux est deja Scanner ',
          duration: 2000
        });
        toast.present();
        this.closeCamera();
    this.scanBarcode();
      }
      
    });
  
}
}

  async createdProses() {
    if (this.item_id == '') {
      alert('Jai fini le decompte');
       this.closeCamera();
      // this.scanBarcode();
     }else{
      let body = {
        aksi: 'additeminventory',
        //comment : this.comment,
        item_id : this.item_id,
       // sale_status : '1',
        codeacces:this.codeacces,
       // quantity:this.quantity,
         //poids:this.poids,
        //item_location:this.item_location,
        //prix_vente_g:this.prix_vente_g,
       
      };
      this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
        var alertpesan = data.msg;
        if (data.success) {
          this.closeCamera();
       this.scanBarcode();
          //this.router.navigate(['/scaninventaire']);
        } else {
          this.playaudiofalse();
          const toast = await this.toastController.create({
            message: 'Erreur Ce bijoux est deja Scanner ',
            duration: 2000
          });
          toast.present();
          this.closeCamera();
      this.scanBarcode();
        }
        
      });
    
  }
}


loadCustomer() {
  return new Promise(resolve => {
    let body = {
      aksi: 'getdatainventaire2',
      limit : this.limit,
      start : this.start,
      codeacces : this.codeacces,
      item_location : this.item_location,
    };

    let body2 = {
      aksi: 'gettotallus',
      limit : this.limit,
      start : this.start,
      codeacces : this.codeacces,
      item_location : this.item_location,
    };
     let body3 = {
      aksi: 'gettotalnonlus',
      limit : this.limit,
      start : this.start,
      codeacces : this.codeacces,
      item_location : this.item_location,
    };
    let body4 = {
      aksi: 'gettotalvalide',
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
        this.totallus = customer.totallus;
       // this.nbrepiece= customer.nbrepiece;
      
       
      }
      resolve(true);
    });

    this.postPvdr.postData(body3, 'file_aksi.php').subscribe(data => {
      for (let customer of data.result) {
        this.nbre =0;
        this.totalstock = customer.totalstock;
       // this.nbrepiece= customer.nbrepiece;
      
       
      }
      resolve(true);
    });

    this.postPvdr.postData(body4, 'file_aksi.php').subscribe(data => {
      for (let customer of data.result) {
        this.nbre =0;
        this.totalstocklus = customer.totalstocklus;
       // this.nbrepiece= customer.nbrepiece;
      
       
      }
      resolve(true);
    });


  });
}

validertableau(){
  this.showConfirmvente();
}

async showConfirmvente() {
  await this.alertCtrl.create({
header:"Voulez vous Confirmer la lecture de ce plateau ",

buttons:[
{text:'Confirmer',handler:(res)=>{


  //this.playaudio();
  this.createdProses2();



}

},{
text:"Annuler",handler:(res)=>{


}
}
]
  }).then(res =>res.present());
}




}