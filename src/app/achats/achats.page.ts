import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController,AlertController } from '@ionic/angular';
import { PostProvider } from '../../providers/post-provider';
import { Storage } from '@ionic/storage';
import { QRCodeModule } from 'angularx-qrcode';
import { Network } from '@ionic-native/network/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';

@Component({
  selector: 'app-achats',
  templateUrl: './achats.page.html',
  styleUrls: ['./achats.page.scss'],
})
export class AchatsPage implements OnInit {

  achats: any = [];
  limit: number = 10;
  start: number = 0;
  username: string;
  anggota: any;
  comment:string;
  codeacces: any;
  totalachats:any;
  nbre:any;
  require:any;
  id:number;

  constructor(
    private router: Router,
    private postPvdr: PostProvider,
    public toastController: ToastController,
    private storage: Storage,
    public network:Network,
    public dialog:Dialogs,
    public alertCtrl:AlertController
  ) { 
    
    this.network.onDisconnect().subscribe(()=>{
    
      setTimeout(()=>{
        this.dialog.alert('Attention !!! vous navez plus de connexion Internet Verifier Votre Wifi ou Donne Mobile');
              },3000);
  
    });
    this.network.onConnect().subscribe(()=>{
    
    })
  }
  slidesOptions = {
    slidesPerView: 1.5
  }

  ngOnInit() {
    //this.ionViewWillEnter();
  }
montrer(){
  this.showAlert();
}
testconnexion(){
  this.network.onDisconnect().subscribe(()=>{
    
    setTimeout(()=>{
      this.dialog.alert('Attention !!! vous navez plus de connexion Internet Verifier Votre Wifi ou Donne Mobile');
            },3000);

  });
}

  
  async showAlert() {
    await this.alertCtrl.create({
header:"Entrer le nom et telephone du Client",
inputs:[{
type:'text',name:'comment'
}],
buttons:[
{text:'Valider',handler:(res)=>{
  this.comment=res.comment;

}

},{
text:"Annuler"
}
]
    }).then(res =>res.present());
  }

  ionViewWillEnter() {
    this.achats = [];
    this.start = 0;
    this.loadAchats();
    this.storage.get('session_storage').then((res) => {
      this.anggota = res;
      this.username = this.anggota.username;
      this.codeacces = this.anggota.codeacces;
      this.nbre= 0;
    });
  }

  async proseslogout() {
    this.router.navigate(['/customer']);

  }


  addCustomer() {
  //  alert('test');
    this.router.navigate(['/scanachats']);
  }
  acceuil(){
    this.router.navigate(['/customer']);
  }
  addCustomerb() {
    this.router.navigate(['/addcustomer']);
  }

  updateAchat(id,titre) {
    this.router.navigate(['/updateachat/' + id + '/' + titre ]);
  }

  showAchat(id, titre) {
    this.router.navigate(['/showcustomer/' + id + '/' + titre ]);
  }
  envoicaisse(){
    alert('je marche lenvoie...');
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
    this.loadAchats().then(() => {
    event.target.complete();
    });
    }, 500);
  }


  delCustomers(id) {
    let body = {
        aksi: 'deleteachats',
        achat_id : id
      };

    this.postPvdr.postData(body, 'file_aksi.php').subscribe(data => {
        this.ionViewWillEnter();
      });
  }

  loadAchats() {
    return new Promise(resolve => {
      let body = {
        aksi: 'getachats',
        limit : this.limit,
        start : this.start,
        codeacces : this.codeacces,
      };

      let body2 = {
        aksi: 'gettotalachats',
        limit : this.limit,
        start : this.start,
        codeacces : this.codeacces,
      };

      this.postPvdr.postData(body, 'file_aksi.php').subscribe(data => {
        for (let achat of data.result) {
         
          this.achats.push(achat);
         
        }
        resolve(true);
      });

      this.postPvdr.postData(body2, 'file_aksi.php').subscribe(data => {
        for (let achat of data.result) {
          this.nbre =0;
          this.totalachats =achat.totalachats;
        
         
        }
        resolve(true);
      });
    });
  }
  

  async createdProses() {
     if(this.comment==''){
      const toast = await this.toastController.create({
        message: 'Les infos du clients st obligatoires',
        duration: 2000
      });
    }
   
     else {
      let body = {
        aksi: 'envoiecaisseachats',
        comment : this.comment,
     
       // sale_status : '1',
        codeacces:this.codeacces,
       
       
      };
      this.postPvdr.postData(body, 'file_aksi.php').subscribe( async data => {
        var alertpesan = data.msg;
        if (data.success) {
          
          const toast = await this.toastController.create({
            message: 'Les achats ont été bien envoyé a la caisse ',
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

}